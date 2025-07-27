"""
MySQL Database Connector
Provides connectivity and operations for MySQL databases
"""

import asyncio
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import json

try:
    import aiomysql
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False

from ..base.connector import BaseConnector, ConnectionConfig, QueryResult
from ..base.exceptions import ConnectorError, ConnectionError, QueryError

class MySQLConnector(BaseConnector):
    """MySQL database connector implementation"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.connection_pool: Optional[aiomysql.Pool] = None
        
        if not MYSQL_AVAILABLE:
            raise ConnectorError("aiomysql package is required for MySQL connections")
    
    async def connect(self) -> bool:
        """Establish connection to MySQL database"""
        try:
            # Extract connection parameters
            host = self.config.host
            port = self.config.port or 3306
            database = self.config.database
            user = self.config.username
            password = self.config.password
            
            # Additional MySQL-specific parameters
            charset = self.config.options.get('charset', 'utf8mb4')
            autocommit = self.config.options.get('autocommit', True)
            
            # Create connection pool
            self.connection_pool = await aiomysql.create_pool(
                host=host,
                port=port,
                user=user,
                password=password,
                db=database,
                charset=charset,
                autocommit=autocommit,
                minsize=1,
                maxsize=10,
                connect_timeout=self.config.timeout
            )
            
            # Test connection
            async with self.connection_pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute("SELECT 1")
                    result = await cursor.fetchone()
                    if result[0] != 1:
                        raise ConnectionError("Connection test failed")
            
            self.status.is_connected = True
            self.status.last_connection = datetime.now()
            self.status.error_message = None
            
            return True
            
        except Exception as e:
            self.status.is_connected = False
            self.status.error_message = str(e)
            raise ConnectionError(f"Failed to connect to MySQL: {e}")
    
    async def disconnect(self) -> bool:
        """Close MySQL connection"""
        try:
            if self.connection_pool:
                self.connection_pool.close()
                await self.connection_pool.wait_closed()
                self.connection_pool = None
            
            self.status.is_connected = False
            return True
            
        except Exception as e:
            self.status.error_message = str(e)
            return False
    
    async def test_connection(self) -> bool:
        """Test MySQL connection"""
        try:
            if not self.connection_pool:
                return False
            
            async with self.connection_pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute("SELECT VERSION()")
                    version = await cursor.fetchone()
                    self.status.metadata['server_version'] = version[0] if version else 'Unknown'
            
            return True
            
        except Exception as e:
            self.status.error_message = str(e)
            return False
    
    async def execute_query(self, query: str, parameters: Dict[str, Any] = None) -> QueryResult:
        """Execute SQL query on MySQL"""
        if not self.connection_pool:
            raise ConnectionError("Not connected to MySQL database")
        
        start_time = datetime.now()
        
        try:
            async with self.connection_pool.acquire() as conn:
                async with conn.cursor(aiomysql.DictCursor) as cursor:
                    # Execute query with parameters
                    if parameters:
                        await cursor.execute(query, parameters)
                    else:
                        await cursor.execute(query)
                    
                    # Fetch results for SELECT queries
                    if query.strip().upper().startswith('SELECT'):
                        rows = await cursor.fetchall()
                        
                        # Convert to list of dictionaries
                        results = []
                        for row in rows:
                            # Convert datetime objects to ISO strings
                            converted_row = {}
                            for key, value in row.items():
                                if isinstance(value, datetime):
                                    converted_row[key] = value.isoformat()
                                else:
                                    converted_row[key] = value
                            results.append(converted_row)
                        
                        execution_time = (datetime.now() - start_time).total_seconds()
                        
                        return QueryResult(
                            success=True,
                            data=results,
                            row_count=len(results),
                            execution_time_ms=execution_time * 1000,
                            columns=[desc[0] for desc in cursor.description] if cursor.description else []
                        )
                    else:
                        # For non-SELECT queries, return affected rows
                        affected_rows = cursor.rowcount
                        execution_time = (datetime.now() - start_time).total_seconds()
                        
                        return QueryResult(
                            success=True,
                            data=[],
                            row_count=affected_rows,
                            execution_time_ms=execution_time * 1000,
                            columns=[]
                        )
        
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return QueryResult(
                success=False,
                data=[],
                row_count=0,
                execution_time_ms=execution_time * 1000,
                columns=[],
                error_message=str(e)
            )
    
    async def get_schema(self) -> Dict[str, Any]:
        """Get MySQL database schema"""
        try:
            schema = {
                'database': self.config.database,
                'tables': {},
                'views': {},
                'procedures': {},
                'functions': {}
            }
            
            # Get tables
            table_query = """
                SELECT TABLE_NAME, TABLE_TYPE, TABLE_COMMENT, 
                       TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = %s
                ORDER BY TABLE_NAME
            """
            
            result = await self.execute_query(table_query, {'TABLE_SCHEMA': self.config.database})
            
            if result.success:
                for table in result.data:
                    table_name = table['TABLE_NAME']
                    table_info = {
                        'name': table_name,
                        'type': table['TABLE_TYPE'],
                        'comment': table['TABLE_COMMENT'],
                        'estimated_rows': table['TABLE_ROWS'],
                        'data_size': table['DATA_LENGTH'],
                        'index_size': table['INDEX_LENGTH'],
                        'columns': []
                    }
                    
                    # Get columns for this table
                    column_query = """
                        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, 
                               COLUMN_DEFAULT, COLUMN_COMMENT, CHARACTER_MAXIMUM_LENGTH,
                               NUMERIC_PRECISION, NUMERIC_SCALE, COLUMN_KEY
                        FROM information_schema.COLUMNS 
                        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
                        ORDER BY ORDINAL_POSITION
                    """
                    
                    column_result = await self.execute_query(
                        column_query, 
                        {'TABLE_SCHEMA': self.config.database, 'TABLE_NAME': table_name}
                    )
                    
                    if column_result.success:
                        for column in column_result.data:
                            column_info = {
                                'name': column['COLUMN_NAME'],
                                'type': column['DATA_TYPE'],
                                'nullable': column['IS_NULLABLE'] == 'YES',
                                'default': column['COLUMN_DEFAULT'],
                                'comment': column['COLUMN_COMMENT'],
                                'max_length': column['CHARACTER_MAXIMUM_LENGTH'],
                                'precision': column['NUMERIC_PRECISION'],
                                'scale': column['NUMERIC_SCALE'],
                                'is_primary_key': column['COLUMN_KEY'] == 'PRI',
                                'is_unique': column['COLUMN_KEY'] == 'UNI',
                                'is_indexed': column['COLUMN_KEY'] in ['PRI', 'UNI', 'MUL']
                            }
                            table_info['columns'].append(column_info)
                    
                    if table['TABLE_TYPE'] == 'BASE TABLE':
                        schema['tables'][table_name] = table_info
                    else:
                        schema['views'][table_name] = table_info
            
            return schema
            
        except Exception as e:
            raise QueryError(f"Failed to get MySQL schema: {e}")
    
    async def get_sample_data(self, table_name: str, limit: int = 100) -> QueryResult:
        """Get sample data from a MySQL table"""
        try:
            # Escape table name to prevent SQL injection
            escaped_table = f"`{table_name.replace('`', '``')}`"
            query = f"SELECT * FROM {escaped_table} LIMIT %s"
            
            return await self.execute_query(query, {'limit': limit})
            
        except Exception as e:
            return QueryResult(
                success=False,
                data=[],
                row_count=0,
                execution_time_ms=0,
                columns=[],
                error_message=f"Failed to get sample data: {e}"
            )
    
    def get_connection_info(self) -> Dict[str, Any]:
        """Get MySQL connection information"""
        return {
            'connector_type': 'mysql',
            'host': self.config.host,
            'port': self.config.port or 3306,
            'database': self.config.database,
            'username': self.config.username,
            'ssl_enabled': bool(self.config.ssl_config),
            'connection_pool_size': 10 if self.connection_pool else 0,
            'server_version': self.status.metadata.get('server_version', 'Unknown'),
            'charset': self.config.options.get('charset', 'utf8mb4')
        }
    
    async def get_table_statistics(self, table_name: str) -> Dict[str, Any]:
        """Get statistics for a MySQL table"""
        try:
            # Table statistics query
            stats_query = """
                SELECT TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH, DATA_FREE,
                       CREATE_TIME, UPDATE_TIME, CHECK_TIME
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
            """
            
            result = await self.execute_query(
                stats_query, 
                {'TABLE_SCHEMA': self.config.database, 'TABLE_NAME': table_name}
            )
            
            if result.success and result.data:
                stats = result.data[0]
                return {
                    'estimated_rows': stats['TABLE_ROWS'],
                    'data_size_bytes': stats['DATA_LENGTH'],
                    'index_size_bytes': stats['INDEX_LENGTH'],
                    'free_space_bytes': stats['DATA_FREE'],
                    'created_at': stats['CREATE_TIME'].isoformat() if stats['CREATE_TIME'] else None,
                    'updated_at': stats['UPDATE_TIME'].isoformat() if stats['UPDATE_TIME'] else None,
                    'checked_at': stats['CHECK_TIME'].isoformat() if stats['CHECK_TIME'] else None
                }
            
            return {}
            
        except Exception as e:
            return {'error': str(e)}