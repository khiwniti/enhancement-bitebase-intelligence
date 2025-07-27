"""
BiteBase Intelligence Data Connector API
FastAPI endpoints for data connector management
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import logging
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.services.connectors import (
    ConnectorRegistry, get_registry, ConnectorType, ConnectorConfig,
    UniversalQuery, QueryType, SQLLikeParser, AuthenticationType
)

logger = logging.getLogger(__name__)

router = APIRouter()


# Pydantic models for API requests/responses
class ConnectorConfigRequest(BaseModel):
    """Request model for connector configuration"""
    connector_type: str
    name: str
    description: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    database: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    auth_type: str = "none"
    api_key: Optional[str] = None
    token: Optional[str] = None
    pool_size: int = 5
    max_overflow: int = 10
    pool_timeout: int = 30
    connection_timeout: int = 30
    query_timeout: int = 300
    use_ssl: bool = False
    ssl_cert_path: Optional[str] = None
    ssl_key_path: Optional[str] = None
    ssl_ca_path: Optional[str] = None
    extra_params: Dict[str, Any] = Field(default_factory=dict)


class QueryRequest(BaseModel):
    """Request model for query execution"""
    connector_id: str
    query: str
    query_type: str = "select"
    parameters: Dict[str, Any] = Field(default_factory=dict)
    limit: Optional[int] = None
    offset: Optional[int] = None
    timeout: Optional[int] = None


class PreviewRequest(BaseModel):
    """Request model for data preview"""
    connector_id: str
    table_name: str
    limit: int = 100


@router.post("/connectors", response_model=Dict[str, Any])
async def create_connector(
    config_request: ConnectorConfigRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Create a new data connector"""
    try:
        registry = get_registry()
        
        # Convert request to ConnectorConfig
        config = ConnectorConfig(
            connector_type=ConnectorType(config_request.connector_type),
            name=config_request.name,
            description=config_request.description,
            host=config_request.host,
            port=config_request.port,
            database=config_request.database,
            username=config_request.username,
            password=config_request.password,
            auth_type=AuthenticationType(config_request.auth_type),
            api_key=config_request.api_key,
            token=config_request.token,
            pool_size=config_request.pool_size,
            max_overflow=config_request.max_overflow,
            pool_timeout=config_request.pool_timeout,
            connection_timeout=config_request.connection_timeout,
            query_timeout=config_request.query_timeout,
            use_ssl=config_request.use_ssl,
            ssl_cert_path=config_request.ssl_cert_path,
            ssl_key_path=config_request.ssl_key_path,
            ssl_ca_path=config_request.ssl_ca_path,
            extra_params=config_request.extra_params
        )
        
        # Register connector
        connector_id = await registry.register_connector(config)
        
        # Get the created connector
        connector = registry.get_connector(connector_id)
        if not connector:
            raise HTTPException(status_code=500, detail="Failed to retrieve created connector")
        
        return {
            "connector_id": connector_id,
            "message": f"Connector '{config.name}' created successfully",
            "connector": connector.to_dict(include_secrets=False)
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid configuration: {str(e)}")
    except Exception as e:
        logger.error(f"Failed to create connector: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create connector: {str(e)}")


@router.get("/connectors", response_model=List[Dict[str, Any]])
async def list_connectors(
    connector_type: Optional[str] = None,
    include_disconnected: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """List all registered connectors"""
    try:
        registry = get_registry()
        
        # Filter by type if specified
        filter_type = None
        if connector_type:
            try:
                filter_type = ConnectorType(connector_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid connector type: {connector_type}")
        
        connectors = registry.list_connectors(
            connector_type=filter_type,
            include_disconnected=include_disconnected
        )
        
        return [connector.to_dict(include_secrets=False) for connector in connectors]
        
    except Exception as e:
        logger.error(f"Failed to list connectors: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list connectors: {str(e)}")


@router.get("/connectors/{connector_id}", response_model=Dict[str, Any])
async def get_connector(
    connector_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific connector by ID"""
    try:
        registry = get_registry()
        connector = registry.get_connector(connector_id)
        
        if not connector:
            raise HTTPException(status_code=404, detail=f"Connector {connector_id} not found")
        
        return connector.to_dict(include_secrets=False)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get connector {connector_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get connector: {str(e)}")


@router.delete("/connectors/{connector_id}")
async def delete_connector(
    connector_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a connector"""
    try:
        registry = get_registry()
        
        # Check if connector exists
        connector = registry.get_connector(connector_id)
        if not connector:
            raise HTTPException(status_code=404, detail=f"Connector {connector_id} not found")
        
        # Unregister connector
        await registry.unregister_connector(connector_id)
        
        return {"message": f"Connector {connector_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete connector {connector_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete connector: {str(e)}")


@router.post("/connectors/{connector_id}/connect")
async def connect_connector(
    connector_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Connect to a data source"""
    try:
        registry = get_registry()
        connector = registry.get_connector(connector_id)
        
        if not connector:
            raise HTTPException(status_code=404, detail=f"Connector {connector_id} not found")
        
        # Attempt connection
        result = await connector.connect()
        
        return result.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to connect {connector_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to connect: {str(e)}")


@router.post("/connectors/{connector_id}/disconnect")
async def disconnect_connector(
    connector_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Disconnect from a data source"""
    try:
        registry = get_registry()
        connector = registry.get_connector(connector_id)
        
        if not connector:
            raise HTTPException(status_code=404, detail=f"Connector {connector_id} not found")
        
        # Disconnect
        await connector.disconnect()
        
        return {"message": f"Connector {connector_id} disconnected successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to disconnect {connector_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to disconnect: {str(e)}")


@router.post("/connectors/{connector_id}/test")
async def test_connector(
    connector_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Test connection to a data source"""
    try:
        registry = get_registry()
        connector = registry.get_connector(connector_id)
        
        if not connector:
            raise HTTPException(status_code=404, detail=f"Connector {connector_id} not found")
        
        # Test connection
        result = await connector.test_connection()
        
        return result.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to test connector {connector_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to test connection: {str(e)}")


@router.get("/connectors/{connector_id}/schema")
async def get_connector_schema(
    connector_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get schema information for a connector"""
    try:
        registry = get_registry()
        connector = registry.get_connector(connector_id)
        
        if not connector:
            raise HTTPException(status_code=404, detail=f"Connector {connector_id} not found")
        
        if not connector.is_connected:
            raise HTTPException(status_code=400, detail="Connector is not connected")
        
        # Discover schema
        schema_info = await connector.discover_schema()
        
        return schema_info.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get schema for {connector_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get schema: {str(e)}")


@router.get("/connectors/{connector_id}/tables")
async def get_connector_tables(
    connector_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get list of tables for a connector"""
    try:
        registry = get_registry()
        connector = registry.get_connector(connector_id)
        
        if not connector:
            raise HTTPException(status_code=404, detail=f"Connector {connector_id} not found")
        
        if not connector.is_connected:
            raise HTTPException(status_code=400, detail="Connector is not connected")
        
        # Get table list
        tables = await connector.get_table_list()
        
        return [table.to_dict() for table in tables]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get tables for {connector_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get tables: {str(e)}")


@router.post("/connectors/query")
async def execute_query(
    query_request: QueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """Execute a query on a connector"""
    try:
        registry = get_registry()
        connector = registry.get_connector(query_request.connector_id)
        
        if not connector:
            raise HTTPException(
                status_code=404, 
                detail=f"Connector {query_request.connector_id} not found"
            )
        
        if not connector.is_connected:
            raise HTTPException(status_code=400, detail="Connector is not connected")
        
        # Parse query
        parser = SQLLikeParser()
        universal_query = parser.parse(query_request.query)
        
        # Set additional parameters
        universal_query.parameters = query_request.parameters
        universal_query.limit = query_request.limit
        universal_query.offset = query_request.offset
        universal_query.timeout = query_request.timeout
        
        # Execute query
        result = await connector.execute_query(universal_query)
        
        return result.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to execute query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute query: {str(e)}")


@router.post("/connectors/preview")
async def preview_data(
    preview_request: PreviewRequest,
    db: AsyncSession = Depends(get_db)
):
    """Preview data from a table"""
    try:
        registry = get_registry()
        connector = registry.get_connector(preview_request.connector_id)
        
        if not connector:
            raise HTTPException(
                status_code=404, 
                detail=f"Connector {preview_request.connector_id} not found"
            )
        
        if not connector.is_connected:
            raise HTTPException(status_code=400, detail="Connector is not connected")
        
        # Preview data
        result = await connector.preview_data(
            preview_request.table_name, 
            preview_request.limit
        )
        
        return result.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to preview data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to preview data: {str(e)}")


@router.get("/connectors/{connector_id}/health")
async def get_connector_health(
    connector_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get health status of a connector"""
    try:
        registry = get_registry()
        connector = registry.get_connector(connector_id)
        
        if not connector:
            raise HTTPException(status_code=404, detail=f"Connector {connector_id} not found")
        
        # Get health status
        health_status = await connector.get_health_status()
        
        return health_status.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get health for {connector_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get health status: {str(e)}")


@router.get("/connectors/{connector_id}/metrics")
async def get_connector_metrics(
    connector_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get performance metrics for a connector"""
    try:
        registry = get_registry()
        connector = registry.get_connector(connector_id)
        
        if not connector:
            raise HTTPException(status_code=404, detail=f"Connector {connector_id} not found")
        
        # Get metrics
        metrics = await connector.get_metrics()
        
        return metrics.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get metrics for {connector_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")


@router.get("/registry/stats")
async def get_registry_stats(db: AsyncSession = Depends(get_db)):
    """Get connector registry statistics"""
    try:
        registry = get_registry()
        stats = registry.get_registry_stats()
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get registry stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get registry stats: {str(e)}")


@router.get("/registry/health")
async def get_registry_health(db: AsyncSession = Depends(get_db)):
    """Get health status of all connectors"""
    try:
        registry = get_registry()
        health_results = await registry.health_check_all()
        
        return health_results
        
    except Exception as e:
        logger.error(f"Failed to get registry health: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get registry health: {str(e)}")


@router.get("/types")
async def get_supported_connector_types(db: AsyncSession = Depends(get_db)):
    """Get list of supported connector types"""
    try:
        registry = get_registry()
        supported_types = registry.get_supported_types()
        
        return {
            "supported_types": [ct.value for ct in supported_types],
            "auth_types": [at.value for at in AuthenticationType]
        }
        
    except Exception as e:
        logger.error(f"Failed to get supported types: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get supported types: {str(e)}")