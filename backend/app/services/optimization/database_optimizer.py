"""
Database Performance Optimization Service
Query optimization, indexing, and performance monitoring
"""

import logging
import time
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import sqlalchemy as sa
from sqlalchemy import text, inspect
from sqlalchemy.orm import Session
from sqlalchemy.engine import Engine
import asyncio

from app.core.database import get_db, engine

logger = logging.getLogger(__name__)

class QueryType(str, Enum):
    """Query type classification"""
    SELECT = "SELECT"
    INSERT = "INSERT"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    CREATE = "CREATE"
    DROP = "DROP"
    ALTER = "ALTER"

class OptimizationLevel(str, Enum):
    """Optimization levels"""
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    AGGRESSIVE = "aggressive"

@dataclass
class QueryPerformance:
    """Query performance metrics"""
    query_hash: str
    query_text: str
    query_type: QueryType
    execution_count: int
    total_time_ms: float
    avg_time_ms: float
    min_time_ms: float
    max_time_ms: float
    last_executed: datetime
    table_names: List[str]
    optimization_suggestions: List[str]

@dataclass
class IndexSuggestion:
    """Index optimization suggestion"""
    table_name: str
    column_names: List[str]
    index_type: str  # btree, hash, gin, gist
    estimated_benefit: float  # 0-100 score
    reason: str
    query_patterns: List[str]

@dataclass
class DatabaseStats:
    """Database performance statistics"""
    total_size_mb: float
    table_count: int
    index_count: int
    slow_queries_count: int
    avg_query_time_ms: float
    connections_active: int
    connections_max: int
    cache_hit_ratio: float
    deadlocks_count: int
    last_vacuum: Optional[datetime]

