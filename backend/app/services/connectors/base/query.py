"""
Universal Query Types and Data Structures
Common interfaces for all connector types
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
import uuid


class DataType(Enum):
    """Standard data types across all connectors"""
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    DATE = "date"
    DATETIME = "datetime"
    JSON = "json"
    BINARY = "binary"
    UNKNOWN = "unknown"


class QueryType(Enum):
    """Types of queries supported"""
    SELECT = "select"
    INSERT = "insert"
    UPDATE = "update"
    DELETE = "delete"
    SCHEMA = "schema"
    PREVIEW = "preview"


@dataclass
class ColumnInfo:
    """Information about a table column"""
    name: str
    data_type: DataType
    nullable: bool = True
    primary_key: bool = False
    foreign_key: Optional[str] = None
    default_value: Optional[Any] = None
    max_length: Optional[int] = None
    precision: Optional[int] = None
    scale: Optional[int] = None
    description: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'data_type': self.data_type.value,
            'nullable': self.nullable,
            'primary_key': self.primary_key,
            'foreign_key': self.foreign_key,
            'default_value': self.default_value,
            'max_length': self.max_length,
            'precision': self.precision,
            'scale': self.scale,
            'description': self.description
        }


@dataclass
class TableInfo:
    """Information about a table or collection"""
    name: str
    schema: Optional[str] = None
    columns: List[ColumnInfo] = field(default_factory=list)
    row_count: Optional[int] = None
    size_bytes: Optional[int] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'schema': self.schema,
            'columns': [col.to_dict() for col in self.columns],
            'row_count': self.row_count,
            'size_bytes': self.size_bytes,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


@dataclass
class SchemaInfo:
    """Information about a database schema"""
    name: str
    tables: List[TableInfo] = field(default_factory=list)
    views: List[TableInfo] = field(default_factory=list)
    description: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'tables': [table.to_dict() for table in self.tables],
            'views': [view.to_dict() for view in self.views],
            'description': self.description
        }


@dataclass
class UniversalQuery:
    """Universal query representation"""
    query_type: QueryType
    raw_query: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    limit: Optional[int] = None
    offset: Optional[int] = None
    timeout: Optional[int] = None
    
    # Parsed query components (for SQL-like queries)
    select_fields: List[str] = field(default_factory=list)
    from_table: Optional[str] = None
    where_conditions: List[Dict[str, Any]] = field(default_factory=list)
    group_by: List[str] = field(default_factory=list)
    order_by: List[Dict[str, str]] = field(default_factory=list)  # [{'field': 'name', 'direction': 'ASC'}]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'query_type': self.query_type.value,
            'raw_query': self.raw_query,
            'parameters': self.parameters,
            'limit': self.limit,
            'offset': self.offset,
            'timeout': self.timeout,
            'select_fields': self.select_fields,
            'from_table': self.from_table,
            'where_conditions': self.where_conditions,
            'group_by': self.group_by,
            'order_by': self.order_by
        }


@dataclass
class QueryResult:
    """Result of query execution"""
    data: List[Dict[str, Any]]
    columns: List[str]
    row_count: int
    execution_time_ms: int
    query_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    has_more: bool = False
    next_offset: Optional[int] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'data': self.data,
            'columns': self.columns,
            'row_count': self.row_count,
            'execution_time_ms': self.execution_time_ms,
            'query_id': self.query_id,
            'has_more': self.has_more,
            'next_offset': self.next_offset,
            'metadata': self.metadata
        }


@dataclass
class PreviewResult:
    """Result of data preview operation"""
    sample_data: List[Dict[str, Any]]
    total_rows: Optional[int]
    columns: List[ColumnInfo]
    data_quality: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'sample_data': self.sample_data,
            'total_rows': self.total_rows,
            'columns': [col.to_dict() for col in self.columns],
            'data_quality': self.data_quality
        }


@dataclass
class HealthStatus:
    """Health status of a connector"""
    is_healthy: bool
    status: str  # 'healthy', 'degraded', 'unhealthy'
    last_check: datetime
    response_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'is_healthy': self.is_healthy,
            'status': self.status,
            'last_check': self.last_check.isoformat(),
            'response_time_ms': self.response_time_ms,
            'error_message': self.error_message,
            'details': self.details
        }


@dataclass
class ConnectorMetrics:
    """Performance metrics for a connector"""
    total_queries: int = 0
    successful_queries: int = 0
    failed_queries: int = 0
    avg_response_time_ms: float = 0.0
    last_query_time: Optional[datetime] = None
    connection_pool_size: int = 0
    active_connections: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'total_queries': self.total_queries,
            'successful_queries': self.successful_queries,
            'failed_queries': self.failed_queries,
            'success_rate': self.successful_queries / max(self.total_queries, 1),
            'avg_response_time_ms': self.avg_response_time_ms,
            'last_query_time': self.last_query_time.isoformat() if self.last_query_time else None,
            'connection_pool_size': self.connection_pool_size,
            'active_connections': self.active_connections
        }


class QueryParser(ABC):
    """Abstract base class for query parsers"""
    
    @abstractmethod
    def parse(self, query: str) -> UniversalQuery:
        """Parse a query string into UniversalQuery format"""
        pass
    
    @abstractmethod
    def validate(self, query: UniversalQuery) -> bool:
        """Validate a parsed query"""
        pass


class SQLLikeParser(QueryParser):
    """Parser for SQL-like queries"""
    
    def parse(self, query: str) -> UniversalQuery:
        """Basic SQL parsing - can be enhanced with proper SQL parser"""
        query = query.strip()
        query_lower = query.lower()
        
        # Determine query type
        if query_lower.startswith('select'):
            query_type = QueryType.SELECT
        elif query_lower.startswith('insert'):
            query_type = QueryType.INSERT
        elif query_lower.startswith('update'):
            query_type = QueryType.UPDATE
        elif query_lower.startswith('delete'):
            query_type = QueryType.DELETE
        else:
            query_type = QueryType.SELECT  # Default
        
        # Basic parsing for SELECT queries
        select_fields = []
        from_table = None
        
        if query_type == QueryType.SELECT:
            # Extract SELECT fields (simplified)
            select_part = query[6:].strip()  # Remove 'SELECT'
            if ' from ' in query_lower:
                from_index = query_lower.find(' from ')
                select_part = query[6:from_index].strip()
                from_part = query[from_index + 6:].strip()
                
                # Extract table name (simplified)
                from_table = from_part.split()[0]
                
            # Parse select fields (simplified)
            if select_part.strip() != '*':
                select_fields = [field.strip() for field in select_part.split(',')]
        
        return UniversalQuery(
            query_type=query_type,
            raw_query=query,
            select_fields=select_fields,
            from_table=from_table
        )
    
    def validate(self, query: UniversalQuery) -> bool:
        """Basic validation"""
        if not query.raw_query.strip():
            return False
        
        if query.query_type == QueryType.SELECT and not query.from_table:
            return False
            
        return True