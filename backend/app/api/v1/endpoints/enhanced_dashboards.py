"""
BiteBase Intelligence Enhanced Dashboard API Endpoints
Advanced dashboard management with visualization engine integration
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import uuid
import json
import logging
from datetime import datetime
import io

from app.core.database import get_db
from app.models.dashboard import Dashboard, DashboardWidget, DashboardExport
from app.schemas.dashboard import (
    DashboardResponse, DashboardCreate, DashboardUpdate, DashboardListResponse,
    DashboardSearchParams, DashboardWidgetResponse, DashboardWidgetCreate, 
    DashboardWidgetUpdate, ExportRequest, ExportResponse, ShareRequest, 
    ShareResponse, DuplicateRequest
)
from app.services.dashboard.dashboard_service import DashboardService
from app.services.dashboard.visualization_engine import VisualizationEngine
from app.services.visualization.export_service import ExportService
from app.services.visualization.chart_optimizer import ChartOptimizer

logger = logging.getLogger(__name__)
router = APIRouter()

# Placeholder for authentication - in production, implement proper auth
async def get_current_user() -> uuid.UUID:
    """Get current authenticated user ID - placeholder implementation"""
    # In production, this would extract user ID from JWT token or session
    return uuid.UUID("12345678-1234-5678-9012-123456789012")


def dashboard_to_response(dashboard: Dashboard) -> DashboardResponse:
    """Convert Dashboard model to DashboardResponse schema"""
    try:
        widgets = []
        for widget in dashboard.widgets:
            if widget.is_active:
                widget_response = DashboardWidgetResponse(
                    id=uuid.UUID(widget.id),
                    dashboard_id=uuid.UUID(widget.dashboard_id),
                    type=widget.type,
                    chart_type=widget.chart_type,
                    title=widget.title,
                    description=widget.description,
                    position=widget.position_config,
                    config=widget.widget_config,
                    version=widget.version,
                    created_at=widget.created_at,
                    updated_at=widget.updated_at
                )
                widgets.append(widget_response)
        
        return DashboardResponse(
            id=uuid.UUID(dashboard.id),
            name=dashboard.name,
            description=dashboard.description,
            user_id=uuid.UUID(dashboard.user_id),
            author=dashboard.author,
            layout=dashboard.layout_config,
            theme=dashboard.theme_config,
            settings=dashboard.settings_config,
            is_public=dashboard.is_public,
            tags=dashboard.tags or [],
            version=dashboard.version,
            view_count=dashboard.view_count or 0,
            last_viewed_at=dashboard.last_viewed_at,
            created_at=dashboard.created_at,
            updated_at=dashboard.updated_at,
            widgets=widgets
        )
    except Exception as e:
        logger.error(f"Error converting dashboard to response: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing dashboard data")


# Dashboard CRUD Operations
@router.post("/", response_model=DashboardResponse, status_code=201)
async def create_dashboard(
    dashboard_data: DashboardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Create a new dashboard"""
    try:
        dashboard_service = DashboardService(db)
        
        # Set user_id from authenticated user
        dashboard_data.user_id = current_user
        
        dashboard = await dashboard_service.create_dashboard(dashboard_data)
        return dashboard_to_response(dashboard)
        
    except Exception as e:
        logger.error(f"Error creating dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating dashboard: {str(e)}")


