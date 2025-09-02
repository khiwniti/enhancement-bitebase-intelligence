"""
BiteBase Intelligence POS Integration Service
Advanced POS connector management with real-time sync and multi-location support
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
from sqlalchemy.orm import selectinload

from app.models.pos_integration import (
    POSIntegration, POSSyncLog, POSDataMapping, POSWebhook, POSLocation, POSConnectorHealth,
    POSProvider, POSConnectionStatus, SyncStatus, DataType
)
from app.models.restaurant import Restaurant
from app.core.database import get_db

logger = logging.getLogger(__name__)


class POSIntegrationService:
    """Service for managing POS integrations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_integration(
        self,
        restaurant_id: str,
        provider: POSProvider,
        provider_name: str,
        connection_config: Dict[str, Any],
        enabled_data_types: List[str],
        location_id: Optional[str] = None,
        auto_sync_enabled: bool = True,
        sync_interval_minutes: int = 15
    ) -> POSIntegration:
        """Create a new POS integration"""
        
        integration = POSIntegration(
            restaurant_id=restaurant_id,
            location_id=location_id,
            provider=provider,
            provider_name=provider_name,
            connection_config=connection_config,
            enabled_data_types=enabled_data_types,
            auto_sync_enabled=auto_sync_enabled,
            sync_interval_minutes=sync_interval_minutes,
            status=POSConnectionStatus.PENDING
        )
        
        self.db.add(integration)
        await self.db.commit()
        await self.db.refresh(integration)
        
        logger.info(f"Created POS integration {integration.id} for restaurant {restaurant_id}")
        return integration
    
    async def get_integrations_by_restaurant(
        self,
        restaurant_id: str,
        include_inactive: bool = False
    ) -> List[POSIntegration]:
        """Get all POS integrations for a restaurant"""
        
        query = select(POSIntegration).where(POSIntegration.restaurant_id == restaurant_id)
        
        if not include_inactive:
            query = query.where(POSIntegration.status != POSConnectionStatus.DISCONNECTED)
        
        query = query.options(selectinload(POSIntegration.sync_logs))
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_integration_by_id(self, integration_id: str) -> Optional[POSIntegration]:
        """Get a specific POS integration by ID"""
        
        query = select(POSIntegration).where(POSIntegration.id == integration_id)
        query = query.options(
            selectinload(POSIntegration.sync_logs),
            selectinload(POSIntegration.data_mappings)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def update_connection_status(
        self,
        integration_id: str,
        status: POSConnectionStatus,
        error_message: Optional[str] = None
    ) -> bool:
        """Update the connection status of a POS integration"""
        
        integration = await self.get_integration_by_id(integration_id)
        if not integration:
            return False
        
        integration.status = status
        integration.updated_at = datetime.utcnow()
        
        if status == POSConnectionStatus.CONNECTED:
            integration.last_connected_at = datetime.utcnow()
            integration.error_count = 0
            integration.last_error = None
        elif status == POSConnectionStatus.ERROR:
            integration.error_count += 1
            integration.last_error = error_message
        
        await self.db.commit()
        logger.info(f"Updated integration {integration_id} status to {status.value}")
        return True
    
    async def test_connection(self, integration_id: str) -> Tuple[bool, Optional[str]]:
        """Test the connection to a POS system"""
        
        integration = await self.get_integration_by_id(integration_id)
        if not integration:
            return False, "Integration not found"
        
        try:
            # Simulate connection test based on provider
            if integration.provider == POSProvider.SQUARE:
                success = await self._test_square_connection(integration)
            elif integration.provider == POSProvider.TOAST:
                success = await self._test_toast_connection(integration)
            elif integration.provider == POSProvider.CLOVER:
                success = await self._test_clover_connection(integration)
            else:
                success = await self._test_generic_connection(integration)
            
            if success:
                await self.update_connection_status(integration_id, POSConnectionStatus.CONNECTED)
                return True, "Connection successful"
            else:
                await self.update_connection_status(
                    integration_id, 
                    POSConnectionStatus.ERROR, 
                    "Connection test failed"
                )
                return False, "Connection test failed"
                
        except Exception as e:
            error_msg = f"Connection test error: {str(e)}"
            await self.update_connection_status(integration_id, POSConnectionStatus.ERROR, error_msg)
            return False, error_msg
    
    async def sync_data(
        self,
        integration_id: str,
        data_types: Optional[List[DataType]] = None,
        sync_type: str = "manual"
    ) -> POSSyncLog:
        """Synchronize data from POS system"""
        
        integration = await self.get_integration_by_id(integration_id)
        if not integration:
            raise ValueError("Integration not found")
        
        if not data_types:
            data_types = [DataType(dt) for dt in integration.enabled_data_types]
        
        # Create sync log
        sync_log = POSSyncLog(
            integration_id=integration_id,
            sync_type=sync_type,
            data_types=[dt.value for dt in data_types],
            status=SyncStatus.IN_PROGRESS,
            started_at=datetime.utcnow()
        )
        
        self.db.add(sync_log)
        await self.db.commit()
        await self.db.refresh(sync_log)
        
        try:
            # Update integration status
            await self.update_connection_status(integration_id, POSConnectionStatus.SYNCING)
            
            # Perform sync based on provider and data types
            total_processed = 0
            total_created = 0
            total_updated = 0
            total_failed = 0
            
            for data_type in data_types:
                processed, created, updated, failed = await self._sync_data_type(
                    integration, data_type
                )
                total_processed += processed
                total_created += created
                total_updated += updated
                total_failed += failed
            
            # Update sync log
            sync_log.completed_at = datetime.utcnow()
            sync_log.duration_seconds = (sync_log.completed_at - sync_log.started_at).total_seconds()
            sync_log.records_processed = total_processed
            sync_log.records_created = total_created
            sync_log.records_updated = total_updated
            sync_log.records_failed = total_failed
            sync_log.status = SyncStatus.SUCCESS if total_failed == 0 else SyncStatus.PARTIAL
            
            # Update integration metrics
            integration.last_sync_at = datetime.utcnow()
            integration.total_syncs += 1
            if sync_log.status == SyncStatus.SUCCESS:
                integration.successful_syncs += 1
            
            # Update average sync duration
            if integration.average_sync_duration:
                integration.average_sync_duration = (
                    integration.average_sync_duration + sync_log.duration_seconds
                ) / 2
            else:
                integration.average_sync_duration = sync_log.duration_seconds
            
            await self.update_connection_status(integration_id, POSConnectionStatus.CONNECTED)
            
        except Exception as e:
            sync_log.completed_at = datetime.utcnow()
            sync_log.duration_seconds = (sync_log.completed_at - sync_log.started_at).total_seconds()
            sync_log.status = SyncStatus.FAILED
            sync_log.error_message = str(e)
            
            await self.update_connection_status(
                integration_id, 
                POSConnectionStatus.ERROR, 
                f"Sync failed: {str(e)}"
            )
            
        await self.db.commit()
        return sync_log
    
    async def get_sync_history(
        self,
        integration_id: str,
        limit: int = 50,
        status_filter: Optional[SyncStatus] = None
    ) -> List[POSSyncLog]:
        """Get sync history for an integration"""
        
        query = select(POSSyncLog).where(POSSyncLog.integration_id == integration_id)
        
        if status_filter:
            query = query.where(POSSyncLog.status == status_filter)
        
        query = query.order_by(desc(POSSyncLog.started_at)).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_integration_health(self, integration_id: str) -> Dict[str, Any]:
        """Get health status and metrics for an integration"""
        
        integration = await self.get_integration_by_id(integration_id)
        if not integration:
            return {"error": "Integration not found"}
        
        # Get recent sync logs
        recent_syncs = await self.get_sync_history(integration_id, limit=10)
        
        # Calculate health metrics
        success_rate = 0
        if integration.total_syncs > 0:
            success_rate = (integration.successful_syncs / integration.total_syncs) * 100
        
        # Get latest health check
        health_query = select(POSConnectorHealth).where(
            POSConnectorHealth.integration_id == integration_id
        ).order_by(desc(POSConnectorHealth.check_timestamp)).limit(1)
        health_result = await self.db.execute(health_query)
        latest_health = health_result.scalar_one_or_none()
        
        return {
            "integration_id": integration_id,
            "status": integration.status.value,
            "last_sync": integration.last_sync_at.isoformat() if integration.last_sync_at else None,
            "success_rate": round(success_rate, 2),
            "total_syncs": integration.total_syncs,
            "successful_syncs": integration.successful_syncs,
            "error_count": integration.error_count,
            "average_sync_duration": integration.average_sync_duration,
            "recent_syncs": [
                {
                    "id": sync.id,
                    "status": sync.status.value,
                    "started_at": sync.started_at.isoformat(),
                    "duration": sync.duration_seconds,
                    "records_processed": sync.records_processed
                }
                for sync in recent_syncs
            ],
            "health_check": {
                "is_healthy": latest_health.is_healthy if latest_health else None,
                "last_check": latest_health.check_timestamp.isoformat() if latest_health else None,
                "response_time_ms": latest_health.response_time_ms if latest_health else None
            } if latest_health else None
        }
    
    # Provider-specific connection test methods
    async def _test_square_connection(self, integration: POSIntegration) -> bool:
        """Test Square POS connection"""
        # Simulate Square API test
        await asyncio.sleep(0.5)
        return True  # Simplified for demo
    
    async def _test_toast_connection(self, integration: POSIntegration) -> bool:
        """Test Toast POS connection"""
        # Simulate Toast API test
        await asyncio.sleep(0.5)
        return True  # Simplified for demo
    
    async def _test_clover_connection(self, integration: POSIntegration) -> bool:
        """Test Clover POS connection"""
        # Simulate Clover API test
        await asyncio.sleep(0.5)
        return True  # Simplified for demo
    
    async def _test_generic_connection(self, integration: POSIntegration) -> bool:
        """Test generic POS connection"""
        # Simulate generic API test
        await asyncio.sleep(0.5)
        return True  # Simplified for demo
    
    async def _sync_data_type(
        self, 
        integration: POSIntegration, 
        data_type: DataType
    ) -> Tuple[int, int, int, int]:
        """Sync a specific data type from POS system"""
        # Simulate data sync
        await asyncio.sleep(1)
        
        # Return (processed, created, updated, failed)
        if data_type == DataType.SALES:
            return (100, 20, 75, 5)
        elif data_type == DataType.MENU_ITEMS:
            return (50, 5, 40, 5)
        elif data_type == DataType.INVENTORY:
            return (200, 10, 180, 10)
        else:
            return (25, 5, 15, 5)
