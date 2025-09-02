"""
BiteBase Intelligence Dashboard API Endpoints
Simplified dashboard endpoints for frontend compatibility
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid
import logging

from app.core.database import get_db
from app.core.enhanced_dependencies import get_current_user, CurrentUser
from app.services.dashboard.dashboard_service import DashboardService
from app.schemas.dashboard import (
    DashboardCreate, DashboardUpdate, DashboardResponse, DashboardListResponse,
    DashboardSearchParams, DuplicateRequest
)
from app.api.v1.endpoints.enhanced_dashboards import (
    dashboard_to_response, get_dashboards as get_enhanced_dashboards,
    get_dashboard as get_enhanced_dashboard, create_dashboard as create_enhanced_dashboard,
    update_dashboard as update_enhanced_dashboard, delete_dashboard as delete_enhanced_dashboard,
    duplicate_dashboard as duplicate_enhanced_dashboard
)

logger = logging.getLogger(__name__)
router = APIRouter()

# Alias endpoints for frontend compatibility
@router.get("/", response_model=DashboardListResponse)
async def get_dashboards(
    search_params: DashboardSearchParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get dashboards with filtering and pagination (alias for enhanced dashboards)"""
    return await get_enhanced_dashboards(search_params, db, current_user.id)

@router.get("/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard(
    dashboard_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get a specific dashboard by ID (alias for enhanced dashboards)"""
    return await get_enhanced_dashboard(dashboard_id, db, current_user.id)

@router.post("/", response_model=DashboardResponse, status_code=201)
async def create_dashboard(
    dashboard_data: DashboardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Create a new dashboard (alias for enhanced dashboards)"""
    return await create_enhanced_dashboard(dashboard_data, db, current_user.id)

@router.patch("/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard(
    dashboard_id: uuid.UUID,
    dashboard_data: DashboardUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Update a dashboard (alias for enhanced dashboards)"""
    return await update_enhanced_dashboard(dashboard_id, dashboard_data, db, current_user.id)

@router.delete("/{dashboard_id}")
async def delete_dashboard(
    dashboard_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Delete a dashboard (alias for enhanced dashboards)"""
    return await delete_enhanced_dashboard(dashboard_id, db, current_user.id)

@router.post("/{dashboard_id}/duplicate", response_model=DashboardResponse)
async def duplicate_dashboard(
    dashboard_id: uuid.UUID,
    duplicate_data: DuplicateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Duplicate an existing dashboard (alias for enhanced dashboards)"""
    return await duplicate_enhanced_dashboard(dashboard_id, duplicate_data, db, current_user.id)

# Additional endpoints that frontend might expect
@router.get("/{dashboard_id}/data")
async def get_dashboard_data(
    dashboard_id: uuid.UUID,
    include_widget_data: bool = Query(True, description="Include widget data"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get dashboard data with widget information"""
    try:
        dashboard_service = DashboardService(db)
        dashboard_data = await dashboard_service.get_dashboard_data(dashboard_id, current_user.id)
        
        if not dashboard_data:
            raise HTTPException(status_code=404, detail="Dashboard not found or access denied")
        
        return {
            "success": True,
            "data": dashboard_data,
            "include_widget_data": include_widget_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dashboard data {dashboard_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting dashboard data: {str(e)}")

@router.get("/{dashboard_id}/export")
async def export_dashboard(
    dashboard_id: uuid.UUID,
    format: str = Query("json", description="Export format (json, pdf, excel)"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Export dashboard in specified format"""
    try:
        dashboard_service = DashboardService(db)
        dashboard = await dashboard_service.get_dashboard(dashboard_id, current_user.id)
        
        if not dashboard:
            raise HTTPException(status_code=404, detail="Dashboard not found or access denied")
        
        # Mock export functionality
        export_data = {
            "dashboard": dashboard_to_response(dashboard).model_dump(),
            "exported_at": dashboard.updated_at.isoformat() if dashboard.updated_at else None,
            "format": format,
            "user_id": str(current_user.id)
        }
        
        return {
            "success": True,
            "message": f"Dashboard exported in {format} format",
            "data": export_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting dashboard {dashboard_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error exporting dashboard: {str(e)}")

@router.post("/{dashboard_id}/share")
async def share_dashboard(
    dashboard_id: uuid.UUID,
    share_options: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Share dashboard with other users"""
    try:
        dashboard_service = DashboardService(db)
        dashboard = await dashboard_service.get_dashboard(dashboard_id, current_user.id)

        if not dashboard:
            raise HTTPException(status_code=404, detail="Dashboard not found or access denied")

        # Mock share functionality
        share_data = {
            "share_id": str(uuid.uuid4()),
            "dashboard_id": str(dashboard_id),
            "shared_by": str(current_user.id),
            "shared_with": share_options.get("recipients", []),
            "permissions": share_options.get("permissions", "view"),
            "share_url": f"https://app.bitebase.com/shared/dashboard/{uuid.uuid4()}",
            "expires_at": share_options.get("expires_at"),
            "is_public": share_options.get("is_public", False),
            "created_at": datetime.utcnow().isoformat()
        }

        return {
            "success": True,
            "message": "Dashboard shared successfully",
            "data": share_data
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sharing dashboard {dashboard_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sharing dashboard: {str(e)}")

@router.get("/shared")
async def get_shared_dashboards(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get dashboards shared with current user"""
    try:
        # Mock shared dashboards
        shared_dashboards = [
            {
                "share_id": str(uuid.uuid4()),
                "dashboard_id": str(uuid.uuid4()),
                "dashboard_name": "Market Analysis Q4",
                "shared_by": "john.doe@example.com",
                "permissions": "view",
                "shared_at": "2024-01-15T10:30:00Z"
            },
            {
                "share_id": str(uuid.uuid4()),
                "dashboard_id": str(uuid.uuid4()),
                "dashboard_name": "Revenue Trends",
                "shared_by": "jane.smith@example.com",
                "permissions": "edit",
                "shared_at": "2024-01-10T14:20:00Z"
            }
        ]

        return {
            "success": True,
            "data": shared_dashboards,
            "total": len(shared_dashboards)
        }

    except Exception as e:
        logger.error(f"Error getting shared dashboards: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting shared dashboards: {str(e)}")

@router.get("/{dashboard_id}/download")
async def download_dashboard_export(
    dashboard_id: uuid.UUID,
    export_id: str = Query(..., description="Export ID from previous export request"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Download exported dashboard file"""
    try:
        dashboard_service = DashboardService(db)
        dashboard = await dashboard_service.get_dashboard(dashboard_id, current_user.id)

        if not dashboard:
            raise HTTPException(status_code=404, detail="Dashboard not found or access denied")

        # Mock file download
        # In production, this would return actual file content
        file_content = {
            "export_id": export_id,
            "dashboard_id": str(dashboard_id),
            "dashboard_name": dashboard.name,
            "exported_at": datetime.utcnow().isoformat(),
            "format": "json",
            "data": dashboard_to_response(dashboard).model_dump()
        }

        return {
            "success": True,
            "message": "File ready for download",
            "download_url": f"/api/v1/dashboards/{dashboard_id}/files/{export_id}",
            "file_size": "2.5MB",
            "content": file_content
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading dashboard export {dashboard_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading export: {str(e)}")
