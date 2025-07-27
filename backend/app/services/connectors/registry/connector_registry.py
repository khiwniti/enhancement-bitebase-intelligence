"""
Connector Registry
Central registry for managing connector instances and types
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
from collections import defaultdict
import uuid

from ..base import (
    BaseConnector, ConnectorType, ConnectorConfig, ConnectorFactory,
    ConnectorError, ConnectionError
)

logger = logging.getLogger(__name__)


class ConnectorRegistry:
    """Central registry for managing connector instances"""
    
    def __init__(self):
        self._connectors: Dict[str, BaseConnector] = {}
        self._connectors_by_type: Dict[ConnectorType, Set[str]] = defaultdict(set)
        self._connectors_by_name: Dict[str, str] = {}  # name -> connector_id
        self._health_check_tasks: Dict[str, asyncio.Task] = {}
        self._health_check_interval = 300  # 5 minutes
        
    async def register_connector(self, config: ConnectorConfig) -> str:
        """Register a new connector"""
        try:
            # Check if name already exists
            if config.name in self._connectors_by_name:
                raise ConnectorError(
                    f"Connector with name '{config.name}' already exists",
                    connector_type=config.connector_type.value
                )
            
            # Create connector instance
            connector = ConnectorFactory.create_connector(config)
            
            # Store in registry
            self._connectors[connector.id] = connector
            self._connectors_by_type[config.connector_type].add(connector.id)
            self._connectors_by_name[config.name] = connector.id
            
            # Start health monitoring
            await self._start_health_monitoring(connector.id)
            
            logger.info(f"Registered connector: {config.name} ({connector.id})")
            return connector.id
            
        except Exception as e:
            logger.error(f"Failed to register connector {config.name}: {str(e)}")
            raise ConnectorError(
                f"Failed to register connector: {str(e)}",
                connector_type=config.connector_type.value
            )
    
    async def unregister_connector(self, connector_id: str) -> None:
        """Unregister a connector"""
        try:
            connector = self._connectors.get(connector_id)
            if not connector:
                raise ConnectorError(f"Connector {connector_id} not found")
            
            # Stop health monitoring
            await self._stop_health_monitoring(connector_id)
            
            # Disconnect if connected
            if connector.is_connected:
                await connector.disconnect()
            
            # Remove from registry
            self._connectors_by_type[connector.connector_type].discard(connector_id)
            if connector.name in self._connectors_by_name:
                del self._connectors_by_name[connector.name]
            del self._connectors[connector_id]
            
            logger.info(f"Unregistered connector: {connector.name} ({connector_id})")
            
        except Exception as e:
            logger.error(f"Failed to unregister connector {connector_id}: {str(e)}")
            raise ConnectorError(f"Failed to unregister connector: {str(e)}")
    
    def get_connector(self, connector_id: str) -> Optional[BaseConnector]:
        """Get connector by ID"""
        return self._connectors.get(connector_id)
    
    def get_connector_by_name(self, name: str) -> Optional[BaseConnector]:
        """Get connector by name"""
        connector_id = self._connectors_by_name.get(name)
        if connector_id:
            return self._connectors.get(connector_id)
        return None
    
    def list_connectors(
        self,
        connector_type: Optional[ConnectorType] = None,
        include_disconnected: bool = True
    ) -> List[BaseConnector]:
        """List all connectors, optionally filtered by type"""
        connectors = []
        
        if connector_type:
            connector_ids = self._connectors_by_type.get(connector_type, set())
            connectors = [self._connectors[cid] for cid in connector_ids]
        else:
            connectors = list(self._connectors.values())
        
        if not include_disconnected:
            connectors = [c for c in connectors if c.is_connected]
        
        return connectors
    
    def get_connector_types(self) -> List[ConnectorType]:
        """Get list of registered connector types"""
        return list(self._connectors_by_type.keys())
    
    def get_supported_types(self) -> List[ConnectorType]:
        """Get list of all supported connector types"""
        return ConnectorFactory.get_supported_types()
    
    async def connect_all(self) -> Dict[str, bool]:
        """Connect all registered connectors"""
        results = {}
        
        for connector_id, connector in self._connectors.items():
            try:
                if not connector.is_connected:
                    result = await connector.connect()
                    results[connector_id] = result.success
                else:
                    results[connector_id] = True
            except Exception as e:
                logger.error(f"Failed to connect {connector_id}: {str(e)}")
                results[connector_id] = False
        
        return results
    
    async def disconnect_all(self) -> None:
        """Disconnect all connectors"""
        for connector in self._connectors.values():
            try:
                if connector.is_connected:
                    await connector.disconnect()
            except Exception as e:
                logger.error(f"Failed to disconnect {connector.id}: {str(e)}")
    
    async def health_check_all(self) -> Dict[str, Dict]:
        """Perform health check on all connectors"""
        results = {}
        
        for connector_id, connector in self._connectors.items():
            try:
                health_status = await connector.get_health_status()
                results[connector_id] = health_status.to_dict()
            except Exception as e:
                logger.error(f"Health check failed for {connector_id}: {str(e)}")
                results[connector_id] = {
                    'is_healthy': False,
                    'status': 'error',
                    'error_message': str(e),
                    'last_check': datetime.utcnow().isoformat()
                }
        
        return results
    
    async def get_metrics_all(self) -> Dict[str, Dict]:
        """Get metrics for all connectors"""
        results = {}
        
        for connector_id, connector in self._connectors.items():
            try:
                metrics = await connector.get_metrics()
                results[connector_id] = metrics.to_dict()
            except Exception as e:
                logger.error(f"Failed to get metrics for {connector_id}: {str(e)}")
                results[connector_id] = {'error': str(e)}
        
        return results
    
    async def cleanup_inactive_connectors(self, max_idle_hours: int = 24) -> List[str]:
        """Clean up connectors that haven't been used recently"""
        cleaned_up = []
        cutoff_time = datetime.utcnow() - timedelta(hours=max_idle_hours)
        
        for connector_id, connector in list(self._connectors.items()):
            if (connector.last_used and 
                connector.last_used < cutoff_time and 
                not connector.is_connected):
                
                try:
                    await self.unregister_connector(connector_id)
                    cleaned_up.append(connector_id)
                    logger.info(f"Cleaned up inactive connector: {connector_id}")
                except Exception as e:
                    logger.error(f"Failed to cleanup connector {connector_id}: {str(e)}")
        
        return cleaned_up
    
    async def _start_health_monitoring(self, connector_id: str) -> None:
        """Start health monitoring for a connector"""
        if connector_id in self._health_check_tasks:
            return
        
        async def health_monitor():
            while connector_id in self._connectors:
                try:
                    await asyncio.sleep(self._health_check_interval)
                    
                    connector = self._connectors.get(connector_id)
                    if connector:
                        health_status = await connector.get_health_status()
                        
                        if not health_status.is_healthy:
                            logger.warning(
                                f"Connector {connector_id} is unhealthy: "
                                f"{health_status.error_message}"
                            )
                            
                            # Attempt to reconnect if connection is lost
                            if not connector.is_connected:
                                try:
                                    await connector.connect()
                                    logger.info(f"Reconnected connector {connector_id}")
                                except Exception as e:
                                    logger.error(
                                        f"Failed to reconnect {connector_id}: {str(e)}"
                                    )
                    
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"Health monitoring error for {connector_id}: {str(e)}")
        
        task = asyncio.create_task(health_monitor())
        self._health_check_tasks[connector_id] = task
    
    async def _stop_health_monitoring(self, connector_id: str) -> None:
        """Stop health monitoring for a connector"""
        task = self._health_check_tasks.get(connector_id)
        if task:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            del self._health_check_tasks[connector_id]
    
    def get_registry_stats(self) -> Dict:
        """Get registry statistics"""
        total_connectors = len(self._connectors)
        connected_connectors = sum(1 for c in self._connectors.values() if c.is_connected)
        
        type_counts = {}
        for connector_type, connector_ids in self._connectors_by_type.items():
            type_counts[connector_type.value] = len(connector_ids)
        
        return {
            'total_connectors': total_connectors,
            'connected_connectors': connected_connectors,
            'disconnected_connectors': total_connectors - connected_connectors,
            'connector_types': type_counts,
            'supported_types': [ct.value for ct in self.get_supported_types()]
        }
    
    async def shutdown(self) -> None:
        """Shutdown the registry and cleanup resources"""
        logger.info("Shutting down connector registry...")
        
        # Stop all health monitoring
        for connector_id in list(self._health_check_tasks.keys()):
            await self._stop_health_monitoring(connector_id)
        
        # Disconnect all connectors
        await self.disconnect_all()
        
        # Clear registry
        self._connectors.clear()
        self._connectors_by_type.clear()
        self._connectors_by_name.clear()
        
        logger.info("Connector registry shutdown complete")


# Global registry instance
_registry_instance: Optional[ConnectorRegistry] = None


def get_registry() -> ConnectorRegistry:
    """Get the global connector registry instance"""
    global _registry_instance
    if _registry_instance is None:
        _registry_instance = ConnectorRegistry()
    return _registry_instance


async def initialize_registry() -> ConnectorRegistry:
    """Initialize the global connector registry"""
    registry = get_registry()
    logger.info("Connector registry initialized")
    return registry


async def shutdown_registry() -> None:
    """Shutdown the global connector registry"""
    global _registry_instance
    if _registry_instance:
        await _registry_instance.shutdown()
        _registry_instance = None