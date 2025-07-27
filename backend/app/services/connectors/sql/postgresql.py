"""
PostgreSQL Connector
Implementation for PostgreSQL database connections
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
import asyncpg
from asyncpg import Pool, Connection

from ..base import (
    BaseConnector, ConnectorType, ConnectorConfig, ConnectorFactory,
    UniversalQuery, QueryResult, PreviewResult, SchemaInfo, TableInfo, ColumnInfo,
    ConnectionResult, TestResult, DataType, QueryType,
    ConnectorError, ConnectionError, QueryError, SchemaError
)

logger = logging.getLogger(__name__)


class PostgreSQLConnector(BaseConnector):
    """PostgreSQL database connector"""
    
    def __init__(self, config: ConnectorConfig):
        super().__init__(config)
        self._pool: Optional[Pool] = None
        self._connection: Optional[Connection] = None
        
    async def connect(self) -> ConnectionResult:
        """Establish connection to PostgreSQL database"""
        start_time = datetime.utcnow()
        
        try:
            # Build connection string
            connection_string = self._build_connection_string()
            
            # Create connection pool
            self._pool = await asyncpg.create_pool(
                connection_string,
                min_size=1,
                max_size=self.config.pool_size,
                max_inactive_connection_lifetime=300,
                command_timeout=self.config.query_timeout
            )
            
            # Test the connection
            async with self._pool.acquire() as conn:
                await conn.execute('SELECT 1')
            
            self.is_connected = True
            connection_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            # Update metrics
            self.metrics.connection_pool_size = self.config.pool_size
            self.metrics.active_connections = 1
            
            logger.info(f"Connected to PostgreSQL: {self.config.name}")
            
            return ConnectionResult(
                success=True,
                message="Successfully connected to PostgreSQL database",
                connection_time_ms=connection_time,
                connector_id=self.id,
                details={
                    'host': self.config.host,
                    'port': self.config.port,
                    'database': self.config.database,
                    'pool_size': self.config.pool_size
                }
            )
            
        except Exception as e:
            connection_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            error_msg = f"Failed to connect to PostgreSQL: {str(e)}"
            logger.error(error_msg)
            
            return ConnectionResult(
                success=False,
                message=error_msg,
                connection_time_ms=connection_time,
                connector_id=self.id,
                details={'error': str(e)}
            )
    
    async def disconnect(self) -> None:
        """Close connection to PostgreSQL database"""
        try:
            if self._pool:
                await self._pool.close()
                self._pool = None
            
            self.is_connected = False
            self.metrics.active_connections = 0
            
            logger.info(f"Disconnected from PostgreSQL: {self.config.name}")
            
        except Exception as e:
            logger.error(f"Error disconnecting from PostgreSQL: {str(e)}")
            raise ConnectorError(f"Disconnect failed: {str(e)}")
    
    async def test_connection(self) -> TestResult:
        """Test connection to PostgreSQL database"""
        start_time = datetime.utcnow()
        tests_performed = []
        
        try:
            if not self._pool:
                raise ConnectionError("Not connected to database")
            
            # Test 1: Basic connectivity
            async with self._pool.acquire() as conn:
                await conn.execute('SELECT 1')
                tests_performed.append("basic_connectivity")
                
                # Test 2: Database access
                result = await conn.fetchval('SELECT current_database()')
                tests_performed.append("database_access")
                
                # Test 3: Schema access
                await conn.fetch("""
                    SELECT schemaname FROM pg_tables 
                    WHERE schemaname = 'public' LIMIT 1
                """)
                tests_performed.append("schema_access")
                
                # Test 4: Permission check
                await conn.fetch("""
                    SELECT has_database_privilege(current_user, current_database(), 'CONNECT')
                """)
                tests_performed.append("permission_check")
            
            test_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return TestResult(
                success=True,
                message="All connection tests passed",
                test_time_ms=test_time,
                tests_performed=tests_performed,
                details={'database': result}
            )
            
        except Exception as e:
            test_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return TestResult(
                success=False,
                message=f"Connection test failed: {str(e)}",
                test_time_ms=test_time,
                tests_performed=tests_performed,
                details={'error': str(e)}
            )
    
    async def discover_schema(self) -> SchemaInfo:
        """Discover PostgreSQL database schema"""
        try:
            if not self._pool:
                raise ConnectionError("Not connected to database")
            
            async with self._pool.acquire() as conn:
                # Get all tables
                tables_query = """
                    SELECT 
                        t.table_name,
                        t.table_schema,
                        obj_description(c.oid) as table_comment,
                        pg_total_relation_size(c.oid) as size_bytes
                    FROM information_schema.tables t
                    LEFT JOIN pg_class c ON c.relname = t.table_name
                    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace 
                        AND n.nspname = t.table_schema
                    WHERE t.table_schema = 'public' 
                        AND t.table_type = 'BASE TABLE'
                    ORDER BY t.table_name
                """
                
                table_rows = await conn.fetch(tables_query)
                tables = []
                
                for row in table_rows:
                    # Get column information for each table
                    columns = await self.get_column_info(row['table_name'])
                    
                    # Get row count
                    try:
                        row_count = await conn.fetchval(
                            f'SELECT COUNT(*) FROM "{row["table_name"]}"'
                        )
                    except:
                        row_count = None
                    
                    table_info = TableInfo(
                        name=row['table_name'],
                        schema=row['table_schema'],
                        columns=columns,
                        row_count=row_count,
                        size_bytes=row['size_bytes'],
                        description=row['table_comment']
                    )
                    tables.append(table_info)
                
                # Get views
                views_query = """
                    SELECT 
                        table_name,
                        table_schema,
                        view_definition
                    FROM information_schema.views
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """
                
                view_rows = await conn.fetch(views_query)
                views = []
                
                for row in view_rows:
                    columns = await self.get_column_info(row['table_name'])
                    
                    view_info = TableInfo(
                        name=row['table_name'],
                        schema=row['table_schema'],
                        columns=columns,
                        description="Database view"
                    )
                    views.append(view_info)
                
                return SchemaInfo(
                    name=self.config.database or 'public',
                    tables=tables,
                    views=views,
                    description=f"PostgreSQL database schema for {self.config.database}"
                )
                
        except Exception as e:
            logger.error(f"Schema discovery failed: {str(e)}")
            raise SchemaError(f"Failed to discover schema: {str(e)}")
    
    async def get_table_list(self) -> List[TableInfo]:
        """Get list of available tables"""
        schema_info = await self.discover_schema()
        return schema_info.tables + schema_info.views
    
    async def get_column_info(self, table_name: str) -> List[ColumnInfo]:
        """Get column information for a table"""
        try:
            if not self._pool:
                raise ConnectionError("Not connected to database")
            
            async with self._pool.acquire() as conn:
                query = """
                    SELECT 
                        c.column_name,
                        c.data_type,
                        c.is_nullable,
                        c.column_default,
                        c.character_maximum_length,
                        c.numeric_precision,
                        c.numeric_scale,
                        col_description(pgc.oid, c.ordinal_position) as column_comment,
                        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
                        fk.foreign_table_name
                    FROM information_schema.columns c
                    LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
                    LEFT JOIN (
                        SELECT ku.column_name
                        FROM information_schema.table_constraints tc
                        JOIN information_schema.key_column_usage ku 
                            ON tc.constraint_name = ku.constraint_name
                        WHERE tc.constraint_type = 'PRIMARY KEY' 
                            AND tc.table_name = $1
                    ) pk ON pk.column_name = c.column_name
                    LEFT JOIN (
                        SELECT 
                            ku.column_name,
                            ccu.table_name as foreign_table_name
                        FROM information_schema.table_constraints tc
                        JOIN information_schema.key_column_usage ku 
                            ON tc.constraint_name = ku.constraint_name
                        JOIN information_schema.constraint_column_usage ccu 
                            ON tc.constraint_name = ccu.constraint_name
                        WHERE tc.constraint_type = 'FOREIGN KEY' 
                            AND tc.table_name = $1
                    ) fk ON fk.column_name = c.column_name
                    WHERE c.table_name = $1
                    ORDER BY c.ordinal_position
                """
                
                rows = await conn.fetch(query, table_name)
                columns = []
                
                for row in rows:
                    data_type = self._map_postgresql_type(row['data_type'])
                    
                    column_info = ColumnInfo(
                        name=row['column_name'],
                        data_type=data_type,
                        nullable=row['is_nullable'] == 'YES',
                        primary_key=row['is_primary_key'],
                        foreign_key=row['foreign_table_name'],
                        default_value=row['column_default'],
                        max_length=row['character_maximum_length'],
                        precision=row['numeric_precision'],
                        scale=row['numeric_scale'],
                        description=row['column_comment']
                    )
                    columns.append(column_info)
                
                return columns
                
        except Exception as e:
            logger.error(f"Failed to get column info for {table_name}: {str(e)}")
            raise SchemaError(f"Failed to get column info: {str(e)}")
    
    async def execute_query(self, query: UniversalQuery) -> QueryResult:
        """Execute a query and return results"""
        start_time = datetime.utcnow()
        
        try:
            if not self._pool:
                raise ConnectionError("Not connected to database")
            
            # Translate universal query to PostgreSQL SQL
            sql_query = self._translate_query(query)
            
            async with self._pool.acquire() as conn:
                # Execute query
                if query.query_type == QueryType.SELECT:
                    rows = await conn.fetch(sql_query)
                    
                    # Convert to list of dictionaries
                    data = [dict(row) for row in rows]
                    columns = list(rows[0].keys()) if rows else []
                    
                else:
                    # For non-SELECT queries
                    result = await conn.execute(sql_query)
                    data = []
                    columns = []
                
                execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                
                # Update metrics
                self._update_metrics(True, execution_time)
                
                return QueryResult(
                    data=data,
                    columns=columns,
                    row_count=len(data),
                    execution_time_ms=execution_time,
                    has_more=False,  # TODO: Implement pagination
                    metadata={
                        'query_type': query.query_type.value,
                        'translated_sql': sql_query
                    }
                )
                
        except Exception as e:
            execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            self._update_metrics(False, execution_time)
            
            logger.error(f"Query execution failed: {str(e)}")
            raise QueryError(
                f"Query execution failed: {str(e)}",
                query=query.raw_query,
                connector_type=self.connector_type.value,
                connector_id=self.id
            )
    
    async def preview_data(self, table_name: str, limit: int = 100) -> PreviewResult:
        """Preview data from a table"""
        try:
            if not self._pool:
                raise ConnectionError("Not connected to database")
            
            async with self._pool.acquire() as conn:
                # Get sample data
                sample_query = f'SELECT * FROM "{table_name}" LIMIT {limit}'
                rows = await conn.fetch(sample_query)
                
                sample_data = [dict(row) for row in rows]
                
                # Get total row count
                count_query = f'SELECT COUNT(*) FROM "{table_name}"'
                total_rows = await conn.fetchval(count_query)
                
                # Get column information
                columns = await self.get_column_info(table_name)
                
                # Basic data quality analysis
                data_quality = {
                    'sample_size': len(sample_data),
                    'total_rows': total_rows,
                    'completeness': {}
                }
                
                # Calculate completeness for each column
                if sample_data:
                    for column in columns:
                        col_name = column.name
                        non_null_count = sum(1 for row in sample_data if row.get(col_name) is not None)
                        data_quality['completeness'][col_name] = non_null_count / len(sample_data)
                
                return PreviewResult(
                    sample_data=sample_data,
                    total_rows=total_rows,
                    columns=columns,
                    data_quality=data_quality
                )
                
        except Exception as e:
            logger.error(f"Data preview failed for {table_name}: {str(e)}")
            raise QueryError(f"Data preview failed: {str(e)}")
    
    async def _health_check_query(self) -> None:
        """Perform a simple query for health checking"""
        if not self._pool:
            raise ConnectionError("Not connected to database")
        
        async with self._pool.acquire() as conn:
            await conn.execute('SELECT 1')
    
    def _build_connection_string(self) -> str:
        """Build PostgreSQL connection string"""
        parts = []
        
        if self.config.host:
            parts.append(f"host={self.config.host}")
        if self.config.port:
            parts.append(f"port={self.config.port}")
        if self.config.database:
            parts.append(f"database={self.config.database}")
        if self.config.username:
            parts.append(f"user={self.config.username}")
        if self.config.password:
            parts.append(f"password={self.config.password}")
        
        # SSL configuration
        if self.config.use_ssl:
            parts.append("sslmode=require")
            if self.config.ssl_cert_path:
                parts.append(f"sslcert={self.config.ssl_cert_path}")
            if self.config.ssl_key_path:
                parts.append(f"sslkey={self.config.ssl_key_path}")
            if self.config.ssl_ca_path:
                parts.append(f"sslrootcert={self.config.ssl_ca_path}")
        
        # Additional parameters
        for key, value in self.config.extra_params.items():
            parts.append(f"{key}={value}")
        
        return " ".join(parts)
    
    def _translate_query(self, query: UniversalQuery) -> str:
        """Translate universal query to PostgreSQL SQL"""
        # For now, return the raw query as PostgreSQL supports standard SQL
        # TODO: Implement proper query translation
        return query.raw_query
    
    def _map_postgresql_type(self, pg_type: str) -> DataType:
        """Map PostgreSQL data types to universal data types"""
        type_mapping = {
            'integer': DataType.INTEGER,
            'bigint': DataType.INTEGER,
            'smallint': DataType.INTEGER,
            'numeric': DataType.FLOAT,
            'decimal': DataType.FLOAT,
            'real': DataType.FLOAT,
            'double precision': DataType.FLOAT,
            'character varying': DataType.STRING,
            'varchar': DataType.STRING,
            'character': DataType.STRING,
            'char': DataType.STRING,
            'text': DataType.STRING,
            'boolean': DataType.BOOLEAN,
            'date': DataType.DATE,
            'timestamp': DataType.DATETIME,
            'timestamp with time zone': DataType.DATETIME,
            'timestamp without time zone': DataType.DATETIME,
            'json': DataType.JSON,
            'jsonb': DataType.JSON,
            'bytea': DataType.BINARY
        }
        
        return type_mapping.get(pg_type.lower(), DataType.UNKNOWN)


# Register the PostgreSQL connector
ConnectorFactory.register_connector(ConnectorType.POSTGRESQL, PostgreSQLConnector)