class DatabaseOptimizer:
    """Database performance optimization service"""
    
    def __init__(self, db_engine: Engine = None):
        self.engine = db_engine or engine
        self.query_log: Dict[str, QueryPerformance] = {}
        self.optimization_history: List[Dict[str, Any]] = []
        self.slow_query_threshold_ms = 1000  # 1 second
    
    async def analyze_query_performance(self, hours: int = 24) -> List[QueryPerformance]:
        """Analyze query performance over time period"""
        
        # In a production environment, you would query pg_stat_statements
        # For now, we'll return the tracked queries
        
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        recent_queries = [
            query for query in self.query_log.values()
            if query.last_executed >= cutoff_time
        ]
        
        # Sort by total time (worst performing first)
        recent_queries.sort(key=lambda q: q.total_time_ms, reverse=True)
        
        return recent_queries
    
    async def get_slow_queries(self, limit: int = 10) -> List[QueryPerformance]:
        """Get slowest queries"""
        
        slow_queries = [
            query for query in self.query_log.values()
            if query.avg_time_ms > self.slow_query_threshold_ms
        ]
        
        slow_queries.sort(key=lambda q: q.avg_time_ms, reverse=True)
        return slow_queries[:limit]
    
    async def suggest_indexes(self) -> List[IndexSuggestion]:
        """Suggest database indexes for optimization"""
        
        suggestions = []
        
        try:
            with self.engine.connect() as conn:
                # Get table information
                inspector = inspect(self.engine)
                tables = inspector.get_table_names()
                
                for table_name in tables:
                    columns = inspector.get_columns(table_name)
                    indexes = inspector.get_indexes(table_name)
                    
                    # Analyze query patterns for this table
                    table_queries = [
                        q for q in self.query_log.values()
                        if table_name in q.table_names
                    ]
                    
                    # Suggest indexes based on common patterns
                    suggestions.extend(
                        await self._analyze_table_for_indexes(
                            table_name, columns, indexes, table_queries
                        )
                    )
        
        except Exception as e:
            logger.error(f"Failed to suggest indexes: {e}")
        
        return suggestions
    
    async def _analyze_table_for_indexes(
        self,
        table_name: str,
        columns: List[Dict],
        existing_indexes: List[Dict],
        queries: List[QueryPerformance]
    ) -> List[IndexSuggestion]:
        """Analyze table for index suggestions"""
        
        suggestions = []
        existing_index_columns = set()
        
        # Track existing indexes
        for index in existing_indexes:
            for col in index['column_names']:
                existing_index_columns.add(col.lower())
        
        # Analyze WHERE clauses in queries
        where_columns = self._extract_where_columns(queries)
        
        # Suggest indexes for frequently filtered columns
        for column, frequency in where_columns.items():
            if column.lower() not in existing_index_columns and frequency > 5:
                suggestions.append(IndexSuggestion(
                    table_name=table_name,
                    column_names=[column],
                    index_type="btree",
                    estimated_benefit=min(frequency * 10, 100),
                    reason=f"Frequently used in WHERE clauses ({frequency} times)",
                    query_patterns=[q.query_text[:100] for q in queries if column in q.query_text][:3]
                ))
        
        # Suggest composite indexes for common column combinations
        composite_patterns = self._find_composite_patterns(queries)
        for columns, frequency in composite_patterns.items():
            if frequency > 3 and not any(
                set(columns).issubset(set(idx['column_names'])) for idx in existing_indexes
            ):
                suggestions.append(IndexSuggestion(
                    table_name=table_name,
                    column_names=list(columns),
                    index_type="btree",
                    estimated_benefit=min(frequency * 15, 100),
                    reason=f"Common column combination in queries ({frequency} times)",
                    query_patterns=[q.query_text[:100] for q in queries][:2]
                ))
        
        return suggestions
    
    def _extract_where_columns(self, queries: List[QueryPerformance]) -> Dict[str, int]:
        """Extract columns used in WHERE clauses"""
        where_columns = {}
        
        for query in queries:
            # Simple pattern matching for WHERE clauses
            # In production, use a proper SQL parser
            query_lower = query.query_text.lower()
            if 'where' in query_lower:
                # Extract potential column names after WHERE
                where_part = query_lower.split('where')[1].split('order by')[0].split('group by')[0]
                
                # Look for common column patterns
                import re
                column_pattern = r'\b([a-zA-Z_][a-zA-Z0-9_]*)\s*[=<>!]'
                matches = re.findall(column_pattern, where_part)
                
                for match in matches:
                    if match not in ['and', 'or', 'not', 'in', 'like', 'is']:
                        where_columns[match] = where_columns.get(match, 0) + query.execution_count
        
        return where_columns
    
    def _find_composite_patterns(self, queries: List[QueryPerformance]) -> Dict[Tuple[str, ...], int]:
        """Find common column combinations in queries"""
        patterns = {}
        
        for query in queries:
            # Extract column combinations from WHERE clauses
            # This is a simplified implementation
            query_lower = query.query_text.lower()
            if 'where' in query_lower:
                where_part = query_lower.split('where')[1].split('order by')[0].split('group by')[0]
                
                import re
                columns = re.findall(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\s*[=<>!]', where_part)
                columns = [col for col in columns if col not in ['and', 'or', 'not', 'in', 'like', 'is']]
                
                if len(columns) > 1:
                    pattern = tuple(sorted(columns))
                    patterns[pattern] = patterns.get(pattern, 0) + query.execution_count
        
        return patterns
    
    async def get_database_stats(self) -> DatabaseStats:
        """Get comprehensive database statistics"""
        
        try:
            with self.engine.connect() as conn:
                # Database size
                size_result = conn.execute(text("""
                    SELECT pg_size_pretty(pg_database_size(current_database())) as size,
                           pg_database_size(current_database()) as size_bytes
                """)).fetchone()
                
                # Table and index counts
                counts_result = conn.execute(text("""
                    SELECT 
                        (SELECT count(*) FROM information_schema.tables 
                         WHERE table_schema = 'public') as table_count,
                        (SELECT count(*) FROM pg_indexes 
                         WHERE schemaname = 'public') as index_count
                """)).fetchone()
                
                # Connection stats
                conn_result = conn.execute(text("""
                    SELECT count(*) as active_connections,
                           setting::int as max_connections
                    FROM pg_stat_activity, pg_settings 
                    WHERE pg_settings.name = 'max_connections'
                    GROUP BY setting
                """)).fetchone()
                
                # Cache hit ratio
                cache_result = conn.execute(text("""
                    SELECT round(
                        100 * sum(blks_hit) / (sum(blks_hit) + sum(blks_read)), 2
                    ) as cache_hit_ratio
                    FROM pg_stat_database
                    WHERE datname = current_database()
                """)).fetchone()
                
                return DatabaseStats(
                    total_size_mb=size_result[1] / (1024 * 1024) if size_result else 0,
                    table_count=counts_result[0] if counts_result else 0,
                    index_count=counts_result[1] if counts_result else 0,
                    slow_queries_count=len(await self.get_slow_queries()),
                    avg_query_time_ms=sum(q.avg_time_ms for q in self.query_log.values()) / len(self.query_log) if self.query_log else 0,
                    connections_active=conn_result[0] if conn_result else 0,
                    connections_max=conn_result[1] if conn_result else 0,
                    cache_hit_ratio=cache_result[0] if cache_result else 0,
                    deadlocks_count=0,  # Would need pg_stat_database for this
                    last_vacuum=None  # Would need pg_stat_user_tables for this
                )
                
        except Exception as e:
            logger.error(f"Failed to get database stats: {e}")
            return DatabaseStats(
                total_size_mb=0, table_count=0, index_count=0, slow_queries_count=0,
                avg_query_time_ms=0, connections_active=0, connections_max=0,
                cache_hit_ratio=0, deadlocks_count=0, last_vacuum=None
            )
    
    async def optimize_queries(self, level: OptimizationLevel = OptimizationLevel.BASIC) -> Dict[str, Any]:
        """Perform query optimization"""
        
        optimization_results = {
            'level': level,
            'timestamp': datetime.utcnow(),
            'actions_taken': [],
            'performance_improvement': 0,
            'errors': []
        }
        
        try:
            if level in [OptimizationLevel.BASIC, OptimizationLevel.INTERMEDIATE]:
                # Update table statistics
                await self._update_table_statistics()
                optimization_results['actions_taken'].append('Updated table statistics')
            
            if level in [OptimizationLevel.INTERMEDIATE, OptimizationLevel.ADVANCED]:
                # Analyze and suggest indexes
                suggestions = await self.suggest_indexes()
                high_benefit_suggestions = [s for s in suggestions if s.estimated_benefit > 70]
                
                for suggestion in high_benefit_suggestions[:3]:  # Limit to top 3
                    if await self._create_index(suggestion):
                        optimization_results['actions_taken'].append(
                            f"Created index on {suggestion.table_name}({', '.join(suggestion.column_names)})"
                        )
            
            if level == OptimizationLevel.AGGRESSIVE:
                # Perform VACUUM and ANALYZE
                await self._vacuum_analyze()
                optimization_results['actions_taken'].append('Performed VACUUM ANALYZE')
            
            self.optimization_history.append(optimization_results)
            
        except Exception as e:
            optimization_results['errors'].append(str(e))
            logger.error(f"Query optimization failed: {e}")
        
        return optimization_results
    
    async def _update_table_statistics(self):
        """Update table statistics for query planner"""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("ANALYZE"))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to update statistics: {e}")
    
    async def _create_index(self, suggestion: IndexSuggestion) -> bool:
        """Create suggested index"""
        try:
            index_name = f"idx_{suggestion.table_name}_{'_'.join(suggestion.column_names)}"
            columns_str = ', '.join(suggestion.column_names)
            
            with self.engine.connect() as conn:
                conn.execute(text(f"""
                    CREATE INDEX CONCURRENTLY IF NOT EXISTS {index_name}
                    ON {suggestion.table_name} ({columns_str})
                """))
                conn.commit()
            
            logger.info(f"Created index: {index_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create index: {e}")
            return False
    
    async def _vacuum_analyze(self):
        """Perform VACUUM ANALYZE on all tables"""
        try:
            with self.engine.connect() as conn:
                # Get all table names
                result = conn.execute(text("""
                    SELECT tablename FROM pg_tables 
                    WHERE schemaname = 'public'
                """))
                
                tables = [row[0] for row in result]
                
                for table in tables:
                    conn.execute(text(f"VACUUM ANALYZE {table}"))
                
                conn.commit()
                
        except Exception as e:
            logger.error(f"VACUUM ANALYZE failed: {e}")
    
    def track_query(
        self,
        query_text: str,
        execution_time_ms: float,
        table_names: List[str] = None
    ):
        """Track query performance"""
        
        import hashlib
        query_hash = hashlib.md5(query_text.encode()).hexdigest()
        
        # Determine query type
        query_type = QueryType.SELECT
        query_upper = query_text.upper().strip()
        for qtype in QueryType:
            if query_upper.startswith(qtype.value):
                query_type = qtype
                break
        
        if query_hash in self.query_log:
            # Update existing entry
            perf = self.query_log[query_hash]
            perf.execution_count += 1
            perf.total_time_ms += execution_time_ms
            perf.avg_time_ms = perf.total_time_ms / perf.execution_count
            perf.min_time_ms = min(perf.min_time_ms, execution_time_ms)
            perf.max_time_ms = max(perf.max_time_ms, execution_time_ms)
            perf.last_executed = datetime.utcnow()
        else:
            # Create new entry
            self.query_log[query_hash] = QueryPerformance(
                query_hash=query_hash,
                query_text=query_text,
                query_type=query_type,
                execution_count=1,
                total_time_ms=execution_time_ms,
                avg_time_ms=execution_time_ms,
                min_time_ms=execution_time_ms,
                max_time_ms=execution_time_ms,
                last_executed=datetime.utcnow(),
                table_names=table_names or [],
                optimization_suggestions=[]
            )
    
    async def get_optimization_report(self) -> Dict[str, Any]:
        """Generate comprehensive optimization report"""
        
        db_stats = await self.get_database_stats()
        slow_queries = await self.get_slow_queries()
        index_suggestions = await self.suggest_indexes()
        
        return {
            'database_stats': db_stats,
            'slow_queries': slow_queries[:10],
            'index_suggestions': index_suggestions[:10],
            'optimization_history': self.optimization_history[-5:],
            'recommendations': self._generate_recommendations(db_stats, slow_queries, index_suggestions),
            'generated_at': datetime.utcnow()
        }
    
    def _generate_recommendations(
        self,
        db_stats: DatabaseStats,
        slow_queries: List[QueryPerformance],
        index_suggestions: List[IndexSuggestion]
    ) -> List[str]:
        """Generate optimization recommendations"""
        
        recommendations = []
        
        if db_stats.cache_hit_ratio < 95:
            recommendations.append(
                f"Cache hit ratio is {db_stats.cache_hit_ratio}%. Consider increasing shared_buffers."
            )
        
        if len(slow_queries) > 10:
            recommendations.append(
                f"Found {len(slow_queries)} slow queries. Review and optimize the most frequent ones."
            )
        
        if len(index_suggestions) > 5:
            recommendations.append(
                f"Found {len(index_suggestions)} index suggestions. Implement high-benefit indexes."
            )
        
        if db_stats.connections_active / db_stats.connections_max > 0.8:
            recommendations.append(
                "Connection usage is high. Consider connection pooling or increasing max_connections."
            )
        
        return recommendations

# Global optimizer instance
_optimizer_instance = None

def get_optimizer() -> DatabaseOptimizer:
    """Get global optimizer instance"""
    global _optimizer_instance
    if _optimizer_instance is None:
        _optimizer_instance = DatabaseOptimizer()
    return _optimizer_instance
