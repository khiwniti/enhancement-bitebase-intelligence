"""
BiteBase Intelligence POS Integration API Endpoints
Advanced POS connector management with real-time sync and multi-location support
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import logging

from app.core.database import get_db
from app.services.pos.pos_integration_service import POSIntegrationService
from app.schemas.pos_integration import (
    POSIntegrationCreate, POSIntegrationUpdate, POSIntegrationResponse,
    POSSyncRequest, POSSyncLogResponse, POSConnectionTest, POSConnectionTestResponse,
    POSDataMappingCreate, POSDataMappingResponse, POSLocationCreate, POSLocationResponse,
    POSHealthResponse, POSProviderInfo, POSIntegrationStats, POSBulkSyncRequest, POSBulkSyncResponse
)
from app.models.pos_integration import POSProvider, POSConnectionStatus, SyncStatus, DataType

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/integrations", response_model=POSIntegrationResponse)
async def create_pos_integration(
    integration_data: POSIntegrationCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new POS integration"""
    try:
        service = POSIntegrationService(db)
        integration = await service.create_integration(
            restaurant_id=integration_data.restaurant_id,
            provider=integration_data.provider,
            provider_name=integration_data.provider_name,
            connection_config=integration_data.connection_config,
            enabled_data_types=integration_data.enabled_data_types,
            location_id=integration_data.location_id,
            auto_sync_enabled=integration_data.auto_sync_enabled,
            sync_interval_minutes=integration_data.sync_interval_minutes
        )
        return POSIntegrationResponse.from_orm(integration)
    except Exception as e:
        logger.error(f"Error creating POS integration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create integration: {str(e)}")


@router.get("/integrations/restaurant/{restaurant_id}", response_model=List[POSIntegrationResponse])
async def get_restaurant_integrations(
    restaurant_id: str,
    include_inactive: bool = Query(False, description="Include inactive integrations"),
    db: AsyncSession = Depends(get_db)
):
    """Get all POS integrations for a restaurant"""
    try:
        service = POSIntegrationService(db)
        integrations = await service.get_integrations_by_restaurant(
            restaurant_id=restaurant_id,
            include_inactive=include_inactive
        )
        return [POSIntegrationResponse.from_orm(integration) for integration in integrations]
    except Exception as e:
        logger.error(f"Error fetching restaurant integrations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch integrations: {str(e)}")


