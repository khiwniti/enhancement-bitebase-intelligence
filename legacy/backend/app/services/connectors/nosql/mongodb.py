"""
MongoDB Database Connector
Provides connectivity and operations for MongoDB databases
"""

import asyncio
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import json
from bson import ObjectId

try:
    import motor.motor_asyncio
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False

from ..base.connector import BaseConnector, ConnectionConfig, QueryResult
from ..base.exceptions import ConnectorError, ConnectionError, QueryError

class MongoDBConnector(BaseConnector):
    """MongoDB database connector implementation"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
        self.database: Optional[motor.motor_asyncio.AsyncIOMotorDatabase] = None
        
        if not MONGODB_AVAILABLE:
            raise ConnectorError("motor package is required for MongoDB connections")
    
    async def connect(self) -> bool:
        """Establish connection to MongoDB"""
        try:
            # Build connection string
            if self.config.connection_string:
                connection_string = self.config.connection_string
            else:
                # Build from components
                host = self.config.host or 'localhost'
                port = self.config.port or 27017
                
                if self.config.username and self.config.password:
                    auth_string = f"{self.config.username}:{self.config.password}@"
                else:
                    auth_string = ""
                
                connection_string = f"mongodb://{auth_string}{host}:{port}/{self.config.database or ''}"
            
            # Additional options
            connect_timeout_ms = (self.config.timeout or 30) * 1000
            server_selection_timeout_ms = connect_timeout_ms
            
            # Create client
            self.client = motor.motor_asyncio.AsyncIOMotorClient(
                connection_string,
                connectTimeoutMS=connect_timeout_ms,
                serverSelectionTimeoutMS=server_selection_timeout_ms,
                maxPoolSize=10
            )
            
            # Test connection
            await self.client.admin.command('ping')
            
            # Get database
            if self.config.database:
                self.database = self.client[self.config.database]
            else:
                # Use default database from connection string
                self.database = self.client.get_default_database()
            
            self.status.is_connected = True
            self.status.last_connection = datetime.now()
            self.status.error_message = None
            
            # Get server info
            server_info = await self.client.server_info()
            self.status.metadata['server_version'] = server_info.get('version', 'Unknown')
            
            return True
            
        except Exception as e:
            self.status.is_connected = False
            self.status.error_message = str(e)
            raise ConnectionError(f"Failed to connect to MongoDB: {e}")
    
    async def disconnect(self) -> bool:
        """Close MongoDB connection"""
        try:
            if self.client:
                self.client.close()
                self.client = None
                self.database = None
            
            self.status.is_connected = False
            return True
            
        except Exception as e:
            self.status.error_message = str(e)
            return False
    
    async def test_connection(self) -> bool:
        """Test MongoDB connection"""
        try:
            if not self.client:
                return False
            
            # Ping the server
            await self.client.admin.command('ping')
            return True
            
        except Exception as e:
            self.status.error_message = str(e)
            return False
    
    async def execute_query(self, query: str, parameters: Dict[str, Any] = None) -> QueryResult:
        """Execute MongoDB query"""
        if not self.client or not self.database:
            raise ConnectionError("Not connected to MongoDB database")
        
        start_time = datetime.now()
        
        try:
            # Parse the query (expecting JSON format for MongoDB operations)
            if isinstance(query, str):
                try:
                    query_obj = json.loads(query)
                except json.JSONDecodeError:
                    # If not JSON, treat as collection name for find operation
                    query_obj = {
                        'operation': 'find',
                        'collection': query,
                        'filter': parameters or {}
                    }
            else:
                query_obj = query
            
            operation = query_obj.get('operation', 'find')
            collection_name = query_obj.get('collection')
            
            if not collection_name:
                raise QueryError("Collection name is required")
            
            collection = self.database[collection_name]
            results = []
            row_count = 0
            
            if operation == 'find':
                filter_obj = query_obj.get('filter', {})
                projection = query_obj.get('projection')
                sort = query_obj.get('sort')
                limit = query_obj.get('limit', 1000)  # Default limit
                skip = query_obj.get('skip', 0)
                
                cursor = collection.find(filter_obj, projection)
                
                if sort:
                    cursor = cursor.sort(sort)
                if skip:
                    cursor = cursor.skip(skip)
                if limit:
                    cursor = cursor.limit(limit)
                
                async for document in cursor:
                    # Convert ObjectId to string for JSON serialization
                    doc = self._convert_objectid_to_string(document)
                    results.append(doc)
                
                row_count = len(results)
                
            elif operation == 'aggregate':
                pipeline = query_obj.get('pipeline', [])
                
                async for document in collection.aggregate(pipeline):
                    doc = self._convert_objectid_to_string(document)
                    results.append(doc)
                
                row_count = len(results)
                
            elif operation == 'count':
                filter_obj = query_obj.get('filter', {})
                row_count = await collection.count_documents(filter_obj)
                results = [{'count': row_count}]
                
            elif operation == 'distinct':
                field = query_obj.get('field')
                filter_obj = query_obj.get('filter', {})
                
                if not field:
                    raise QueryError("Field name is required for distinct operation")
                
                distinct_values = await collection.distinct(field, filter_obj)
                results = [{'value': self._convert_objectid_to_string(val)} for val in distinct_values]
                row_count = len(results)
                
            else:
                raise QueryError(f"Unsupported operation: {operation}")
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # Get column names from first result
            columns = list(results[0].keys()) if results else []
            
            return QueryResult(
                success=True,
                data=results,
                row_count=row_count,
                execution_time_ms=execution_time * 1000,
                columns=columns
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
    
    def _convert_objectid_to_string(self, obj: Any) -> Any:
        """Convert ObjectId instances to strings for JSON serialization"""
        if isinstance(obj, ObjectId):
            return str(obj)
        elif isinstance(obj, dict):
            return {key: self._convert_objectid_to_string(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._convert_objectid_to_string(item) for item in obj]
        elif isinstance(obj, datetime):
            return obj.isoformat()
        else:
            return obj
    
    async def get_schema(self) -> Dict[str, Any]:
        """Get MongoDB database schema"""
        try:
            schema = {
                'database': self.database.name,
                'collections': {},
                'indexes': {}
            }
            
            # Get collection names
            collection_names = await self.database.list_collection_names()
            
            for collection_name in collection_names:
                collection = self.database[collection_name]
                
                # Get collection stats
                try:
                    stats = await self.database.command('collStats', collection_name)
                    
                    collection_info = {
                        'name': collection_name,
                        'type': 'collection',
                        'document_count': stats.get('count', 0),
                        'size_bytes': stats.get('size', 0),
                        'storage_size_bytes': stats.get('storageSize', 0),
                        'avg_doc_size': stats.get('avgObjSize', 0),
                        'indexes': []
                    }
                    
                    # Get indexes for this collection
                    indexes = await collection.list_indexes().to_list(length=None)
                    for index in indexes:
                        index_info = {
                            'name': index.get('name'),
                            'fields': index.get('key', {}),
                            'unique': index.get('unique', False),
                            'sparse': index.get('sparse', False),
                            'background': index.get('background', False)
                        }
                        collection_info['indexes'].append(index_info)
                    
                    # Sample a few documents to infer schema
                    sample_docs = await collection.find().limit(10).to_list(length=10)
                    if sample_docs:
                        # Analyze field types from sample
                        field_types = {}
                        for doc in sample_docs:
                            for field, value in doc.items():
                                if field not in field_types:
                                    field_types[field] = set()
                                field_types[field].add(type(value).__name__)
                        
                        collection_info['inferred_schema'] = {
                            field: list(types) for field, types in field_types.items()
                        }
                    
                    schema['collections'][collection_name] = collection_info
                    
                except Exception as e:
                    # If collStats fails, add basic info
                    schema['collections'][collection_name] = {
                        'name': collection_name,
                        'type': 'collection',
                        'error': str(e)
                    }
            
            return schema
            
        except Exception as e:
            raise QueryError(f"Failed to get MongoDB schema: {e}")
    
    async def get_sample_data(self, collection_name: str, limit: int = 100) -> QueryResult:
        """Get sample data from a MongoDB collection"""
        try:
            query = {
                'operation': 'find',
                'collection': collection_name,
                'limit': limit
            }
            
            return await self.execute_query(json.dumps(query))
            
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
        """Get MongoDB connection information"""
        return {
            'connector_type': 'mongodb',
            'database': self.database.name if self.database else None,
            'server_version': self.status.metadata.get('server_version', 'Unknown'),
            'max_pool_size': 10,
            'connected': self.status.is_connected
        }
    
    async def get_collection_statistics(self, collection_name: str) -> Dict[str, Any]:
        """Get statistics for a MongoDB collection"""
        try:
            if not self.database:
                return {'error': 'Not connected to database'}
            
            stats = await self.database.command('collStats', collection_name)
            
            return {
                'document_count': stats.get('count', 0),
                'size_bytes': stats.get('size', 0),
                'storage_size_bytes': stats.get('storageSize', 0),
                'avg_document_size': stats.get('avgObjSize', 0),
                'index_count': stats.get('nindexes', 0),
                'total_index_size': stats.get('totalIndexSize', 0),
                'capped': stats.get('capped', False),
                'max_size': stats.get('maxSize', None) if stats.get('capped') else None
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def build_query_from_params(self, table_name: str, filters: Dict[str, Any] = None,
                               columns: List[str] = None, limit: int = None,
                               offset: int = None, order_by: List[str] = None) -> str:
        """Build MongoDB query from parameters"""
        query = {
            'operation': 'find',
            'collection': table_name
        }
        
        if filters:
            query['filter'] = filters
        
        if columns:
            query['projection'] = {col: 1 for col in columns}
        
        if limit:
            query['limit'] = limit
        
        if offset:
            query['skip'] = offset
        
        if order_by:
            # Convert SQL-style ORDER BY to MongoDB sort
            sort_spec = []
            for order in order_by:
                if order.upper().endswith(' DESC'):
                    field = order[:-5].strip()
                    sort_spec.append((field, -1))
                else:
                    field = order.replace(' ASC', '').strip()
                    sort_spec.append((field, 1))
            query['sort'] = sort_spec
        
        return json.dumps(query)