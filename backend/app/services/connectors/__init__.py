"""
BiteBase Intelligence Data Connector Framework
Universal data connectivity for business intelligence
"""

from .base.connector import (
    BaseConnector, ConnectorType, ConnectorConfig, ConnectorFactory,
    ConnectionResult, TestResult, AuthenticationType
)
from .base.query import (
    UniversalQuery, QueryResult, SchemaInfo, TableInfo, ColumnInfo,
    QueryType, SQLLikeParser
)
from .base.exceptions import ConnectorError, ConnectionError, QueryError, SchemaError
from .registry.connector_registry import ConnectorRegistry, get_registry
from .management.connection_manager import ConnectionManager

__all__ = [
    'BaseConnector',
    'ConnectorType',
    'ConnectorConfig',
    'ConnectorFactory',
    'ConnectionResult',
    'TestResult',
    'AuthenticationType',
    'UniversalQuery',
    'QueryResult',
    'SchemaInfo',
    'TableInfo',
    'ColumnInfo',
    'QueryType',
    'SQLLikeParser',
    'ConnectorError',
    'ConnectionError',
    'QueryError',
    'SchemaError',
    'ConnectorRegistry',
    'get_registry',
    'ConnectionManager'
]