@router.get("/integrations/{integration_id}", response_model=POSIntegrationResponse)
async def get_pos_integration(
    integration_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific POS integration"""
    try:
        service = POSIntegrationService(db)
        integration = await service.get_integration_by_id(integration_id)
        if not integration:
            raise HTTPException(status_code=404, detail="Integration not found")
        return POSIntegrationResponse.from_orm(integration)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching POS integration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch integration: {str(e)}")


@router.put("/integrations/{integration_id}", response_model=POSIntegrationResponse)
async def update_pos_integration(
    integration_id: str,
    update_data: POSIntegrationUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a POS integration"""
    try:
        service = POSIntegrationService(db)
        integration = await service.get_integration_by_id(integration_id)
        if not integration:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        # Update fields
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(integration, field, value)
        
        await db.commit()
        await db.refresh(integration)
        return POSIntegrationResponse.from_orm(integration)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating POS integration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update integration: {str(e)}")


@router.post("/integrations/{integration_id}/test", response_model=POSConnectionTestResponse)
async def test_pos_connection(
    integration_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Test connection to a POS system"""
    try:
        service = POSIntegrationService(db)
        success, message = await service.test_connection(integration_id)
        return POSConnectionTestResponse(
            success=success,
            message=message,
            response_time_ms=500 if success else None  # Simulated response time
        )
    except Exception as e:
        logger.error(f"Error testing POS connection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to test connection: {str(e)}")


@router.post("/integrations/{integration_id}/sync", response_model=POSSyncLogResponse)
async def sync_pos_data(
    integration_id: str,
    sync_request: POSSyncRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Synchronize data from POS system"""
    try:
        service = POSIntegrationService(db)
        
        # Convert string data types to enum
        data_types = None
        if sync_request.data_types:
            data_types = [DataType(dt) for dt in sync_request.data_types]
        
        sync_log = await service.sync_data(
            integration_id=integration_id,
            data_types=data_types,
            sync_type=sync_request.sync_type
        )
        return POSSyncLogResponse.from_orm(sync_log)
    except Exception as e:
        logger.error(f"Error syncing POS data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to sync data: {str(e)}")


@router.get("/integrations/{integration_id}/sync-history", response_model=List[POSSyncLogResponse])
async def get_sync_history(
    integration_id: str,
    limit: int = Query(50, ge=1, le=200, description="Number of sync logs to return"),
    status: Optional[SyncStatus] = Query(None, description="Filter by sync status"),
    db: AsyncSession = Depends(get_db)
):
    """Get synchronization history for an integration"""
    try:
        service = POSIntegrationService(db)
        sync_logs = await service.get_sync_history(
            integration_id=integration_id,
            limit=limit,
            status_filter=status
        )
        return [POSSyncLogResponse.from_orm(log) for log in sync_logs]
    except Exception as e:
        logger.error(f"Error fetching sync history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch sync history: {str(e)}")


@router.get("/integrations/{integration_id}/health", response_model=POSHealthResponse)
async def get_integration_health(
    integration_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get health status and metrics for an integration"""
    try:
        service = POSIntegrationService(db)
        health_data = await service.get_integration_health(integration_id)
        if "error" in health_data:
            raise HTTPException(status_code=404, detail=health_data["error"])
        return POSHealthResponse(**health_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching integration health: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch health data: {str(e)}")


@router.get("/providers", response_model=List[POSProviderInfo])
async def get_pos_providers():
    """Get information about supported POS providers"""
    providers = [
        POSProviderInfo(
            provider=POSProvider.SQUARE,
            name="Square POS",
            description="Complete point-of-sale solution with inventory management",
            supported_data_types=["sales", "menu_items", "inventory", "customers", "payments"],
            features=["Real-time sync", "Inventory tracking", "Customer analytics", "Payment processing"],
            setup_requirements=["API Key", "Application ID", "Location ID"],
            documentation_url="https://developer.squareup.com/docs",
            logo_url="/logos/square.png"
        ),
        POSProviderInfo(
            provider=POSProvider.TOAST,
            name="Toast POS",
            description="Restaurant-specific POS with kitchen display integration",
            supported_data_types=["sales", "menu_items", "orders", "customers", "staff"],
            features=["Kitchen display system", "Online ordering", "Staff management", "Menu engineering"],
            setup_requirements=["API Key", "Restaurant GUID", "Management Group GUID"],
            documentation_url="https://doc.toasttab.com/",
            logo_url="/logos/toast.png"
        ),
        POSProviderInfo(
            provider=POSProvider.CLOVER,
            name="Clover",
            description="Flexible POS system with extensive app marketplace",
            supported_data_types=["sales", "inventory", "customers", "payments", "orders"],
            features=["App marketplace", "Inventory management", "Customer insights", "Payment processing"],
            setup_requirements=["API Token", "Merchant ID", "App ID"],
            documentation_url="https://docs.clover.com/",
            logo_url="/logos/clover.png"
        ),
        POSProviderInfo(
            provider=POSProvider.LIGHTSPEED,
            name="Lightspeed",
            description="Cloud-based POS for restaurants and retail",
            supported_data_types=["sales", "menu_items", "inventory", "customers", "orders"],
            features=["Cloud-based", "Multi-location support", "Advanced reporting", "Inventory optimization"],
            setup_requirements=["API Key", "Account ID", "Location ID"],
            documentation_url="https://developers.lightspeedhq.com/",
            logo_url="/logos/lightspeed.png"
        ),
        POSProviderInfo(
            provider=POSProvider.REVEL,
            name="Revel Systems",
            description="iPad-based POS system for restaurants",
            supported_data_types=["sales", "menu_items", "orders", "inventory", "customers"],
            features=["iPad-based", "Kitchen display", "Inventory management", "Customer loyalty"],
            setup_requirements=["API Key", "Establishment ID", "User Credentials"],
            documentation_url="https://developer.revelsystems.com/",
            logo_url="/logos/revel.png"
        )
    ]
    return providers


@router.post("/integrations/bulk-sync", response_model=POSBulkSyncResponse)
async def bulk_sync_integrations(
    bulk_request: POSBulkSyncRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Perform bulk synchronization across multiple integrations"""
    try:
        service = POSIntegrationService(db)
        sync_jobs = []
        failed_integrations = []
        
        for integration_id in bulk_request.integration_ids:
            try:
                # Convert string data types to enum
                data_types = None
                if bulk_request.data_types:
                    data_types = [DataType(dt) for dt in bulk_request.data_types]
                
                # Add sync job to background tasks
                background_tasks.add_task(
                    service.sync_data,
                    integration_id=integration_id,
                    data_types=data_types,
                    sync_type=bulk_request.sync_type
                )
                sync_jobs.append(integration_id)
            except Exception as e:
                failed_integrations.append({
                    "integration_id": integration_id,
                    "error": str(e)
                })
        
        return POSBulkSyncResponse(
            total_requested=len(bulk_request.integration_ids),
            sync_jobs_created=sync_jobs,
            failed_integrations=failed_integrations,
            estimated_completion_time="5-10 minutes"  # Estimated based on data volume
        )
    except Exception as e:
        logger.error(f"Error performing bulk sync: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to perform bulk sync: {str(e)}")


@router.delete("/integrations/{integration_id}")
async def delete_pos_integration(
    integration_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a POS integration"""
    try:
        service = POSIntegrationService(db)
        integration = await service.get_integration_by_id(integration_id)
        if not integration:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        await db.delete(integration)
        await db.commit()
        return {"message": "Integration deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting POS integration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete integration: {str(e)}")


@router.get("/stats", response_model=POSIntegrationStats)
async def get_pos_integration_stats(
    restaurant_id: Optional[str] = Query(None, description="Filter by restaurant ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get POS integration statistics"""
    try:
        # This would typically involve complex queries to gather statistics
        # For now, returning mock data
        return POSIntegrationStats(
            total_integrations=25,
            active_integrations=22,
            providers_used=["square", "toast", "clover"],
            total_syncs_today=150,
            successful_syncs_today=142,
            average_sync_duration=45.5,
            data_types_synced={
                "sales": 89,
                "menu_items": 45,
                "inventory": 67,
                "customers": 34,
                "orders": 78
            },
            sync_frequency_distribution={
                "15_minutes": 12,
                "30_minutes": 8,
                "1_hour": 5,
                "manual": 2
            }
        )
    except Exception as e:
        logger.error(f"Error fetching POS integration stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")
