"""
Base Connector Interface
Abstract base class for all data source connectors
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
import asyncio
import logging
import uuid

from .query import (
    UniversalQuery, QueryResult, PreviewResult, SchemaInfo, 
    TableInfo, ColumnInfo, HealthStatus, ConnectorMetrics
)
from .exceptions import ConnectorError, ConnectionError, QueryError

logger = logging.getLogger(__name__)


class ConnectorType(Enum):
    """Types of supported connectors"""
    POSTGRESQL = "postgresql"
    MYSQL = "mysql"
    SQLITE = "sqlite"
    REST_API = "rest_api"
    CSV = "csv"
    JSON = "json"
    MONGODB = "mongodb"
    REDIS = "redis"
    ELASTICSEARCH = "elasticsearch"
    GRAPHQL = "graphql"
    PARQUET = "parquet"
    EXCEL = "excel"


class AuthenticationType(Enum):
    """Types of authentication supported"""
    NONE = "none"
    BASIC = "basic"
    API_KEY = "api_key"
    OAUTH2 = "oauth2"
    JWT = "jwt"
    CERTIFICATE = "certificate"


@dataclass
class ConnectorConfig:
    """Configuration for a connector"""
    connector_type: ConnectorType
    name: str
    description: Optional[str] = None
    
    # Connection settings
    host: Optional[str] = None
    port: Optional[int] = None
    database: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    
    # Authentication
    auth_type: AuthenticationType = AuthenticationType.NONE
    api_key: Optional[str] = None
    token: Optional[str] = None
    
    # Connection pooling
    pool_size: int = 5
    max_overflow: int = 10
    pool_timeout: int = 30
    
    # Timeouts
    connection_timeout: int = 30
    query_timeout: int = 300
    
    # SSL/TLS
    use_ssl: bool = False
    ssl_cert_path: Optional[str] = None
    ssl_key_path: Optional[str] = None
    ssl_ca_path: Optional[str] = None
    
    # Additional settings
    extra_params: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self, include_secrets: bool = False) -> Dict[str, Any]:
        """Convert to dictionary, optionally excluding secrets"""
        result = {
            'connector_type': self.connector_type.value,
            'name': self.name,
            'description': self.description,
            'host': self.host,
            'port': self.port,
            'database': self.database,
            'username': self.username,
            'auth_type': self.auth_type.value,
            'pool_size': self.pool_size,
            'max_overflow': self.max_overflow,
            'pool_timeout': self.pool_timeout,
            'connection_timeout': self.connection_timeout,
            'query_timeout': self.query_timeout,
            'use_ssl': self.use_ssl,
            'ssl_cert_path': self.ssl_cert_path,
            'ssl_key_path': self.ssl_key_path,
            'ssl_ca_path': self.ssl_ca_path,
            'extra_params': self.extra_params
        }
        
        if include_secrets:
            result.update({
                'password': self.password,
                'api_key': self.api_key,
                'token': self.token
            })
        
        return result


@dataclass
class ConnectionResult:
    """Result of connection attempt"""
    success: bool
    message: str
    connection_time_ms: int
    connector_id: str
    details: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'success': self.success,
            'message': self.message,
            'connection_time_ms': self.connection_time_ms,
            'connector_id': self.connector_id,
            'details': self.details
        }


@dataclass
class TestResult:
    """Result of connection test"""
    success: bool
    message: str
    test_time_ms: int
    tests_performed: List[str]
    details: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'success': self.success,
            'message': self.message,
            'test_time_ms': self.test_time_ms,
            'tests_performed': self.tests_performed,
            'details': self.details
        }


class BaseConnector(ABC):
    """Abstract base class for all data source connectors"""
    
    def __init__(self, config: ConnectorConfig):
        self.config = config
        self.id = str(uuid.uuid4())
        self.created_at = datetime.utcnow()
        self.last_used = None
        self.is_connected = False
        self.metrics = ConnectorMetrics()
        self._connection = None
        self._connection_pool = None
        
    @property
    def connector_type(self) -> ConnectorType:
        """Get connector type"""
        return self.config.connector_type
    
    @property
    def name(self) -> str:
        """Get connector name"""
        return self.config.name
    
    # Core connection methods
    @abstractmethod
    async def connect(self) -> ConnectionResult:
        """Establish connection to data source"""
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection to data source"""
        pass
    
    @abstractmethod
    async def test_connection(self) -> TestResult:
        """Test connection to data source"""
        pass
    
    # Schema discovery methods
    @abstractmethod
    async def discover_schema(self) -> SchemaInfo:
        """Discover schema information"""
        pass
    
    @abstractmethod
    async def get_table_list(self) -> List[TableInfo]:
        """Get list of available tables/collections"""
        pass
    
    @abstractmethod
    async def get_column_info(self, table_name: str) -> List[ColumnInfo]:
        """Get column information for a table"""
        pass
    
    # Query execution methods
    @abstractmethod
    async def execute_query(self, query: UniversalQuery) -> QueryResult:
        """Execute a query and return results"""
        pass
    
    @abstractmethod
    async def preview_data(self, table_name: str, limit: int = 100) -> PreviewResult:
        """Preview data from a table"""
        pass
    
    # Health monitoring methods
    async def get_health_status(self) -> HealthStatus:
        """Get current health status"""
        start_time = datetime.utcnow()
        
        try:
            # Perform a simple health check query
            await self._health_check_query()
            
            response_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return HealthStatus(
                is_healthy=True,
                status='healthy',
                last_check=datetime.utcnow(),
                response_time_ms=response_time
            )
            
        except Exception as e:
            return HealthStatus(
                is_healthy=False,
                status='unhealthy',
                last_check=datetime.utcnow(),
                error_message=str(e)
            )
    
    async def get_metrics(self) -> ConnectorMetrics:
        """Get performance metrics"""
        return self.metrics
    
    # Helper methods
    @abstractmethod
    async def _health_check_query(self) -> None:
        """Perform a simple query for health checking"""
        pass
    
    def _update_metrics(self, success: bool, response_time_ms: int) -> None:
        """Update performance metrics"""
        self.metrics.total_queries += 1
        if success:
            self.metrics.successful_queries += 1
        else:
            self.metrics.failed_queries += 1
        
        # Update average response time
        total_time = (self.metrics.avg_response_time_ms * (self.metrics.total_queries - 1) + 
                     response_time_ms)
        self.metrics.avg_response_time_ms = total_time / self.metrics.total_queries
        
        self.metrics.last_query_time = datetime.utcnow()
        self.last_used = datetime.utcnow()
    
    async def _execute_with_timeout(self, coro, timeout: Optional[int] = None) -> Any:
        """Execute coroutine with timeout"""
        timeout = timeout or self.config.query_timeout
        
        try:
            return await asyncio.wait_for(coro, timeout=timeout)
        except asyncio.TimeoutError:
            raise ConnectorError(
                f"Operation timed out after {timeout} seconds",
                connector_type=self.connector_type.value,
                connector_id=self.id
            )
    
    def to_dict(self, include_secrets: bool = False) -> Dict[str, Any]:
        """Convert connector to dictionary"""
        return {
            'id': self.id,
            'connector_type': self.connector_type.value,
            'name': self.name,
            'config': self.config.to_dict(include_secrets=include_secrets),
            'created_at': self.created_at.isoformat(),
            'last_used': self.last_used.isoformat() if self.last_used else None,
            'is_connected': self.is_connected,
            'metrics': self.metrics.to_dict()
        }
    
    def __str__(self) -> str:
        return f"{self.__class__.__name__}(id={self.id}, name={self.name})"
    
    def __repr__(self) -> str:
        return self.__str__()


class ConnectorFactory:
    """Factory for creating connector instances"""
    
    _connector_classes: Dict[ConnectorType, type] = {}
    
    @classmethod
    def register_connector(cls, connector_type: ConnectorType, connector_class: type) -> None:
        """Register a connector class"""
        cls._connector_classes[connector_type] = connector_class
    
    @classmethod
    def create_connector(cls, config: ConnectorConfig) -> BaseConnector:
        """Create a connector instance"""
        connector_class = cls._connector_classes.get(config.connector_type)
        
        if not connector_class:
            raise ConnectorError(
                f"Unsupported connector type: {config.connector_type.value}",
                connector_type=config.connector_type.value
            )
        
        return connector_class(config)
    
    @classmethod
    def get_supported_types(cls) -> List[ConnectorType]:
        """Get list of supported connector types"""
        return list(cls._connector_classes.keys())