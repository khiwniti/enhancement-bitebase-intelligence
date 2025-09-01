"""
BiteBase Intelligence Dashboard Service
Business logic for dashboard operations
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
import uuid
import json
from datetime import datetime, timedelta
import logging

from app.models.dashboard import Dashboard, DashboardWidget, DashboardShare, DashboardExport
from app.schemas.dashboard import (
    DashboardCreate, DashboardUpdate, DashboardSearchParams,
    DashboardWidgetCreate, DashboardWidgetUpdate,
    ShareSettings, ExportOptions, DuplicateRequest
)

logger = logging.getLogger(__name__)


class DashboardService:
    """Service class for dashboard operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_dashboard(self, dashboard_data: DashboardCreate) -> Dashboard:
        """Create a new dashboard"""
        try:
            # Convert Pydantic models to JSON for storage
            layout_config = dashboard_data.layout.model_dump() if dashboard_data.layout else {}
            theme_config = dashboard_data.theme.model_dump() if dashboard_data.theme else {}
            settings_config = dashboard_data.settings.model_dump() if dashboard_data.settings else {}
            
            dashboard = Dashboard(
                name=dashboard_data.name,
                description=dashboard_data.description,
                user_id=str(dashboard_data.user_id),
                author=dashboard_data.author,
                layout_config=layout_config,
                theme_config=theme_config,
                settings_config=settings_config,
                is_public=dashboard_data.is_public,
                tags=dashboard_data.tags or []
            )
            
            self.db.add(dashboard)
            await self.db.commit()
            await self.db.refresh(dashboard)
            
            logger.info(f"Created dashboard {dashboard.id} for user {dashboard.user_id}")
            return dashboard
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating dashboard: {str(e)}")
            raise
    
    async def get_dashboard(self, dashboard_id: uuid.UUID, user_id: Optional[uuid.UUID] = None) -> Optional[Dashboard]:
        """Get a dashboard by ID with optional user access check"""
        try:
            query = select(Dashboard).options(
                selectinload(Dashboard.widgets)
            ).where(Dashboard.id == str(dashboard_id))
            
            # Add user access check if user_id provided
            if user_id:
                query = query.where(
                    or_(
                        Dashboard.user_id == str(user_id),
                        Dashboard.is_public == True
                    )
                )
            
            result = await self.db.execute(query)
            dashboard = result.scalar_one_or_none()
            
            if dashboard:
                # Update view count and last viewed
                dashboard.view_count = (dashboard.view_count or 0) + 1
                dashboard.last_viewed_at = datetime.utcnow()
                await self.db.commit()
            
            return dashboard
            
        except Exception as e:
            logger.error(f"Error getting dashboard {dashboard_id}: {str(e)}")
            raise
    
    async def update_dashboard(self, dashboard_id: uuid.UUID, dashboard_data: DashboardUpdate, user_id: uuid.UUID) -> Optional[Dashboard]:
        """Update an existing dashboard"""
        try:
            # Get dashboard with ownership check
            query = select(Dashboard).where(
                and_(
                    Dashboard.id == str(dashboard_id),
                    Dashboard.user_id == str(user_id)
                )
            )
            result = await self.db.execute(query)
            dashboard = result.scalar_one_or_none()
            
            if not dashboard:
                return None
            
            # Update fields
            update_data = dashboard_data.model_dump(exclude_unset=True)
            
            for field, value in update_data.items():
                if field == 'layout' and value:
                    dashboard.layout_config = value.model_dump()
                elif field == 'theme' and value:
                    dashboard.theme_config = value.model_dump()
                elif field == 'settings' and value:
                    dashboard.settings_config = value.model_dump()
                elif hasattr(dashboard, field):
                    setattr(dashboard, field, value)
            
            # Increment version
            dashboard.version = (dashboard.version or 1) + 1
            dashboard.updated_at = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(dashboard)
            
            logger.info(f"Updated dashboard {dashboard_id} for user {user_id}")
            return dashboard
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating dashboard {dashboard_id}: {str(e)}")
            raise
    
    async def delete_dashboard(self, dashboard_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Delete a dashboard (soft delete by setting is_active=False)"""
        try:
            query = select(Dashboard).where(
                and_(
                    Dashboard.id == str(dashboard_id),
                    Dashboard.user_id == str(user_id)
                )
            )
            result = await self.db.execute(query)
            dashboard = result.scalar_one_or_none()
            
            if not dashboard:
                return False
            
            dashboard.is_active = False
            dashboard.updated_at = datetime.utcnow()
            
            await self.db.commit()
            
            logger.info(f"Deleted dashboard {dashboard_id} for user {user_id}")
            return True
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting dashboard {dashboard_id}: {str(e)}")
            raise
    
    async def list_dashboards(self, search_params: DashboardSearchParams, user_id: Optional[uuid.UUID] = None) -> tuple[List[Dashboard], int]:
        """List dashboards with filtering and pagination"""
        try:
            # Build base query
            query = select(Dashboard).options(
                selectinload(Dashboard.widgets)
            ).where(Dashboard.is_active == True)
            
            # Add user filter
            if user_id:
                query = query.where(
                    or_(
                        Dashboard.user_id == str(user_id),
                        Dashboard.is_public == True
                    )
                )
            
            # Apply filters
            if search_params.query:
                search_term = f"%{search_params.query}%"
                query = query.where(
                    or_(
                        Dashboard.name.ilike(search_term),
                        Dashboard.description.ilike(search_term)
                    )
                )
            
            if search_params.author:
                query = query.where(Dashboard.author.ilike(f"%{search_params.author}%"))
            
            if search_params.is_public is not None:
                query = query.where(Dashboard.is_public == search_params.is_public)
            
            if search_params.tags:
                # Filter by tags (JSON array contains any of the specified tags)
                for tag in search_params.tags:
                    query = query.where(Dashboard.tags.contains([tag]))
            
            if search_params.created_after:
                query = query.where(Dashboard.created_at >= search_params.created_after)
            
            if search_params.created_before:
                query = query.where(Dashboard.created_at <= search_params.created_before)
            
            # Get total count
            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Apply sorting
            if search_params.sort_by:
                sort_field = getattr(Dashboard, search_params.sort_by, Dashboard.updated_at)
                if search_params.sort_order == "asc":
                    query = query.order_by(asc(sort_field))
                else:
                    query = query.order_by(desc(sort_field))
            else:
                query = query.order_by(desc(Dashboard.updated_at))
            
            # Apply pagination
            query = query.offset(search_params.skip).limit(search_params.limit)
            
            # Execute query
            result = await self.db.execute(query)
            dashboards = result.scalars().all()
            
            return list(dashboards), total
            
        except Exception as e:
            logger.error(f"Error listing dashboards: {str(e)}")
            raise
    
    async def duplicate_dashboard(self, dashboard_id: uuid.UUID, duplicate_data: DuplicateRequest, user_id: uuid.UUID) -> Optional[Dashboard]:
        """Duplicate an existing dashboard"""
        try:
            # Get original dashboard
            original = await self.get_dashboard(dashboard_id, user_id)
            if not original:
                return None
            
            # Create new dashboard
            new_dashboard = Dashboard(
                name=duplicate_data.name,
                description=duplicate_data.description or original.description,
                user_id=str(user_id),
                author=original.author,
                layout_config=original.layout_config,
                theme_config=original.theme_config,
                settings_config=original.settings_config,
                is_public=False,  # New dashboard is private by default
                tags=original.tags
            )
            
            self.db.add(new_dashboard)
            await self.db.flush()  # Get the new dashboard ID
            
            # Copy widgets if requested
            if duplicate_data.copy_widgets:
                for widget in original.widgets:
                    new_widget = DashboardWidget(
                        dashboard_id=new_dashboard.id,
                        type=widget.type,
                        chart_type=widget.chart_type,
                        title=widget.title,
                        description=widget.description,
                        position_config=widget.position_config,
                        widget_config=widget.widget_config,
                        chart_props=widget.chart_props,
                        data_source=widget.data_source,
                        data_config=widget.data_config if duplicate_data.copy_data else None,
                        refresh_interval=widget.refresh_interval,
                        style_config=widget.style_config
                    )
                    self.db.add(new_widget)
            
            await self.db.commit()
            await self.db.refresh(new_dashboard)
            
            logger.info(f"Duplicated dashboard {dashboard_id} to {new_dashboard.id} for user {user_id}")
            return new_dashboard
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error duplicating dashboard {dashboard_id}: {str(e)}")
            raise
    
    # Widget operations
    async def add_widget(self, widget_data: DashboardWidgetCreate, user_id: uuid.UUID) -> Optional[DashboardWidget]:
        """Add a widget to a dashboard"""
        try:
            # Verify dashboard ownership
            dashboard = await self.get_dashboard(widget_data.dashboard_id, user_id)
            if not dashboard or dashboard.user_id != str(user_id):
                return None
            
            widget = DashboardWidget(
                dashboard_id=str(widget_data.dashboard_id),
                type=widget_data.type,
                chart_type=widget_data.chart_type,
                title=widget_data.title,
                description=widget_data.description,
                position_config=widget_data.position.model_dump(),
                widget_config=widget_data.config.model_dump(),
                chart_props=widget_data.config.chart_props,
                data_source=widget_data.config.data_source,
                refresh_interval=widget_data.config.refresh_interval
            )
            
            self.db.add(widget)
            
            # Update dashboard version and timestamp
            dashboard.version = (dashboard.version or 1) + 1
            dashboard.updated_at = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(widget)
            
            logger.info(f"Added widget {widget.id} to dashboard {widget_data.dashboard_id}")
            return widget
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error adding widget to dashboard {widget_data.dashboard_id}: {str(e)}")
            raise
    
    async def update_widget(self, widget_id: uuid.UUID, widget_data: DashboardWidgetUpdate, user_id: uuid.UUID) -> Optional[DashboardWidget]:
        """Update a widget"""
        try:
            # Get widget with dashboard ownership check
            query = select(DashboardWidget).join(Dashboard).where(
                and_(
                    DashboardWidget.id == str(widget_id),
                    Dashboard.user_id == str(user_id)
                )
            )
            result = await self.db.execute(query)
            widget = result.scalar_one_or_none()
            
            if not widget:
                return None
            
            # Update fields
            update_data = widget_data.model_dump(exclude_unset=True)
            
            for field, value in update_data.items():
                if field == 'position' and value:
                    widget.position_config = value.model_dump()
                elif field == 'config' and value:
                    widget.widget_config = value.model_dump()
                    widget.chart_props = value.chart_props
                    widget.data_source = value.data_source
                    widget.refresh_interval = value.refresh_interval
                elif hasattr(widget, field):
                    setattr(widget, field, value)
            
            # Increment version
            widget.version = (widget.version or 1) + 1
            widget.updated_at = datetime.utcnow()
            
            # Update dashboard timestamp
            dashboard_query = select(Dashboard).where(Dashboard.id == widget.dashboard_id)
            dashboard_result = await self.db.execute(dashboard_query)
            dashboard = dashboard_result.scalar_one_or_none()
            if dashboard:
                dashboard.updated_at = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(widget)
            
            logger.info(f"Updated widget {widget_id}")
            return widget
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating widget {widget_id}: {str(e)}")
            raise
    
    async def delete_widget(self, widget_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Delete a widget"""
        try:
            # Get widget with dashboard ownership check
            query = select(DashboardWidget).join(Dashboard).where(
                and_(
                    DashboardWidget.id == str(widget_id),
                    Dashboard.user_id == str(user_id)
                )
            )
            result = await self.db.execute(query)
            widget = result.scalar_one_or_none()
            
            if not widget:
                return False
            
            dashboard_id = widget.dashboard_id
            
            # Delete widget
            await self.db.delete(widget)
            
            # Update dashboard timestamp
            dashboard_query = select(Dashboard).where(Dashboard.id == dashboard_id)
            dashboard_result = await self.db.execute(dashboard_query)
            dashboard = dashboard_result.scalar_one_or_none()
            if dashboard:
                dashboard.updated_at = datetime.utcnow()
            
            await self.db.commit()
            
            logger.info(f"Deleted widget {widget_id}")
            return True
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting widget {widget_id}: {str(e)}")
            raise
    
    async def get_dashboard_data(self, dashboard_id: uuid.UUID, user_id: Optional[uuid.UUID] = None) -> Optional[Dict[str, Any]]:
        """Get dashboard data with caching support"""
        try:
            dashboard = await self.get_dashboard(dashboard_id, user_id)
            if not dashboard:
                return None
            
            # Build dashboard data response
            dashboard_data = {
                "id": dashboard.id,
                "name": dashboard.name,
                "description": dashboard.description,
                "layout": dashboard.layout_config,
                "theme": dashboard.theme_config,
                "settings": dashboard.settings_config,
                "widgets": [],
                "metadata": {
                    "version": dashboard.version,
                    "view_count": dashboard.view_count,
                    "last_viewed_at": dashboard.last_viewed_at.isoformat() if dashboard.last_viewed_at else None,
                    "created_at": dashboard.created_at.isoformat(),
                    "updated_at": dashboard.updated_at.isoformat()
                }
            }
            
            # Add widget data
            for widget in dashboard.widgets:
                if widget.is_active:
                    widget_data = {
                        "id": widget.id,
                        "type": widget.type,
                        "chart_type": widget.chart_type,
                        "title": widget.title,
                        "description": widget.description,
                        "position": widget.position_config,
                        "config": widget.widget_config,
                        "chart_props": widget.chart_props,
                        "data_source": widget.data_source,
                        "data_config": widget.data_config,
                        "refresh_interval": widget.refresh_interval,
                        "style_config": widget.style_config
                    }
                    dashboard_data["widgets"].append(widget_data)
            
            return dashboard_data
            
        except Exception as e:
            logger.error(f"Error getting dashboard data {dashboard_id}: {str(e)}")
            raise