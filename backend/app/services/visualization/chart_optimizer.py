"""
BiteBase Intelligence Chart Optimizer
Advanced chart optimization and performance tuning
"""

from typing import Dict, List, Any, Optional, Tuple
import logging
from datetime import datetime
import statistics
import math

logger = logging.getLogger(__name__)


class ChartOptimizer:
    """Advanced chart optimization service"""
    
    def __init__(self):
        self.optimization_rules = self._load_optimization_rules()
        self.performance_benchmarks = self._load_performance_benchmarks()
    
    def _load_optimization_rules(self) -> Dict[str, Dict[str, Any]]:
        """Load chart-specific optimization rules"""
        return {
            'data_reduction': {
                'line': {
                    'max_points': 5000,
                    'reduction_methods': ['douglas_peucker', 'uniform_sampling', 'time_based'],
                    'tolerance': 0.01
                },
                'bar': {
                    'max_categories': 50,
                    'reduction_methods': ['top_n', 'aggregation', 'grouping'],
                    'min_value_threshold': 0.01
                },
                'scatter': {
                    'max_points': 10000,
                    'reduction_methods': ['clustering', 'density_sampling', 'random_sampling'],
                    'cluster_threshold': 100
                },
                'heatmap': {
                    'max_cells': 2500,
                    'reduction_methods': ['binning', 'aggregation'],
                    'bin_size': 'auto'
                }
            },
            'rendering': {
                'canvas_vs_svg': {
                    'canvas_threshold': 1000,  # Use canvas for > 1000 elements
                    'svg_max_elements': 500
                },
                'animation': {
                    'disable_threshold': 5000,  # Disable animations for large datasets
                    'reduced_animation_threshold': 1000
                },
                'lazy_loading': {
                    'enable_threshold': 100,  # Enable lazy loading for > 100 widgets
                    'viewport_buffer': 2
                }
            },
            'memory': {
                'data_caching': {
                    'cache_threshold': 1000,  # Cache datasets > 1000 records
                    'max_cache_size_mb': 100,
                    'ttl_seconds': 3600
                },
                'dom_optimization': {
                    'virtual_scrolling_threshold': 500,
                    'element_pooling_threshold': 200
                }
            }
        }
    
    def _load_performance_benchmarks(self) -> Dict[str, Dict[str, float]]:
        """Load performance benchmarks for different chart types"""
        return {
            'render_time_ms': {
                'line': 50,
                'bar': 30,
                'pie': 20,
                'scatter': 100,
                'heatmap': 200,
                'treemap': 150,
                'gauge': 10,
                'table': 80
            },
            'memory_mb': {
                'line': 5,
                'bar': 3,
                'pie': 2,
                'scatter': 15,
                'heatmap': 25,
                'treemap': 20,
                'gauge': 1,
                'table': 10
            },
            'fps_target': {
                'line': 60,
                'bar': 60,
                'pie': 30,
                'scatter': 30,
                'heatmap': 15,
                'treemap': 20,
                'gauge': 60,
                'table': 60
            }
        }
    
    def optimize_chart_performance(self, chart_type: str, data: List[Dict[str, Any]], 
                                 config: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize chart configuration for performance"""
        try:
            optimized_config = config.copy()
            optimizations = []
            
            data_size = len(data)
            estimated_render_time = self._estimate_render_time(chart_type, data_size)
            estimated_memory = self._estimate_memory_usage(chart_type, data_size)
            
            # Data reduction optimizations
            if self._needs_data_reduction(chart_type, data_size):
                reduction_config = self._optimize_data_reduction(chart_type, data, config)
                optimized_config.update(reduction_config)
                optimizations.append('data_reduction')
            
            # Rendering optimizations
            rendering_config = self._optimize_rendering(chart_type, data_size, estimated_render_time)
            optimized_config.update(rendering_config)
            if rendering_config:
                optimizations.append('rendering')
            
            # Memory optimizations
            memory_config = self._optimize_memory_usage(chart_type, data_size, estimated_memory)
            optimized_config.update(memory_config)
            if memory_config:
                optimizations.append('memory')
            
            # Performance monitoring
            optimized_config['_performance'] = {
                'optimizations_applied': optimizations,
                'estimated_render_time_ms': estimated_render_time,
                'estimated_memory_mb': estimated_memory,
                'data_size': data_size,
                'optimization_score': self._calculate_optimization_score(optimizations, data_size),
                'optimized_at': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Applied {len(optimizations)} optimizations to {chart_type} chart")
            return optimized_config
            
        except Exception as e:
            logger.error(f"Error optimizing chart performance: {str(e)}")
            return config
    
    def _needs_data_reduction(self, chart_type: str, data_size: int) -> bool:
        """Check if data reduction is needed"""
        rules = self.optimization_rules['data_reduction'].get(chart_type, {})
        max_points = rules.get('max_points', rules.get('max_categories', 10000))
        return data_size > max_points
    
    def _optimize_data_reduction(self, chart_type: str, data: List[Dict[str, Any]], 
                               config: Dict[str, Any]) -> Dict[str, Any]:
        """Apply data reduction optimizations"""
        rules = self.optimization_rules['data_reduction'].get(chart_type, {})
        reduction_config = {}
        
        if chart_type == 'line':
            reduction_config = self._optimize_line_data(data, rules, config)
        elif chart_type == 'bar':
            reduction_config = self._optimize_bar_data(data, rules, config)
        elif chart_type == 'scatter':
            reduction_config = self._optimize_scatter_data(data, rules, config)
        elif chart_type == 'heatmap':
            reduction_config = self._optimize_heatmap_data(data, rules, config)
        
        return reduction_config
    
    def _optimize_line_data(self, data: List[Dict[str, Any]], rules: Dict[str, Any], 
                          config: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize line chart data"""
        max_points = rules.get('max_points', 5000)
        
        if len(data) <= max_points:
            return {}
        
        # Use Douglas-Peucker algorithm for line simplification
        return {
            'data_sampling': {
                'enabled': True,
                'method': 'douglas_peucker',
                'tolerance': rules.get('tolerance', 0.01),
                'target_points': max_points
            },
            'progressive_loading': {
                'enabled': True,
                'chunk_size': 1000,
                'load_on_zoom': True
            }
        }
    
    def _optimize_bar_data(self, data: List[Dict[str, Any]], rules: Dict[str, Any], 
                         config: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize bar chart data"""
        max_categories = rules.get('max_categories', 50)
        
        if len(data) <= max_categories:
            return {}
        
        return {
            'data_aggregation': {
                'enabled': True,
                'method': 'top_n',
                'top_n': max_categories - 1,  # Reserve one for "Others"
                'others_label': 'Others',
                'sort_by': 'value',
                'sort_order': 'desc'
            },
            'scrolling': {
                'enabled': True,
                'virtual_scrolling': True,
                'item_height': 30
            }
        }
    
    def _optimize_scatter_data(self, data: List[Dict[str, Any]], rules: Dict[str, Any], 
                             config: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize scatter plot data"""
        max_points = rules.get('max_points', 10000)
        
        if len(data) <= max_points:
            return {}
        
        return {
            'data_sampling': {
                'enabled': True,
                'method': 'density_sampling',
                'target_points': max_points,
                'preserve_outliers': True
            },
            'clustering': {
                'enabled': True,
                'cluster_threshold': rules.get('cluster_threshold', 100),
                'show_cluster_info': True
            },
            'level_of_detail': {
                'enabled': True,
                'zoom_levels': [0.1, 0.5, 1.0, 2.0, 5.0],
                'point_sizes': [1, 2, 3, 4, 5]
            }
        }
    
    def _optimize_heatmap_data(self, data: List[Dict[str, Any]], rules: Dict[str, Any], 
                             config: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize heatmap data"""
        max_cells = rules.get('max_cells', 2500)
        
        # Estimate cell count (assuming square grid)
        estimated_cells = len(data)
        
        if estimated_cells <= max_cells:
            return {}
        
        # Calculate optimal bin size
        optimal_bins = int(math.sqrt(max_cells))
        
        return {
            'binning': {
                'enabled': True,
                'bin_size': optimal_bins,
                'aggregation_method': 'average'
            },
            'progressive_rendering': {
                'enabled': True,
                'tile_size': 50,
                'load_visible_tiles_first': True
            }
        }
    
    def _optimize_rendering(self, chart_type: str, data_size: int, 
                          estimated_render_time: float) -> Dict[str, Any]:
        """Apply rendering optimizations"""
        rendering_config = {}
        rules = self.optimization_rules['rendering']
        
        # Canvas vs SVG optimization
        canvas_threshold = rules['canvas_vs_svg']['canvas_threshold']
        if data_size > canvas_threshold:
            rendering_config['renderer'] = 'canvas'
            rendering_config['svg_fallback'] = False
        else:
            rendering_config['renderer'] = 'svg'
        
        # Animation optimization
        animation_rules = rules['animation']
        if data_size > animation_rules['disable_threshold']:
            rendering_config['animations'] = {'enabled': False}
        elif data_size > animation_rules['reduced_animation_threshold']:
            rendering_config['animations'] = {
                'enabled': True,
                'duration': 200,  # Reduced duration
                'easing': 'linear'  # Simpler easing
            }
        
        # Lazy loading
        lazy_rules = rules['lazy_loading']
        if data_size > lazy_rules['enable_threshold']:
            rendering_config['lazy_loading'] = {
                'enabled': True,
                'viewport_buffer': lazy_rules['viewport_buffer'],
                'placeholder_height': 200
            }
        
        return rendering_config
    
    def _optimize_memory_usage(self, chart_type: str, data_size: int, 
                             estimated_memory: float) -> Dict[str, Any]:
        """Apply memory optimizations"""
        memory_config = {}
        rules = self.optimization_rules['memory']
        
        # Data caching
        cache_rules = rules['data_caching']
        if data_size > cache_rules['cache_threshold']:
            memory_config['caching'] = {
                'enabled': True,
                'strategy': 'lru',
                'max_size_mb': cache_rules['max_cache_size_mb'],
                'ttl_seconds': cache_rules['ttl_seconds']
            }
        
        # DOM optimization
        dom_rules = rules['dom_optimization']
        if data_size > dom_rules['virtual_scrolling_threshold']:
            memory_config['virtual_scrolling'] = {
                'enabled': True,
                'item_height': 'auto',
                'buffer_size': 10
            }
        
        if data_size > dom_rules['element_pooling_threshold']:
            memory_config['element_pooling'] = {
                'enabled': True,
                'pool_size': 100,
                'cleanup_interval': 30000
            }
        
        return memory_config
    
    def _estimate_render_time(self, chart_type: str, data_size: int) -> float:
        """Estimate rendering time in milliseconds"""
        base_time = self.performance_benchmarks['render_time_ms'].get(chart_type, 50)
        
        # Linear scaling with data size (simplified model)
        scaling_factor = data_size / 1000  # Base assumption: 1000 data points = base time
        estimated_time = base_time * (1 + scaling_factor * 0.1)
        
        return round(estimated_time, 2)
    
    def _estimate_memory_usage(self, chart_type: str, data_size: int) -> float:
        """Estimate memory usage in MB"""
        base_memory = self.performance_benchmarks['memory_mb'].get(chart_type, 5)
        
        # Estimate based on data size and chart complexity
        data_memory = data_size * 0.001  # Rough estimate: 1KB per data point
        dom_memory = data_size * 0.0005  # DOM elements memory
        
        total_memory = base_memory + data_memory + dom_memory
        return round(total_memory, 2)
    
    def _calculate_optimization_score(self, optimizations: List[str], data_size: int) -> float:
        """Calculate optimization effectiveness score"""
        base_score = 0.5  # Base score without optimizations
        
        # Score improvements based on applied optimizations
        optimization_scores = {
            'data_reduction': 0.3,
            'rendering': 0.2,
            'memory': 0.2,
            'caching': 0.1
        }
        
        score = base_score
        for optimization in optimizations:
            score += optimization_scores.get(optimization, 0.05)
        
        # Adjust for data size complexity
        if data_size > 10000:
            score *= 0.9  # Harder to optimize very large datasets
        elif data_size < 100:
            score *= 1.1  # Easier to optimize small datasets
        
        return min(1.0, round(score, 2))
    
    def analyze_chart_performance(self, chart_type: str, data: List[Dict[str, Any]], 
                                config: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze chart performance characteristics"""
        try:
            data_size = len(data)
            
            analysis = {
                'chart_type': chart_type,
                'data_size': data_size,
                'complexity_score': self._calculate_complexity_score(chart_type, data, config),
                'performance_metrics': {
                    'estimated_render_time_ms': self._estimate_render_time(chart_type, data_size),
                    'estimated_memory_mb': self._estimate_memory_usage(chart_type, data_size),
                    'target_fps': self.performance_benchmarks['fps_target'].get(chart_type, 30)
                },
                'optimization_recommendations': self._get_optimization_recommendations(chart_type, data, config),
                'bottlenecks': self._identify_performance_bottlenecks(chart_type, data, config),
                'analyzed_at': datetime.utcnow().isoformat()
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing chart performance: {str(e)}")
            return {'error': str(e)}
    
    def _calculate_complexity_score(self, chart_type: str, data: List[Dict[str, Any]], 
                                  config: Dict[str, Any]) -> float:
        """Calculate chart complexity score (0-1)"""
        base_complexity = {
            'line': 0.3,
            'bar': 0.2,
            'pie': 0.1,
            'scatter': 0.6,
            'heatmap': 0.8,
            'treemap': 0.7,
            'gauge': 0.1,
            'table': 0.4
        }.get(chart_type, 0.5)
        
        # Adjust for data size
        data_complexity = min(0.4, len(data) / 10000)
        
        # Adjust for configuration complexity
        config_complexity = min(0.3, len(config.keys()) / 20)
        
        total_complexity = base_complexity + data_complexity + config_complexity
        return min(1.0, round(total_complexity, 2))
    
    def _get_optimization_recommendations(self, chart_type: str, data: List[Dict[str, Any]], 
                                        config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get optimization recommendations"""
        recommendations = []
        data_size = len(data)
        
        # Data size recommendations
        if self._needs_data_reduction(chart_type, data_size):
            recommendations.append({
                'type': 'data_reduction',
                'priority': 'high',
                'description': f'Consider reducing data size from {data_size} points',
                'suggested_methods': self.optimization_rules['data_reduction'].get(chart_type, {}).get('reduction_methods', [])
            })
        
        # Rendering recommendations
        estimated_render_time = self._estimate_render_time(chart_type, data_size)
        target_render_time = self.performance_benchmarks['render_time_ms'].get(chart_type, 50)
        
        if estimated_render_time > target_render_time * 2:
            recommendations.append({
                'type': 'rendering',
                'priority': 'medium',
                'description': f'Rendering time may exceed {target_render_time}ms target',
                'suggested_methods': ['canvas_rendering', 'disable_animations', 'lazy_loading']
            })
        
        # Memory recommendations
        estimated_memory = self._estimate_memory_usage(chart_type, data_size)
        target_memory = self.performance_benchmarks['memory_mb'].get(chart_type, 5)
        
        if estimated_memory > target_memory * 2:
            recommendations.append({
                'type': 'memory',
                'priority': 'medium',
                'description': f'Memory usage may exceed {target_memory}MB target',
                'suggested_methods': ['data_caching', 'virtual_scrolling', 'element_pooling']
            })
        
        return recommendations
    
    def _identify_performance_bottlenecks(self, chart_type: str, data: List[Dict[str, Any]], 
                                        config: Dict[str, Any]) -> List[str]:
        """Identify potential performance bottlenecks"""
        bottlenecks = []
        data_size = len(data)
        
        # Data size bottlenecks
        if data_size > 50000:
            bottlenecks.append('very_large_dataset')
        elif data_size > 10000:
            bottlenecks.append('large_dataset')
        
        # Chart type specific bottlenecks
        if chart_type in ['heatmap', 'treemap'] and data_size > 1000:
            bottlenecks.append('complex_chart_large_data')
        
        if chart_type == 'scatter' and data_size > 5000:
            bottlenecks.append('scatter_plot_performance')
        
        # Configuration bottlenecks
        if config.get('animations', {}).get('enabled', True) and data_size > 1000:
            bottlenecks.append('animations_with_large_data')
        
        if config.get('real_time', {}).get('enabled', False):
            bottlenecks.append('real_time_updates')
        
        return bottlenecks