"""
Advanced Query Optimization Service
Analyzes and optimizes database queries for better performance
"""

import time
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import re
import json

class QueryType(Enum):
    SELECT = "select"
    INSERT = "insert"
    UPDATE = "update"
    DELETE = "delete"
    AGGREGATE = "aggregate"
    JOIN = "join"

@dataclass
class QueryMetrics:
    """Metrics for a query execution"""
    query_hash: str
    execution_time_ms: float
    rows_examined: int
    rows_returned: int
    index_used: bool
    cache_hit: bool
    timestamp: datetime
    query_type: QueryType
    optimization_suggestions: List[str]

@dataclass
class QueryPattern:
    """Pattern analysis for recurring queries"""
    pattern_hash: str
    query_template: str
    execution_count: int
    avg_execution_time: float
    max_execution_time: float
    min_execution_time: float
    last_executed: datetime
    optimization_score: float
    suggested_indexes: List[str]

class QueryAnalyzer:
    """Analyzes SQL queries for optimization opportunities"""
    
    def __init__(self):
        self.index_suggestions = {
            'WHERE': self._suggest_where_indexes,
            'ORDER BY': self._suggest_order_indexes,
            'GROUP BY': self._suggest_group_indexes,
            'JOIN': self._suggest_join_indexes
        }
    
    def analyze_query(self, query: str) -> Dict[str, Any]:
        """Analyze a query and provide optimization suggestions"""
        normalized_query = self._normalize_query(query)
        query_type = self._detect_query_type(query)
        
        analysis = {
            'query_type': query_type,
            'normalized_query': normalized_query,
            'complexity_score': self._calculate_complexity(query),
            'suggested_indexes': self._suggest_indexes(query),
            'optimization_hints': self._get_optimization_hints(query),
            'potential_issues': self._detect_issues(query)
        }
        
        return analysis
    
    def _normalize_query(self, query: str) -> str:
        """Normalize query by removing literals and formatting"""
        # Remove extra whitespace
        normalized = re.sub(r'\s+', ' ', query.strip())
        
        # Replace string literals with placeholders
        normalized = re.sub(r"'[^']*'", "'?'", normalized)
        
        # Replace numeric literals with placeholders
        normalized = re.sub(r'\b\d+\b', '?', normalized)
        
        # Convert to lowercase for pattern matching
        normalized = normalized.lower()
        
        return normalized
    
    def _detect_query_type(self, query: str) -> QueryType:
        """Detect the type of SQL query"""
        query_lower = query.lower().strip()
        
        if query_lower.startswith('select'):
            if any(keyword in query_lower for keyword in ['group by', 'count(', 'sum(', 'avg(', 'max(', 'min(']):
                return QueryType.AGGREGATE
            elif 'join' in query_lower:
                return QueryType.JOIN
            else:
                return QueryType.SELECT
        elif query_lower.startswith('insert'):
            return QueryType.INSERT
        elif query_lower.startswith('update'):
            return QueryType.UPDATE
        elif query_lower.startswith('delete'):
            return QueryType.DELETE
        else:
            return QueryType.SELECT
    
    def _calculate_complexity(self, query: str) -> float:
        """Calculate query complexity score (1-10)"""
        complexity = 1.0
        query_lower = query.lower()
        
        # Add complexity for joins
        join_count = len(re.findall(r'\bjoin\b', query_lower))
        complexity += join_count * 1.5
        
        # Add complexity for subqueries
        subquery_count = query_lower.count('(select')
        complexity += subquery_count * 2.0
        
        # Add complexity for aggregations
        agg_functions = ['count(', 'sum(', 'avg(', 'max(', 'min(', 'group_concat(']
        agg_count = sum(query_lower.count(func) for func in agg_functions)
        complexity += agg_count * 1.2
        
        # Add complexity for WHERE conditions
        where_conditions = len(re.findall(r'\bwhere\b.*?(?:\band\b|\bor\b)', query_lower))
        complexity += where_conditions * 0.5
        
        # Add complexity for DISTINCT
        if 'distinct' in query_lower:
            complexity += 1.0
        
        # Add complexity for ORDER BY
        if 'order by' in query_lower:
            complexity += 0.8
        
        return min(complexity, 10.0)
    
    def _suggest_indexes(self, query: str) -> List[str]:
        """Suggest indexes based on query analysis"""
        suggestions = []
        query_lower = query.lower()
        
        # Extract table names
        tables = self._extract_tables(query)
        
        # Analyze WHERE clauses
        where_columns = self._extract_where_columns(query)
        for table, columns in where_columns.items():
            for column in columns:
                suggestions.append(f"CREATE INDEX idx_{table}_{column} ON {table}({column})")
        
        # Analyze JOIN conditions
        join_columns = self._extract_join_columns(query)
        for suggestion in join_columns:
            suggestions.append(suggestion)
        
        # Analyze ORDER BY clauses
        order_columns = self._extract_order_columns(query)
        for table, columns in order_columns.items():
            if len(columns) > 1:
                suggestions.append(f"CREATE INDEX idx_{table}_order ON {table}({', '.join(columns)})")
            else:
                suggestions.append(f"CREATE INDEX idx_{table}_{columns[0]} ON {table}({columns[0]})")
        
        return list(set(suggestions))  # Remove duplicates
    
    def _extract_tables(self, query: str) -> List[str]:
        """Extract table names from query"""
        # Simple table extraction - could be enhanced
        from_match = re.search(r'\bfrom\s+(\w+)', query.lower())
        tables = []
        
        if from_match:
            tables.append(from_match.group(1))
        
        # Extract from JOINs
        join_matches = re.findall(r'\bjoin\s+(\w+)', query.lower())
        tables.extend(join_matches)
        
        return tables
    
    def _extract_where_columns(self, query: str) -> Dict[str, List[str]]:
        """Extract columns used in WHERE clauses"""
        where_columns = {}
        
        # Find WHERE clause
        where_match = re.search(r'\bwhere\b(.*?)(?:\bgroup\s+by\b|\border\s+by\b|\blimit\b|$)', query.lower())
        if not where_match:
            return where_columns
        
        where_clause = where_match.group(1)
        
        # Extract column references (table.column or column)
        column_matches = re.findall(r'(?:(\w+)\.)?(\w+)\s*[=<>!]', where_clause)
        
        for table, column in column_matches:
            if not table:
                table = 'unknown'
            
            if table not in where_columns:
                where_columns[table] = []
            
            if column not in where_columns[table]:
                where_columns[table].append(column)
        
        return where_columns
    
    def _extract_join_columns(self, query: str) -> List[str]:
        """Extract JOIN column suggestions"""
        suggestions = []
        
        # Find JOIN conditions
        join_matches = re.findall(r'\bjoin\s+(\w+).*?\bon\s+(?:(\w+)\.)?(\w+)\s*=\s*(?:(\w+)\.)?(\w+)', query.lower())
        
        for match in join_matches:
            table, left_table, left_col, right_table, right_col = match
            
            if left_table:
                suggestions.append(f"CREATE INDEX idx_{left_table}_{left_col} ON {left_table}({left_col})")
            if right_table:
                suggestions.append(f"CREATE INDEX idx_{right_table}_{right_col} ON {right_table}({right_col})")
        
        return suggestions
    
    def _extract_order_columns(self, query: str) -> Dict[str, List[str]]:
        """Extract columns used in ORDER BY clauses"""
        order_columns = {}
        
        order_match = re.search(r'\border\s+by\s+(.*?)(?:\blimit\b|$)', query.lower())
        if not order_match:
            return order_columns
        
        order_clause = order_match.group(1)
        
        # Extract column references
        column_matches = re.findall(r'(?:(\w+)\.)?(\w+)', order_clause)
        
        for table, column in column_matches:
            if not table:
                table = 'unknown'
            
            if table not in order_columns:
                order_columns[table] = []
            
            if column not in order_columns[table]:
                order_columns[table].append(column)
        
        return order_columns
    
    def _get_optimization_hints(self, query: str) -> List[str]:
        """Get general optimization hints"""
        hints = []
        query_lower = query.lower()
        
        # Check for SELECT *
        if 'select *' in query_lower:
            hints.append("Avoid SELECT * - specify only needed columns")
        
        # Check for DISTINCT without ORDER BY
        if 'distinct' in query_lower and 'order by' not in query_lower:
            hints.append("Consider adding ORDER BY when using DISTINCT for consistent results")
        
        # Check for OR conditions
        if ' or ' in query_lower:
            hints.append("OR conditions can prevent index usage - consider UNION if appropriate")
        
        # Check for LIKE with leading wildcard
        if re.search(r"like\s+['\"]%", query_lower):
            hints.append("LIKE with leading wildcard (%) prevents index usage")
        
        # Check for functions in WHERE clause
        if re.search(r'where.*\w+\(.*\w+.*\)', query_lower):
            hints.append("Functions in WHERE clause can prevent index usage")
        
        # Check for LIMIT without ORDER BY
        if 'limit' in query_lower and 'order by' not in query_lower:
            hints.append("LIMIT without ORDER BY may return inconsistent results")
        
        return hints
    
    def _detect_issues(self, query: str) -> List[str]:
        """Detect potential performance issues"""
        issues = []
        query_lower = query.lower()
        
        # Check for Cartesian products
        if 'join' in query_lower and 'on' not in query_lower:
            issues.append("Potential Cartesian product - missing JOIN condition")
        
        # Check for N+1 query pattern indicators
        if query_lower.count('select') > 1 and 'union' not in query_lower:
            issues.append("Multiple SELECT statements - check for N+1 query pattern")
        
        # Check for inefficient patterns
        if re.search(r'where.*in\s*\(select', query_lower):
            issues.append("WHERE IN (subquery) can be slow - consider EXISTS or JOIN")
        
        return issues
    
    def _suggest_where_indexes(self, columns: List[str]) -> List[str]:
        """Suggest indexes for WHERE clause columns"""
        return [f"INDEX(idx_{col}) ON {col}" for col in columns]
    
    def _suggest_order_indexes(self, columns: List[str]) -> List[str]:
        """Suggest indexes for ORDER BY columns"""
        if len(columns) > 1:
            return [f"COMPOSITE_INDEX({', '.join(columns)})"]
        return [f"INDEX(idx_{columns[0]})"]
    
    def _suggest_group_indexes(self, columns: List[str]) -> List[str]:
        """Suggest indexes for GROUP BY columns"""
        return [f"INDEX(idx_group_{col}) ON {col}" for col in columns]
    
    def _suggest_join_indexes(self, join_conditions: List[Tuple[str, str]]) -> List[str]:
        """Suggest indexes for JOIN conditions"""
        return [f"INDEX(idx_{table}_{col}) ON {table}({col})" for table, col in join_conditions]

