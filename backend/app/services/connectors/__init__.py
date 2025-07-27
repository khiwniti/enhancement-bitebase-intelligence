"""
BiteBase Intelligence Data Connector Framework
Universal data connectivity for business intelligence
"""

from .base.connector import BaseConnector, ConnectorType, ConnectionResult, TestResult
from .base.query import UniversalQuery, QueryResult, SchemaInfo, TableInfo, ColumnInfo
from .base.exceptions import ConnectorError, ConnectionError, QueryError, SchemaError
from .registry.connector_registry import ConnectorRegistry
from .management.connection_manager import ConnectionManager

__all__ = [
    'BaseConnector',
    'ConnectorType', 
    'ConnectionResult',
    'TestResult',
    'UniversalQuery',
    'QueryResult',
    'SchemaInfo',
    'TableInfo',
    'ColumnInfo',
    'ConnectorError',
    'ConnectionError',
    'QueryError',
    'SchemaError',
    'ConnectorRegistry',
    'ConnectionManager'
]