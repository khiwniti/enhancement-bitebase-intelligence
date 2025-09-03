"""
BiteBase Intelligence Visualization Engine
Chart optimization and data processing service
"""

from typing import Dict, List, Any, Optional, Tuple
import json
import logging
from datetime import datetime
import asyncio
from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dashboard import DashboardWidget
from app.models.widget import WidgetCache

logger = logging.getLogger(__name__)


class VisualizationEngine:
    """Service for chart optimization and visualization processing"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.chart_type_configs = self._load_chart_configurations()
        self.performance_thresholds = {
            'data_points': 10000,
            'render_time_ms': 500,
            'memory_mb': 100
        }
    
    def _load_chart_configurations(self) -> Dict[str, Dict[str, Any]]:
        """Load chart type configurations and optimization rules"""
        return {
            'line': {
                'max_data_points': 5000,
                'aggregation_threshold': 1000,
                'recommended_aggregations': ['avg', 'sum', 'count'],
                'performance_weight': 1.0,
                'supports_real_time': True,
                'memory_efficient': True
            },
            'bar': {
                'max_data_points': 2000,
                'aggregation_threshold': 500,
                'recommended_aggregations': ['sum', 'count', 'avg'],
                'performance_weight': 1.2,
                'supports_real_time': True,
                'memory_efficient': True
            },
            'pie': {
                'max_data_points': 50,
                'aggregation_threshold': 20,
                'recommended_aggregations': ['sum', 'count'],
                'performance_weight': 0.8,
                'supports_real_time': False,
                'memory_efficient': True
            },
            'scatter': {
                'max_data_points': 10000,
                'aggregation_threshold': 5000,
                'recommended_aggregations': ['sample', 'cluster'],
                'performance_weight': 1.5,
                'supports_real_time': False,
                'memory_efficient': False
            },
            'heatmap': {
                'max_data_points': 1000,
                'aggregation_threshold': 500,
                'recommended_aggregations': ['avg', 'sum', 'density'],
                'performance_weight': 2.0,
                'supports_real_time': False,
                'memory_efficient': False
            },
            'treemap': {
                'max_data_points': 500,
                'aggregation_threshold': 200,
                'recommended_aggregations': ['sum', 'count'],
                'performance_weight': 1.8,
                'supports_real_time': False,
                'memory_efficient': False
            },
            'gauge': {
                'max_data_points': 1,
                'aggregation_threshold': 1,
                'recommended_aggregations': ['latest', 'avg'],
                'performance_weight': 0.5,
                'supports_real_time': True,
                'memory_efficient': True
            },
            'table': {
                'max_data_points': 1000,
                'aggregation_threshold': 500,
                'recommended_aggregations': ['paginate', 'filter'],
                'performance_weight': 1.3,
                'supports_real_time': True,
                'memory_efficient': True
            }
        }
    
    async def optimize_chart_config(self, chart_type: str, data: List[Dict[str, Any]], 
                                  current_config: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize chart configuration based on data characteristics"""
        try:
            if chart_type not in self.chart_type_configs:
                logger.warning(f"Unknown chart type: {chart_type}")
                return current_config
            
            chart_config = self.chart_type_configs[chart_type]
            data_size = len(data)
            
            optimized_config = current_config.copy()
            optimizations_applied = []
            
            # Data size optimization
            if data_size > chart_config['max_data_points']:
                optimized_config['data_sampling'] = {
                    'enabled': True,
                    'method': 'uniform',
                    'target_size': chart_config['max_data_points']
                }
                optimizations_applied.append('data_sampling')
            
            # Aggregation recommendations
            if data_size > chart_config['aggregation_threshold']:
                optimized_config['aggregation'] = {
                    'enabled': True,
                    'methods': chart_config['recommended_aggregations'],
                    'auto_select': True
                }
                optimizations_applied.append('aggregation')
            
            # Performance optimizations
            if chart_config['performance_weight'] > 1.5:
                optimized_config['performance'] = {
                    'lazy_loading': True,
                    'virtual_scrolling': True,
                    'debounce_ms': 300
                }
                optimizations_applied.append('performance_tuning')
            
            # Memory optimization
            if not chart_config['memory_efficient']:
                optimized_config['memory'] = {
                    'cleanup_on_unmount': True,
                    'cache_strategy': 'lru',
                    'max_cache_size': 50
                }
                optimizations_applied.append('memory_optimization')
            
            # Real-time support
            if chart_config['supports_real_time']:
                optimized_config['real_time'] = {
                    'enabled': True,
                    'update_interval': 5000,
                    'buffer_size': 100
                }
            else:
                optimized_config['real_time'] = {'enabled': False}
            
            # Add optimization metadata
            optimized_config['_optimization'] = {
                'applied': optimizations_applied,
                'original_data_size': data_size,
                'optimized_at': datetime.utcnow().isoformat(),
                'performance_score': self._calculate_performance_score(chart_type, data_size)
            }
            
            logger.info(f"Optimized {chart_type} chart config with {len(optimizations_applied)} optimizations")
            return optimized_config
            
        except Exception as e:
            logger.error(f"Error optimizing chart config: {str(e)}")
            return current_config
    
    def suggest_chart_types(self, data: List[Dict[str, Any]], 
                          data_schema: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        """Suggest appropriate chart types based on data characteristics"""
        try:
            if not data:
                return []
            
            data_analysis = self._analyze_data_characteristics(data, data_schema)
            suggestions = []
            
            # Analyze data types and relationships
            numeric_fields = data_analysis['numeric_fields']
            categorical_fields = data_analysis['categorical_fields']
            temporal_fields = data_analysis['temporal_fields']
            data_size = data_analysis['size']
            
            # Time series data
            if temporal_fields and numeric_fields:
                suggestions.append({
                    'chart_type': 'line',
                    'confidence': 0.9,
                    'reason': 'Time series data with numeric values',
                    'config': {
                        'x_axis': temporal_fields[0],
                        'y_axis': numeric_fields[0],
                        'time_series': True
                    }
                })
            
            # Categorical comparisons
            if categorical_fields and numeric_fields:
                if len(set(data[0].get(categorical_fields[0], []))) <= 20:
                    suggestions.append({
                        'chart_type': 'bar',
                        'confidence': 0.8,
                        'reason': 'Categorical data with numeric values for comparison',
                        'config': {
                            'x_axis': categorical_fields[0],
                            'y_axis': numeric_fields[0],
                            'orientation': 'vertical'
                        }
                    })
            
            # Part-to-whole relationships
            if len(categorical_fields) == 1 and len(numeric_fields) == 1:
                unique_categories = len(set(str(row.get(categorical_fields[0], '')) for row in data))
                if unique_categories <= 10:
                    suggestions.append({
                        'chart_type': 'pie',
                        'confidence': 0.7,
                        'reason': 'Small number of categories suitable for part-to-whole visualization',
                        'config': {
                            'category': categorical_fields[0],
                            'value': numeric_fields[0]
                        }
                    })
            
            # Correlation analysis
            if len(numeric_fields) >= 2:
                suggestions.append({
                    'chart_type': 'scatter',
                    'confidence': 0.6,
                    'reason': 'Multiple numeric fields suitable for correlation analysis',
                    'config': {
                        'x_axis': numeric_fields[0],
                        'y_axis': numeric_fields[1],
                        'show_trend_line': True
                    }
                })
            
            # Hierarchical data
            if len(categorical_fields) >= 2 and numeric_fields:
                suggestions.append({
                    'chart_type': 'treemap',
                    'confidence': 0.5,
                    'reason': 'Hierarchical categorical data with numeric values',
                    'config': {
                        'hierarchy': categorical_fields[:2],
                        'value': numeric_fields[0]
                    }
                })
            
            # Single value metrics
            if len(numeric_fields) == 1 and data_size == 1:
                suggestions.append({
                    'chart_type': 'gauge',
                    'confidence': 0.9,
                    'reason': 'Single numeric value suitable for gauge display',
                    'config': {
                        'value': numeric_fields[0],
                        'min': 0,
                        'max': 100
                    }
                })
            
            # Tabular data
            if len(data[0].keys()) > 5 or data_size > 100:
                suggestions.append({
                    'chart_type': 'table',
                    'confidence': 0.4,
                    'reason': 'Complex data structure suitable for tabular display',
                    'config': {
                        'columns': list(data[0].keys())[:10],
                        'pagination': True,
                        'sorting': True
                    }
                })
            
            # Sort by confidence and return top suggestions
            suggestions.sort(key=lambda x: x['confidence'], reverse=True)
            return suggestions[:5]
            
        except Exception as e:
            logger.error(f"Error suggesting chart types: {str(e)}")
            return []
    
    def get_available_chart_types(self) -> List[Dict[str, Any]]:
        """Get list of available chart types with their capabilities"""
        chart_types = []
        
        for chart_type, config in self.chart_type_configs.items():
            chart_info = {
                'type': chart_type,
                'name': chart_type.title(),
                'description': self._get_chart_description(chart_type),
                'capabilities': {
                    'max_data_points': config['max_data_points'],
                    'supports_real_time': config['supports_real_time'],
                    'memory_efficient': config['memory_efficient'],
                    'performance_weight': config['performance_weight']
                },
                'use_cases': self._get_chart_use_cases(chart_type),
                'data_requirements': self._get_chart_data_requirements(chart_type)
            }
            chart_types.append(chart_info)
        
        return sorted(chart_types, key=lambda x: x['type'])
    
    async def process_widget_data(self, widget: DashboardWidget, 
                                raw_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process and optimize widget data for visualization"""
        try:
            processed_data = {
                'data': raw_data,
                'metadata': {
                    'size': len(raw_data),
                    'processed_at': datetime.utcnow().isoformat(),
                    'widget_id': widget.id
                }
            }
            
            # Apply data transformations based on widget config
            if widget.data_config:
                processed_data['data'] = await self._apply_data_transformations(
                    raw_data, widget.data_config
                )
            
            # Optimize for chart type
            if widget.chart_type:
                optimized_config = await self.optimize_chart_config(
                    widget.chart_type, processed_data['data'], widget.chart_props or {}
                )
                processed_data['optimized_config'] = optimized_config
            
            # Cache processed data if beneficial
            if len(raw_data) > 100:  # Cache larger datasets
                await self._cache_widget_data(widget.id, processed_data)
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Error processing widget data: {str(e)}")
            return {'data': raw_data, 'error': str(e)}
    
    def _analyze_data_characteristics(self, data: List[Dict[str, Any]], 
                                    schema: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Analyze data characteristics for chart type suggestions"""
        if not data:
            return {'size': 0, 'numeric_fields': [], 'categorical_fields': [], 'temporal_fields': []}
        
        sample_row = data[0]
        numeric_fields = []
        categorical_fields = []
        temporal_fields = []
        
        for field, value in sample_row.items():
            if schema and field in schema:
                field_type = schema[field]
                if field_type in ['int', 'float', 'number']:
                    numeric_fields.append(field)
                elif field_type in ['datetime', 'date', 'timestamp']:
                    temporal_fields.append(field)
                else:
                    categorical_fields.append(field)
            else:
                # Infer type from value
                if isinstance(value, (int, float)):
                    numeric_fields.append(field)
                elif isinstance(value, str):
                    # Check if it's a date string
                    if self._is_date_string(value):
                        temporal_fields.append(field)
                    else:
                        categorical_fields.append(field)
                else:
                    categorical_fields.append(field)
        
        return {
            'size': len(data),
            'numeric_fields': numeric_fields,
            'categorical_fields': categorical_fields,
            'temporal_fields': temporal_fields,
            'field_count': len(sample_row.keys())
        }
    
    def _is_date_string(self, value: str) -> bool:
        """Check if a string value represents a date"""
        date_patterns = [
            '%Y-%m-%d', '%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S',
            '%m/%d/%Y', '%d/%m/%Y', '%Y/%m/%d'
        ]
        
        for pattern in date_patterns:
            try:
                datetime.strptime(value, pattern)
                return True
            except ValueError:
                continue
        return False
    
    def _calculate_performance_score(self, chart_type: str, data_size: int) -> float:
        """Calculate performance score for a chart configuration"""
        if chart_type not in self.chart_type_configs:
            return 0.5
        
        config = self.chart_type_configs[chart_type]
        
        # Base score from chart type efficiency
        base_score = 1.0 / config['performance_weight']
        
        # Adjust for data size
        max_points = config['max_data_points']
        if data_size <= max_points:
            size_score = 1.0
        else:
            size_score = max_points / data_size
        
        # Memory efficiency bonus
        memory_bonus = 0.1 if config['memory_efficient'] else 0.0
        
        # Real-time capability bonus
        realtime_bonus = 0.1 if config['supports_real_time'] else 0.0
        
        final_score = min(1.0, base_score * size_score + memory_bonus + realtime_bonus)
        return round(final_score, 2)
    
    async def _apply_data_transformations(self, data: List[Dict[str, Any]], 
                                        config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply data transformations based on configuration"""
        transformed_data = data.copy()
        
        # Apply filters
        if 'filters' in config:
            for filter_config in config['filters']:
                transformed_data = self._apply_filter(transformed_data, filter_config)
        
        # Apply aggregations
        if 'aggregations' in config:
            transformed_data = self._apply_aggregations(transformed_data, config['aggregations'])
        
        # Apply sorting
        if 'sorting' in config:
            transformed_data = self._apply_sorting(transformed_data, config['sorting'])
        
        # Apply pagination
        if 'pagination' in config:
            transformed_data = self._apply_pagination(transformed_data, config['pagination'])
        
        return transformed_data
    
    def _apply_filter(self, data: List[Dict[str, Any]], filter_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply a single filter to the data"""
        field = filter_config.get('field')
        operator = filter_config.get('operator', 'eq')
        value = filter_config.get('value')
        
        if not field or value is None:
            return data
        
        filtered_data = []
        for row in data:
            row_value = row.get(field)
            
            if operator == 'eq' and row_value == value:
                filtered_data.append(row)
            elif operator == 'neq' and row_value != value:
                filtered_data.append(row)
            elif operator == 'gt' and isinstance(row_value, (int, float)) and row_value > value:
                filtered_data.append(row)
            elif operator == 'gte' and isinstance(row_value, (int, float)) and row_value >= value:
                filtered_data.append(row)
            elif operator == 'lt' and isinstance(row_value, (int, float)) and row_value < value:
                filtered_data.append(row)
            elif operator == 'lte' and isinstance(row_value, (int, float)) and row_value <= value:
                filtered_data.append(row)
            elif operator == 'contains' and isinstance(row_value, str) and value in row_value:
                filtered_data.append(row)
        
        return filtered_data
    
    def _apply_aggregations(self, data: List[Dict[str, Any]], agg_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply aggregations to the data"""
        # This is a simplified implementation
        # In a real system, you'd want more sophisticated aggregation logic
        group_by = agg_config.get('group_by')
        aggregates = agg_config.get('aggregates', {})
        
        if not group_by or not aggregates:
            return data
        
        # Group data
        groups = {}
        for row in data:
            key = row.get(group_by)
            if key not in groups:
                groups[key] = []
            groups[key].append(row)
        
        # Apply aggregations
        result = []
        for key, group_data in groups.items():
            agg_row = {group_by: key}
            
            for field, agg_func in aggregates.items():
                values = [row.get(field) for row in group_data if row.get(field) is not None]
                
                if agg_func == 'sum':
                    agg_row[field] = sum(values) if values else 0
                elif agg_func == 'avg':
                    agg_row[field] = sum(values) / len(values) if values else 0
                elif agg_func == 'count':
                    agg_row[field] = len(values)
                elif agg_func == 'min':
                    agg_row[field] = min(values) if values else None
                elif agg_func == 'max':
                    agg_row[field] = max(values) if values else None
            
            result.append(agg_row)
        
        return result
    
    def _apply_sorting(self, data: List[Dict[str, Any]], sort_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply sorting to the data"""
        field = sort_config.get('field')
        order = sort_config.get('order', 'asc')
        
        if not field:
            return data
        
        reverse = order == 'desc'
        return sorted(data, key=lambda x: x.get(field, ''), reverse=reverse)
    
    def _apply_pagination(self, data: List[Dict[str, Any]], page_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply pagination to the data"""
        page = page_config.get('page', 1)
        page_size = page_config.get('page_size', 50)
        
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        return data[start_idx:end_idx]
    
    async def _cache_widget_data(self, widget_id: str, processed_data: Dict[str, Any]):
        """Cache processed widget data"""
        try:
            cache_key = f"widget_data_{widget_id}_{hash(str(processed_data))}"
            
            cache_entry = WidgetCache(
                widget_id=widget_id,
                cache_key=cache_key,
                cached_data=processed_data,
                data_size=len(json.dumps(processed_data)),
                expires_at=datetime.utcnow() + timedelta(hours=1)
            )
            
            self.db.add(cache_entry)
            await self.db.commit()
            
        except Exception as e:
            logger.error(f"Error caching widget data: {str(e)}")
    
    def _get_chart_description(self, chart_type: str) -> str:
        """Get description for a chart type"""
        descriptions = {
            'line': 'Display trends over time with connected data points',
            'bar': 'Compare values across categories using rectangular bars',
            'pie': 'Show part-to-whole relationships in a circular format',
            'scatter': 'Visualize correlations between two numeric variables',
            'heatmap': 'Display data density or intensity using color gradients',
            'treemap': 'Show hierarchical data using nested rectangles',
            'gauge': 'Display single values with progress or performance indicators',
            'table': 'Present structured data in rows and columns'
        }
        return descriptions.get(chart_type, 'Custom chart visualization')
    
    def _get_chart_use_cases(self, chart_type: str) -> List[str]:
        """Get use cases for a chart type"""
        use_cases = {
            'line': ['Time series analysis', 'Trend visualization', 'Performance tracking'],
            'bar': ['Category comparison', 'Ranking data', 'Survey results'],
            'pie': ['Market share', 'Budget allocation', 'Demographic breakdown'],
            'scatter': ['Correlation analysis', 'Outlier detection', 'Regression analysis'],
            'heatmap': ['Geographic data', 'Correlation matrices', 'Activity patterns'],
            'treemap': ['File system visualization', 'Budget hierarchies', 'Market segments'],
            'gauge': ['KPI dashboards', 'Progress tracking', 'Performance metrics'],
            'table': ['Data exploration', 'Detailed reporting', 'Raw data display']
        }
        return use_cases.get(chart_type, ['General data visualization'])
    
    def _get_chart_data_requirements(self, chart_type: str) -> Dict[str, Any]:
        """Get data requirements for a chart type"""
        requirements = {
            'line': {'min_fields': 2, 'required_types': ['numeric', 'temporal']},
            'bar': {'min_fields': 2, 'required_types': ['categorical', 'numeric']},
            'pie': {'min_fields': 2, 'required_types': ['categorical', 'numeric']},
            'scatter': {'min_fields': 2, 'required_types': ['numeric', 'numeric']},
            'heatmap': {'min_fields': 3, 'required_types': ['categorical', 'categorical', 'numeric']},
            'treemap': {'min_fields': 2, 'required_types': ['hierarchical', 'numeric']},
            'gauge': {'min_fields': 1, 'required_types': ['numeric']},
            'table': {'min_fields': 1, 'required_types': ['any']}
        }
        return requirements.get(chart_type, {'min_fields': 1, 'required_types': ['any']})