class QueryOptimizer:
    """Main query optimization service"""
    
    def __init__(self):
        self.analyzer = QueryAnalyzer()
        self.query_metrics: Dict[str, QueryMetrics] = {}
        self.query_patterns: Dict[str, QueryPattern] = {}
        self.optimization_rules = self._load_optimization_rules()
    
    def _load_optimization_rules(self) -> Dict[str, Any]:
        """Load query optimization rules"""
        return {
            'max_execution_time_ms': 1000,  # Warn if query takes > 1 second
            'max_rows_examined_ratio': 0.1,  # Warn if examining > 10% of table
            'require_index_for_joins': True,
            'require_limit_for_large_selects': True,
            'max_complexity_score': 7.0
        }
    
    def get_query_hash(self, query: str) -> str:
        """Generate hash for query pattern matching"""
        normalized = self.analyzer._normalize_query(query)
        return hashlib.md5(normalized.encode()).hexdigest()
    
    def record_query_execution(self, query: str, execution_time_ms: float, 
                             rows_examined: int = 0, rows_returned: int = 0, 
                             index_used: bool = True, cache_hit: bool = False) -> QueryMetrics:
        """Record query execution metrics"""
        query_hash = self.get_query_hash(query)
        analysis = self.analyzer.analyze_query(query)
        
        # Create metrics
        metrics = QueryMetrics(
            query_hash=query_hash,
            execution_time_ms=execution_time_ms,
            rows_examined=rows_examined,
            rows_returned=rows_returned,
            index_used=index_used,
            cache_hit=cache_hit,
            timestamp=datetime.now(),
            query_type=analysis['query_type'],
            optimization_suggestions=analysis['suggested_indexes'] + analysis['optimization_hints']
        )
        
        # Store metrics
        self.query_metrics[query_hash] = metrics
        
        # Update pattern statistics
        self._update_query_pattern(query_hash, query, metrics, analysis)
        
        return metrics
    
    def _update_query_pattern(self, query_hash: str, query: str, 
                            metrics: QueryMetrics, analysis: Dict[str, Any]):
        """Update query pattern statistics"""
        normalized_query = analysis['normalized_query']
        
        if query_hash in self.query_patterns:
            pattern = self.query_patterns[query_hash]
            pattern.execution_count += 1
            pattern.last_executed = metrics.timestamp
            
            # Update timing statistics
            total_time = pattern.avg_execution_time * (pattern.execution_count - 1) + metrics.execution_time_ms
            pattern.avg_execution_time = total_time / pattern.execution_count
            pattern.max_execution_time = max(pattern.max_execution_time, metrics.execution_time_ms)
            pattern.min_execution_time = min(pattern.min_execution_time, metrics.execution_time_ms)
            
        else:
            pattern = QueryPattern(
                pattern_hash=query_hash,
                query_template=normalized_query,
                execution_count=1,
                avg_execution_time=metrics.execution_time_ms,
                max_execution_time=metrics.execution_time_ms,
                min_execution_time=metrics.execution_time_ms,
                last_executed=metrics.timestamp,
                optimization_score=0.0,
                suggested_indexes=analysis['suggested_indexes']
            )
            
            self.query_patterns[query_hash] = pattern
        
        # Calculate optimization score
        pattern.optimization_score = self._calculate_optimization_score(pattern, analysis)
    
    def _calculate_optimization_score(self, pattern: QueryPattern, analysis: Dict[str, Any]) -> float:
        """Calculate optimization priority score (higher = more important to optimize)"""
        score = 0.0
        
        # Factor in execution frequency
        score += pattern.execution_count * 0.1
        
        # Factor in execution time
        if pattern.avg_execution_time > self.optimization_rules['max_execution_time_ms']:
            score += (pattern.avg_execution_time / 1000) * 2
        
        # Factor in complexity
        complexity = analysis.get('complexity_score', 1)
        if complexity > self.optimization_rules['max_complexity_score']:
            score += complexity
        
        # Factor in potential issues
        issues_count = len(analysis.get('potential_issues', []))
        score += issues_count * 5
        
        return score
    
    def get_optimization_recommendations(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top optimization recommendations"""
        # Sort patterns by optimization score
        sorted_patterns = sorted(
            self.query_patterns.values(),
            key=lambda p: p.optimization_score,
            reverse=True
        )
        
        recommendations = []
        for pattern in sorted_patterns[:limit]:
            metrics = self.query_metrics.get(pattern.pattern_hash)
            
            recommendation = {
                'pattern_hash': pattern.pattern_hash,
                'query_template': pattern.query_template,
                'execution_count': pattern.execution_count,
                'avg_execution_time_ms': pattern.avg_execution_time,
                'optimization_score': pattern.optimization_score,
                'suggested_indexes': pattern.suggested_indexes,
                'optimization_suggestions': metrics.optimization_suggestions if metrics else [],
                'priority': 'high' if pattern.optimization_score > 10 else 'medium' if pattern.optimization_score > 5 else 'low'
            }
            
            recommendations.append(recommendation)
        
        return recommendations
    
    def get_query_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report"""
        if not self.query_metrics:
            return {'status': 'no_data', 'message': 'No query metrics available'}
        
        metrics_list = list(self.query_metrics.values())
        
        # Calculate overall statistics
        total_queries = len(metrics_list)
        avg_execution_time = sum(m.execution_time_ms for m in metrics_list) / total_queries
        slow_queries = len([m for m in metrics_list if m.execution_time_ms > self.optimization_rules['max_execution_time_ms']])
        cache_hit_rate = len([m for m in metrics_list if m.cache_hit]) / total_queries * 100
        
        # Query type distribution
        type_distribution = {}
        for metrics in metrics_list:
            query_type = metrics.query_type.value
            type_distribution[query_type] = type_distribution.get(query_type, 0) + 1
        
        # Performance issues
        issues = []
        for pattern in self.query_patterns.values():
            if pattern.avg_execution_time > self.optimization_rules['max_execution_time_ms']:
                issues.append(f"Slow query pattern: {pattern.query_template[:100]}...")
            
            if pattern.optimization_score > 10:
                issues.append(f"High complexity query: {pattern.query_template[:100]}...")
        
        return {
            'status': 'success',
            'summary': {
                'total_queries': total_queries,
                'avg_execution_time_ms': round(avg_execution_time, 2),
                'slow_queries_count': slow_queries,
                'slow_queries_percentage': round(slow_queries / total_queries * 100, 2),
                'cache_hit_rate_percentage': round(cache_hit_rate, 2)
            },
            'query_type_distribution': type_distribution,
            'top_optimization_opportunities': self.get_optimization_recommendations(5),
            'performance_issues': issues[:10],  # Top 10 issues
            'recommendations': self._get_general_recommendations()
        }
    
    def _get_general_recommendations(self) -> List[str]:
        """Get general performance recommendations"""
        recommendations = []
        
        if not self.query_metrics:
            return recommendations
        
        metrics_list = list(self.query_metrics.values())
        avg_time = sum(m.execution_time_ms for m in metrics_list) / len(metrics_list)
        
        if avg_time > 500:
            recommendations.append("Consider adding database indexes for frequently queried columns")
        
        cache_hit_rate = len([m for m in metrics_list if m.cache_hit]) / len(metrics_list)
        if cache_hit_rate < 0.5:
            recommendations.append("Increase cache hit rate by optimizing cache TTL and strategies")
        
        slow_query_rate = len([m for m in metrics_list if m.execution_time_ms > 1000]) / len(metrics_list)
        if slow_query_rate > 0.1:
            recommendations.append("Review and optimize queries taking longer than 1 second")
        
        no_index_rate = len([m for m in metrics_list if not m.index_used]) / len(metrics_list)
        if no_index_rate > 0.2:
            recommendations.append("Many queries are not using indexes - review table structure")
        
        return recommendations

# Global query optimizer instance
query_optimizer = QueryOptimizer()