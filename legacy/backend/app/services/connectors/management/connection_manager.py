"""
Connection Manager for Data Connectors
Manages connection lifecycle, pooling, and health monitoring
"""

import asyncio
import logging
from typing import Dict, List, Optional, Type, Any
from datetime import datetime, timedelta
import uuid

from app.services.connectors.base.connector import BaseConnector, ConnectorType, ConnectionResult
from app.services.connectors.registry.connector_registry import ConnectorRegistry

logger = logging.getLogger(__name__)


class ConnectionPool:
    """Connection pool for managing active connections"""
    
    def __init__(self, max_size: int = 10):
        self.max_size = max_size
        self.connections: Dict[str, BaseConnector] = {}
        self.last_used: Dict[str, datetime] = {}
        self.lock = asyncio.Lock()
    
    async def get_connection(self, connection_id: str) -> Optional[BaseConnector]:
        """Get a connection from the pool"""
        async with self.lock:
            connector = self.connections.get(connection_id)
            if connector:
                self.last_used[connection_id] = datetime.utcnow()
            return connector
    
    async def add_connection(self, connection_id: str, connector: BaseConnector):
        """Add a connection to the pool"""
        async with self.lock:
            if len(self.connections) >= self.max_size:
                # Remove oldest connection
                oldest_id = min(self.last_used.keys(), key=lambda k: self.last_used[k])
                await self._remove_connection(oldest_id)
            
            self.connections[connection_id] = connector
            self.last_used[connection_id] = datetime.utcnow()
    
    async def remove_connection(self, connection_id: str):
        """Remove a connection from the pool"""
        async with self.lock:
            await self._remove_connection(connection_id)
    
    async def _remove_connection(self, connection_id: str):
        """Internal method to remove connection"""
        if connection_id in self.connections:
            connector = self.connections[connection_id]
            try:
                await connector.disconnect()
            except Exception as e:
                logger.warning(f"Error disconnecting {connection_id}: {e}")
            
            del self.connections[connection_id]
            if connection_id in self.last_used:
                del self.last_used[connection_id]
    
    async def cleanup_idle_connections(self, idle_timeout: timedelta = timedelta(minutes=30)):
        """Remove idle connections"""
        async with self.lock:
            now = datetime.utcnow()
            idle_connections = [
                conn_id for conn_id, last_used in self.last_used.items()
                if now - last_used > idle_timeout
            ]
            
            for conn_id in idle_connections:
                await self._remove_connection(conn_id)


class ConnectionManager:
    """Manages database connections and connection lifecycle"""
    
    def __init__(self):
        self.registry = ConnectorRegistry()
        self.pools: Dict[str, ConnectionPool] = {}
        self.active_connections: Dict[str, BaseConnector] = {}
        self._cleanup_task: Optional[asyncio.Task] = None
    
    async def start(self):
        """Start the connection manager"""
        logger.info("Starting Connection Manager")
        # Start cleanup task
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())
    
    async def stop(self):
        """Stop the connection manager"""
        logger.info("Stopping Connection Manager")
        
        # Cancel cleanup task
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
        
        # Close all connections
        for pool in self.pools.values():
            for conn_id in list(pool.connections.keys()):
                await pool.remove_connection(conn_id)
    
    async def create_connection(
        self,
        connector_type: ConnectorType,
        config: Dict[str, Any],
        connection_id: Optional[str] = None
    ) -> str:
        """Create a new connection"""
        if connection_id is None:
            connection_id = str(uuid.uuid4())
        
        # Get connector class
        connector_class = self.registry.get_connector(connector_type)
        if not connector_class:
            raise ValueError(f"Unsupported connector type: {connector_type}")
        
        # Create connector instance
        connector = connector_class()
        
        # Test connection
        result = await connector.connect(config)
        if not result.success:
            raise ConnectionError(f"Failed to connect: {result.message}")
        
        # Add to pool
        pool_key = f"{connector_type.value}"
        if pool_key not in self.pools:
            self.pools[pool_key] = ConnectionPool()
        
        await self.pools[pool_key].add_connection(connection_id, connector)
        self.active_connections[connection_id] = connector
        
        logger.info(f"Created connection {connection_id} for {connector_type.value}")
        return connection_id
    
    async def get_connection(self, connection_id: str) -> Optional[BaseConnector]:
        """Get an existing connection"""
        return self.active_connections.get(connection_id)
    
    async def remove_connection(self, connection_id: str):
        """Remove a connection"""
        if connection_id in self.active_connections:
            connector = self.active_connections[connection_id]
            connector_type = connector.connector_type
            pool_key = f"{connector_type.value}"
            
            if pool_key in self.pools:
                await self.pools[pool_key].remove_connection(connection_id)
            
            if connection_id in self.active_connections:
                del self.active_connections[connection_id]
            
            logger.info(f"Removed connection {connection_id}")
    
    async def test_connection(self, connection_id: str) -> bool:
        """Test if a connection is still valid"""
        connector = await self.get_connection(connection_id)
        if not connector:
            return False
        
        try:
            result = await connector.test_connection()
            return result.success
        except Exception as e:
            logger.warning(f"Connection test failed for {connection_id}: {e}")
            return False
    
    async def list_connections(self) -> List[Dict[str, Any]]:
        """List all active connections"""
        connections = []
        for conn_id, connector in self.active_connections.items():
            connections.append({
                "id": conn_id,
                "type": connector.connector_type.value,
                "status": "active",  # Could add more detailed status
                "created_at": connector.created_at if hasattr(connector, 'created_at') else None
            })
        return connections
    
    async def _cleanup_loop(self):
        """Background task to cleanup idle connections"""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                for pool in self.pools.values():
                    await pool.cleanup_idle_connections()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in cleanup loop: {e}")


# Global connection manager instance
connection_manager = ConnectionManager()
