"""
Base connector module
Core interfaces and types for the connector framework
"""

from .connector import (
    BaseConnector, ConnectorType, ConnectorConfig, ConnectorFactory,
    ConnectionResult, TestResult, AuthenticationType
)
from .query import (
    UniversalQuery, QueryResult, PreviewResult, SchemaInfo, TableInfo, ColumnInfo,
    HealthStatus, ConnectorMetrics, DataType, QueryType, QueryParser, SQLLikeParser
)
from .exceptions import (
    ConnectorError, ConnectionError, AuthenticationError, QueryError, SchemaError,
    ConfigurationError, TimeoutError, RateLimitError, DataValidationError, PermissionError
)

__all__ = [
    # Connector classes
    'BaseConnector',
    'ConnectorFactory',
    'ConnectorType',
    'ConnectorConfig',
    'ConnectionResult',
    'TestResult',
    'AuthenticationType',
    
    # Query classes
    'UniversalQuery',
    'QueryResult',
    'PreviewResult',
    'SchemaInfo',
    'TableInfo',
    'ColumnInfo',
    'HealthStatus',
    'ConnectorMetrics',
    'DataType',
    'QueryType',
    'QueryParser',
    'SQLLikeParser',
    
    # Exception classes
    'ConnectorError',
    'ConnectionError',
    'AuthenticationError',
    'QueryError',
    'SchemaError',
    'ConfigurationError',
    'TimeoutError',
    'RateLimitError',
    'DataValidationError',
    'PermissionError'
]