@router.get("/", response_model=DashboardListResponse)
async def get_dashboards(
    search_params: DashboardSearchParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Get dashboards with filtering and pagination"""
    try:
        dashboard_service = DashboardService(db)
        dashboards, total = await dashboard_service.list_dashboards(search_params, current_user)
        
        dashboard_responses = [dashboard_to_response(d) for d in dashboards]
        
        return DashboardListResponse(
            dashboards=dashboard_responses,
            total=total,
            skip=search_params.skip,
            limit=search_params.limit,
            has_more=search_params.skip + search_params.limit < total
        )
        
    except Exception as e:
        logger.error(f"Error retrieving dashboards: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboards: {str(e)}")


@router.get("/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard(
    dashboard_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Get a specific dashboard by ID"""
    try:
        dashboard_service = DashboardService(db)
        dashboard = await dashboard_service.get_dashboard(dashboard_id, current_user)
        
        if not dashboard:
            raise HTTPException(status_code=404, detail="Dashboard not found")
        
        return dashboard_to_response(dashboard)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving dashboard {dashboard_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard: {str(e)}")


@router.put("/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard(
    dashboard_id: uuid.UUID,
    dashboard_data: DashboardUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Update an existing dashboard"""
    try:
        dashboard_service = DashboardService(db)
        dashboard = await dashboard_service.update_dashboard(dashboard_id, dashboard_data, current_user)
        
        if not dashboard:
            raise HTTPException(status_code=404, detail="Dashboard not found or access denied")
        
        return dashboard_to_response(dashboard)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating dashboard {dashboard_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating dashboard: {str(e)}")


@router.delete("/{dashboard_id}")
async def delete_dashboard(
    dashboard_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Delete a dashboard"""
    try:
        dashboard_service = DashboardService(db)
        success = await dashboard_service.delete_dashboard(dashboard_id, current_user)
        
        if not success:
            raise HTTPException(status_code=404, detail="Dashboard not found or access denied")
        
        return {"message": "Dashboard deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting dashboard {dashboard_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting dashboard: {str(e)}")


@router.post("/{dashboard_id}/duplicate", response_model=DashboardResponse)
async def duplicate_dashboard(
    dashboard_id: uuid.UUID,
    duplicate_data: DuplicateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Duplicate an existing dashboard"""
    try:
        dashboard_service = DashboardService(db)
        dashboard = await dashboard_service.duplicate_dashboard(dashboard_id, duplicate_data, current_user)
        
        if not dashboard:
            raise HTTPException(status_code=404, detail="Dashboard not found or access denied")
        
        return dashboard_to_response(dashboard)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error duplicating dashboard {dashboard_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error duplicating dashboard: {str(e)}")


# Widget Operations
@router.post("/{dashboard_id}/widgets", response_model=DashboardWidgetResponse, status_code=201)
async def add_widget(
    dashboard_id: uuid.UUID,
    widget_data: DashboardWidgetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Add a widget to a dashboard"""
    try:
        # Set dashboard_id from URL
        widget_data.dashboard_id = dashboard_id
        
        dashboard_service = DashboardService(db)
        widget = await dashboard_service.add_widget(widget_data, current_user)
        
        if not widget:
            raise HTTPException(status_code=404, detail="Dashboard not found or access denied")
        
        return DashboardWidgetResponse(
            id=uuid.UUID(widget.id),
            dashboard_id=uuid.UUID(widget.dashboard_id),
            type=widget.type,
            chart_type=widget.chart_type,
            title=widget.title,
            description=widget.description,
            position=widget.position_config,
            config=widget.widget_config,
            version=widget.version,
            created_at=widget.created_at,
            updated_at=widget.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding widget to dashboard {dashboard_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding widget: {str(e)}")


@router.put("/{dashboard_id}/widgets/{widget_id}", response_model=DashboardWidgetResponse)
async def update_widget(
    dashboard_id: uuid.UUID,
    widget_id: uuid.UUID,
    widget_data: DashboardWidgetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Update a widget"""
    try:
        dashboard_service = DashboardService(db)
        widget = await dashboard_service.update_widget(widget_id, widget_data, current_user)
        
        if not widget:
            raise HTTPException(status_code=404, detail="Widget not found or access denied")
        
        return DashboardWidgetResponse(
            id=uuid.UUID(widget.id),
            dashboard_id=uuid.UUID(widget.dashboard_id),
            type=widget.type,
            chart_type=widget.chart_type,
            title=widget.title,
            description=widget.description,
            position=widget.position_config,
            config=widget.widget_config,
            version=widget.version,
            created_at=widget.created_at,
            updated_at=widget.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating widget {widget_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating widget: {str(e)}")


@router.delete("/{dashboard_id}/widgets/{widget_id}")
async def delete_widget(
    dashboard_id: uuid.UUID,
    widget_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Delete a widget"""
    try:
        dashboard_service = DashboardService(db)
        success = await dashboard_service.delete_widget(widget_id, current_user)
        
        if not success:
            raise HTTPException(status_code=404, detail="Widget not found or access denied")
        
        return {"message": "Widget deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting widget {widget_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting widget: {str(e)}")


# Dashboard Data Operations
@router.get("/{dashboard_id}/data")
async def get_dashboard_data(
    dashboard_id: uuid.UUID,
    include_widget_data: bool = Query(True, description="Include widget data"),
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Get dashboard data with caching support"""
    try:
        dashboard_service = DashboardService(db)
        dashboard_data = await dashboard_service.get_dashboard_data(dashboard_id, current_user)
        
        if not dashboard_data:
            raise HTTPException(status_code=404, detail="Dashboard not found or access denied")
        
        # Process widget data if requested
        if include_widget_data:
            visualization_engine = VisualizationEngine(db)
            
            for widget_data in dashboard_data.get("widgets", []):
                # This is where you would fetch actual data from data sources
                # For now, we'll add placeholder data processing
                sample_data = [{"x": i, "y": i * 2} for i in range(10)]  # Placeholder
                
                if widget_data.get("type") == "chart":
                    # Create a mock widget object for processing
                    mock_widget = type('MockWidget', (), {
                        'id': widget_data['id'],
                        'chart_type': widget_data.get('chart_type'),
                        'data_config': widget_data.get('data_config'),
                        'chart_props': widget_data.get('chart_props', {})
                    })()
                    
                    processed_data = await visualization_engine.process_widget_data(mock_widget, sample_data)
                    widget_data['processed_data'] = processed_data
        
        return dashboard_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dashboard data {dashboard_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting dashboard data: {str(e)}")


# Visualization Engine Operations
@router.post("/visualizations/optimize")
async def optimize_chart_config(
    chart_type: str = Query(..., description="Chart type to optimize"),
    data: List[Dict[str, Any]] = [],
    config: Dict[str, Any] = {},
    db: AsyncSession = Depends(get_db)
):
    """Optimize chart configuration for performance"""
    try:
        visualization_engine = VisualizationEngine(db)
        optimized_config = await visualization_engine.optimize_chart_config(chart_type, data, config)
        
        return {
            "chart_type": chart_type,
            "original_config": config,
            "optimized_config": optimized_config,
            "data_size": len(data),
            "optimized_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error optimizing chart config: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error optimizing chart: {str(e)}")


@router.post("/visualizations/suggest")
async def suggest_chart_types(
    data: List[Dict[str, Any]],
    data_schema: Optional[Dict[str, str]] = None,
    db: AsyncSession = Depends(get_db)
):
    """Suggest appropriate chart types for given data"""
    try:
        visualization_engine = VisualizationEngine(db)
        suggestions = visualization_engine.suggest_chart_types(data, data_schema)
        
        return {
            "data_size": len(data),
            "suggestions": suggestions,
            "analyzed_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error suggesting chart types: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error suggesting charts: {str(e)}")


@router.get("/visualizations/types")
async def get_chart_types(db: AsyncSession = Depends(get_db)):
    """Get available chart types with their capabilities"""
    try:
        visualization_engine = VisualizationEngine(db)
        chart_types = visualization_engine.get_available_chart_types()
        
        return {
            "chart_types": chart_types,
            "total_types": len(chart_types),
            "retrieved_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting chart types: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting chart types: {str(e)}")


# Export Operations
@router.post("/exports", response_model=ExportResponse, status_code=202)
async def create_export(
    export_request: ExportRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Create a dashboard export job"""
    try:
        export_service = ExportService(db)
        export = await export_service.create_export(
            export_request.dashboard_id, 
            export_request.options, 
            current_user
        )
        
        if not export:
            raise HTTPException(status_code=404, detail="Dashboard not found or access denied")
        
        return ExportResponse(
            export_id=uuid.UUID(export.id),
            status=export.status,
            download_url=export.download_url,
            expires_at=export.expires_at,
            created_at=export.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating export: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating export: {str(e)}")


@router.get("/exports/{export_id}", response_model=ExportResponse)
async def get_export_status(
    export_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Get export status and download URL"""
    try:
        export_service = ExportService(db)
        export = await export_service.get_export_status(export_id, current_user)
        
        if not export:
            raise HTTPException(status_code=404, detail="Export not found")
        
        return ExportResponse(
            export_id=uuid.UUID(export.id),
            status=export.status,
            download_url=export.download_url,
            expires_at=export.expires_at,
            created_at=export.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting export status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting export status: {str(e)}")


@router.get("/exports/{export_id}/download")
async def download_export(
    export_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: uuid.UUID = Depends(get_current_user)
):
    """Download export file"""
    try:
        export_service = ExportService(db)
        file_data = await export_service.get_export_file(export_id, current_user)
        
        if not file_data:
            raise HTTPException(status_code=404, detail="Export file not found or expired")
        
        filename, content, mime_type = file_data
        
        return StreamingResponse(
            io.BytesIO(content),
            media_type=mime_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading export: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading export: {str(e)}")


# Performance Analysis
@router.post("/performance/analyze")
async def analyze_chart_performance(
    chart_type: str = Query(..., description="Chart type to analyze"),
    data: List[Dict[str, Any]] = [],
    config: Dict[str, Any] = {}
):
    """Analyze chart performance characteristics"""
    try:
        chart_optimizer = ChartOptimizer()
        analysis = chart_optimizer.analyze_chart_performance(chart_type, data, config)
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing chart performance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing performance: {str(e)}")


@router.post("/performance/optimize")
async def optimize_chart_performance(
    chart_type: str = Query(..., description="Chart type to optimize"),
    data: List[Dict[str, Any]] = [],
    config: Dict[str, Any] = {}
):
    """Optimize chart configuration for performance"""
    try:
        chart_optimizer = ChartOptimizer()
        optimized_config = chart_optimizer.optimize_chart_performance(chart_type, data, config)
        
        return {
            "chart_type": chart_type,
            "original_config": config,
            "optimized_config": optimized_config,
            "data_size": len(data),
            "optimized_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error optimizing chart performance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error optimizing performance: {str(e)}")


# Health Check
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "enhanced-dashboards",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }