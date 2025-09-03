"""
BiteBase Intelligence Pattern Analyzer
Advanced pattern recognition for restaurant business insights
"""

import numpy as np
import pandas as pd
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_
from sqlalchemy.orm import selectinload
from scipy import stats
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from app.models.restaurant import Restaurant, RestaurantAnalytics, MenuItem
from app.models.insights import InsightPattern

logger = logging.getLogger(__name__)


class PatternAnalyzer:
    """
    Advanced pattern analysis for identifying business trends and opportunities
    Implements clustering, correlation analysis, and time series pattern recognition
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        
        # Analysis configurations
        self.config = {
            'min_data_points': 14,  # Minimum days of data
            'correlation_threshold': 0.7,  # Strong correlation threshold
            'pattern_confidence_threshold': 0.75,
            'seasonal_periods': [7, 30],  # Weekly and monthly patterns
            'clustering_components': 3,  # Number of customer segments
            'trend_significance': 0.05  # P-value threshold for trend significance
        }
        
        # Pattern templates for common business insights
        self.pattern_templates = {
            'revenue_growth': {
                'conditions': {'trend_slope': '> 0', 'trend_significance': '< 0.05'},
                'thresholds': {'min_growth_rate': 0.05, 'min_confidence': 0.8}
            },
            'customer_retention': {
                'conditions': {'repeat_customer_rate': '> 0.6'},
                'thresholds': {'min_retention': 0.6, 'min_confidence': 0.75}
            },
            'menu_optimization': {
                'conditions': {'item_performance_variance': '> 0.3'},
                'thresholds': {'min_variance': 0.3, 'min_confidence': 0.7}
            }
        }
    
    async def analyze_customer_patterns(self, customer_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Analyze customer behavior patterns and identify significant changes
        """
        patterns = []
        
        try:
            if not customer_data or 'time_series' not in customer_data:
                return patterns
            
            time_series = customer_data['time_series']
            if len(time_series) < self.config['min_data_points']:
                return patterns
            
            # Convert to DataFrame
            df = pd.DataFrame(time_series)
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            # Analyze customer count patterns
            customer_patterns = await self._analyze_customer_count_patterns(df)
            patterns.extend(customer_patterns)
            
            # Analyze order value patterns
            order_value_patterns = await self._analyze_order_value_patterns(df)
            patterns.extend(order_value_patterns)
            
            # Analyze customer acquisition patterns
            acquisition_patterns = await self._analyze_acquisition_patterns(df)
            patterns.extend(acquisition_patterns)
            
            # Analyze customer behavior correlation
            correlation_patterns = await self._analyze_customer_correlations(df)
            patterns.extend(correlation_patterns)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing customer patterns: {str(e)}")
            return patterns
    
    async def _analyze_customer_count_patterns(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze patterns in customer count"""
        patterns = []
        
        try:
            if 'customers' not in df.columns:
                return patterns
            
            # Calculate trend
            x = np.arange(len(df))
            y = df['customers'].values
            
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
            
            # Significant trend detection
            if p_value < self.config['trend_significance'] and abs(r_value) > 0.5:
                trend_type = 'increasing' if slope > 0 else 'decreasing'
                
                # Calculate pattern strength
                significance = 1 - p_value
                confidence = min(0.95, abs(r_value) * significance)
                
                if confidence >= self.config['pattern_confidence_threshold']:
                    # Calculate impact
                    total_change = slope * len(df)
                    avg_customers = df['customers'].mean()
                    impact = abs(total_change) / avg_customers if avg_customers > 0 else 0
                    impact = min(1.0, impact)
                    
                    pattern = {
                        'pattern_type': 'customer_trend',
                        'description': f"Customer count shows {trend_type} trend over time",
                        'significance': confidence,
                        'impact': impact,
                        'urgency': self._calculate_pattern_urgency(confidence, impact, trend_type),
                        'severity': self._calculate_pattern_severity(impact, trend_type),
                        'data_points': {
                            'slope': slope,
                            'r_value': r_value,
                            'p_value': p_value,
                            'trend_direction': trend_type,
                            'total_change': total_change
                        },
                        'context': {
                            'analysis_period_days': len(df),
                            'avg_customers_per_day': avg_customers,
                            'trend_strength': abs(r_value)
                        },
                        'recommendations': self._generate_customer_trend_recommendations(trend_type, impact)
                    }
                    
                    patterns.append(pattern)
            
            # Detect cyclical patterns
            cyclical_patterns = await self._detect_cyclical_patterns(df, 'customers', 'customer_count')
            patterns.extend(cyclical_patterns)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing customer count patterns: {str(e)}")
            return patterns
    
    async def _analyze_order_value_patterns(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze patterns in average order value"""
        patterns = []
        
        try:
            if 'avg_order_value' not in df.columns:
                return patterns
            
            # Remove null values
            df_clean = df.dropna(subset=['avg_order_value'])
            if len(df_clean) < self.config['min_data_points']:
                return patterns
            
            # Analyze order value volatility
            aov_std = df_clean['avg_order_value'].std()
            aov_mean = df_clean['avg_order_value'].mean()
            
            if aov_mean > 0:
                volatility = aov_std / aov_mean
                
                if volatility > 0.3:  # High volatility threshold
                    confidence = min(0.9, volatility / 0.5)
                    
                    pattern = {
                        'pattern_type': 'order_value_volatility',
                        'description': f"High volatility in average order value (CV: {volatility:.2f})",
                        'significance': confidence,
                        'impact': min(1.0, volatility),
                        'urgency': self._calculate_pattern_urgency(confidence, volatility, 'volatility'),
                        'severity': 'medium' if volatility < 0.5 else 'high',
                        'data_points': {
                            'volatility': volatility,
                            'std_dev': aov_std,
                            'mean_aov': aov_mean,
                            'coefficient_variation': volatility
                        },
                        'context': {
                            'analysis_period': len(df_clean),
                            'volatility_interpretation': 'high' if volatility > 0.5 else 'moderate'
                        },
                        'recommendations': [
                            "Investigate factors causing order value fluctuations",
                            "Consider implementing dynamic pricing strategies",
                            "Analyze customer segments with different spending patterns",
                            "Review menu pricing and promotional strategies"
                        ]
                    }
                    
                    patterns.append(pattern)
            
            # Analyze order value trends
            x = np.arange(len(df_clean))
            y = df_clean['avg_order_value'].values
            
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
            
            if p_value < self.config['trend_significance'] and abs(r_value) > 0.4:
                trend_type = 'increasing' if slope > 0 else 'decreasing'
                confidence = min(0.95, abs(r_value) * (1 - p_value))
                
                if confidence >= 0.7:
                    impact = abs(slope * len(df_clean)) / aov_mean if aov_mean > 0 else 0
                    impact = min(1.0, impact)
                    
                    pattern = {
                        'pattern_type': 'order_value_trend',
                        'description': f"Average order value shows {trend_type} trend",
                        'significance': confidence,
                        'impact': impact,
                        'urgency': self._calculate_pattern_urgency(confidence, impact, trend_type),
                        'severity': self._calculate_pattern_severity(impact, trend_type),
                        'data_points': {
                            'slope': slope,
                            'r_value': r_value,
                            'p_value': p_value,
                            'trend_direction': trend_type
                        },
                        'context': {
                            'trend_strength': abs(r_value),
                            'statistical_significance': p_value
                        },
                        'recommendations': self._generate_aov_trend_recommendations(trend_type, impact)
                    }
                    
                    patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing order value patterns: {str(e)}")
            return patterns
    
    async def _analyze_acquisition_patterns(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze customer acquisition patterns"""
        patterns = []
        
        try:
            if 'website_visits' not in df.columns or 'online_orders' not in df.columns:
                return patterns
            
            # Calculate conversion rate
            df_clean = df.dropna(subset=['website_visits', 'online_orders'])
            if len(df_clean) < self.config['min_data_points']:
                return patterns
            
            # Avoid division by zero
            df_clean = df_clean[df_clean['website_visits'] > 0]
            if len(df_clean) == 0:
                return patterns
            
            df_clean['conversion_rate'] = df_clean['online_orders'] / df_clean['website_visits']
            
            # Analyze conversion rate trends
            x = np.arange(len(df_clean))
            y = df_clean['conversion_rate'].values
            
            if len(y) > 3 and np.std(y) > 0:
                slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
                
                if p_value < self.config['trend_significance'] and abs(r_value) > 0.5:
                    trend_type = 'improving' if slope > 0 else 'declining'
                    confidence = min(0.95, abs(r_value) * (1 - p_value))
                    
                    if confidence >= 0.7:
                        avg_conversion = df_clean['conversion_rate'].mean()
                        impact = abs(slope * len(df_clean)) / avg_conversion if avg_conversion > 0 else 0
                        impact = min(1.0, impact)
                        
                        pattern = {
                            'pattern_type': 'conversion_trend',
                            'description': f"Online conversion rate is {trend_type}",
                            'significance': confidence,
                            'impact': impact,
                            'urgency': self._calculate_pattern_urgency(confidence, impact, trend_type),
                            'severity': self._calculate_pattern_severity(impact, trend_type),
                            'data_points': {
                                'slope': slope,
                                'r_value': r_value,
                                'p_value': p_value,
                                'avg_conversion_rate': avg_conversion,
                                'trend_direction': trend_type
                            },
                            'context': {
                                'analysis_period': len(df_clean),
                                'conversion_rate_range': [df_clean['conversion_rate'].min(), df_clean['conversion_rate'].max()]
                            },
                            'recommendations': self._generate_conversion_recommendations(trend_type, avg_conversion)
                        }
                        
                        patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing acquisition patterns: {str(e)}")
            return patterns
    
    async def _analyze_customer_correlations(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze correlations between customer metrics"""
        patterns = []
        
        try:
            # Select numeric columns for correlation analysis
            numeric_cols = ['customers', 'avg_order_value', 'website_visits', 'online_orders']
            available_cols = [col for col in numeric_cols if col in df.columns]
            
            if len(available_cols) < 2:
                return patterns
            
            # Calculate correlation matrix
            corr_matrix = df[available_cols].corr()
            
            # Find strong correlations
            for i, col1 in enumerate(available_cols):
                for j, col2 in enumerate(available_cols[i+1:], i+1):
                    correlation = corr_matrix.loc[col1, col2]
                    
                    if abs(correlation) >= self.config['correlation_threshold']:
                        confidence = abs(correlation)
                        correlation_type = 'positive' if correlation > 0 else 'negative'
                        
                        pattern = {
                            'pattern_type': 'metric_correlation',
                            'description': f"Strong {correlation_type} correlation between {col1} and {col2}",
                            'significance': confidence,
                            'impact': confidence,  # Strong correlations have high impact
                            'urgency': 0.6,  # Correlations are informative but not urgent
                            'severity': 'low',
                            'data_points': {
                                'correlation_coefficient': correlation,
                                'metric_1': col1,
                                'metric_2': col2,
                                'correlation_type': correlation_type
                            },
                            'context': {
                                'correlation_strength': 'very strong' if abs(correlation) > 0.9 else 'strong',
                                'business_implication': self._interpret_correlation(col1, col2, correlation)
                            },
                            'recommendations': self._generate_correlation_recommendations(col1, col2, correlation)
                        }
                        
                        patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing customer correlations: {str(e)}")
            return patterns
    
    async def _detect_cyclical_patterns(self, df: pd.DataFrame, metric: str, pattern_name: str) -> List[Dict[str, Any]]:
        """Detect cyclical patterns in time series data"""
        patterns = []
        
        try:
            if metric not in df.columns or len(df) < 14:
                return patterns
            
            # Add day of week
            df_copy = df.copy()
            df_copy['day_of_week'] = df_copy['date'].dt.dayofweek
            
            # Analyze weekly patterns
            weekly_pattern = df_copy.groupby('day_of_week')[metric].agg(['mean', 'std', 'count'])
            
            # Check if there's significant variation across days
            if len(weekly_pattern) >= 5:  # Need data for most days
                day_means = weekly_pattern['mean'].values
                overall_mean = df_copy[metric].mean()
                
                # Calculate coefficient of variation across days
                day_variation = np.std(day_means) / overall_mean if overall_mean > 0 else 0
                
                if day_variation > 0.2:  # Significant weekly pattern
                    confidence = min(0.9, day_variation / 0.3)
                    
                    # Find best and worst days
                    best_day_idx = np.argmax(day_means)
                    worst_day_idx = np.argmin(day_means)
                    
                    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                    
                    pattern = {
                        'pattern_type': f'{pattern_name}_weekly_cycle',
                        'description': f"Strong weekly pattern in {metric}: best on {day_names[best_day_idx]}, worst on {day_names[worst_day_idx]}",
                        'significance': confidence,
                        'impact': day_variation,
                        'urgency': 0.5,  # Cyclical patterns are strategic, not urgent
                        'severity': 'low',
                        'data_points': {
                            'day_variation_coefficient': day_variation,
                            'best_day': day_names[best_day_idx],
                            'worst_day': day_names[worst_day_idx],
                            'best_day_avg': day_means[best_day_idx],
                            'worst_day_avg': day_means[worst_day_idx],
                            'weekly_pattern': dict(zip(day_names, day_means))
                        },
                        'context': {
                            'pattern_strength': 'strong' if day_variation > 0.3 else 'moderate',
                            'days_analyzed': len(weekly_pattern)
                        },
                        'recommendations': [
                            f"Optimize operations for peak performance on {day_names[best_day_idx]}",
                            f"Investigate and improve performance on {day_names[worst_day_idx]}",
                            "Consider day-specific marketing and staffing strategies",
                            "Analyze customer behavior patterns by day of week"
                        ]
                    }
                    
                    patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error detecting cyclical patterns: {str(e)}")
            return patterns
    
    async def analyze_menu_performance(self, restaurant_id: str) -> List[Dict[str, Any]]:
        """Analyze menu item performance patterns"""
        patterns = []
        
        try:
            # Get menu items with performance data
            query = select(MenuItem).where(
                and_(
                    MenuItem.restaurant_id == restaurant_id,
                    MenuItem.is_available == True
                )
            )
            
            result = await self.db.execute(query)
            menu_items = result.scalars().all()
            
            if len(menu_items) < 3:  # Need minimum items for analysis
                return patterns
            
            # Analyze performance distribution
            performance_scores = [item.popularity_score for item in menu_items if item.popularity_score is not None]
            order_frequencies = [item.order_frequency for item in menu_items if item.order_frequency is not None]
            
            if len(performance_scores) >= 3:
                # Identify top and bottom performers
                performance_analysis = await self._analyze_menu_performance_distribution(menu_items)
                patterns.extend(performance_analysis)
            
            # Analyze pricing patterns
            pricing_analysis = await self._analyze_menu_pricing_patterns(menu_items)
            patterns.extend(pricing_analysis)
            
            # Analyze category performance
            category_analysis = await self._analyze_menu_category_performance(menu_items)
            patterns.extend(category_analysis)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing menu performance: {str(e)}")
            return patterns
    
    async def _analyze_menu_performance_distribution(self, menu_items: List[MenuItem]) -> List[Dict[str, Any]]:
        """Analyze distribution of menu item performance"""
        patterns = []
        
        try:
            # Get items with performance data
            items_with_scores = [item for item in menu_items if item.popularity_score is not None]
            
            if len(items_with_scores) < 3:
                return patterns
            
            scores = [item.popularity_score for item in items_with_scores]
            
            # Calculate performance statistics
            mean_score = np.mean(scores)
            std_score = np.std(scores)
            
            if std_score > 0:
                # Identify outliers (top and bottom performers)
                z_scores = [(score - mean_score) / std_score for score in scores]
                
                top_performers = []
                bottom_performers = []
                
                for i, z_score in enumerate(z_scores):
                    if z_score > 1.5:  # Top performer
                        top_performers.append((items_with_scores[i], z_score))
                    elif z_score < -1.5:  # Bottom performer
                        bottom_performers.append((items_with_scores[i], z_score))
                
                # Generate insights for top performers
                if top_performers:
                    top_item, top_z_score = max(top_performers, key=lambda x: x[1])
                    
                    pattern = {
                        'pattern_type': 'menu_top_performer',
                        'item_name': top_item.name,
                        'description': f"'{top_item.name}' is a standout menu performer",
                        'confidence': min(0.9, abs(top_z_score) / 3.0 + 0.6),
                        'impact': min(1.0, abs(top_z_score) / 2.0),
                        'urgency': 0.4,  # Positive insights are less urgent
                        'severity': 'low',
                        'data_points': {
                            'item_id': top_item.id,
                            'popularity_score': top_item.popularity_score,
                            'z_score': top_z_score,
                            'order_frequency': top_item.order_frequency,
                            'price': top_item.price
                        },
                        'context': {
                            'performance_rank': 'top',
                            'category': top_item.category,
                            'relative_performance': f"{abs(top_z_score):.1f} standard deviations above average"
                        },
                        'recommendations': [
                            "Promote this high-performing item more prominently",
                            "Analyze what makes this item successful",
                            "Consider creating similar items or variations",
                            "Use this item's success to optimize menu placement"
                        ]
                    }
                    
                    patterns.append(pattern)
                
                # Generate insights for bottom performers
                if bottom_performers:
                    bottom_item, bottom_z_score = min(bottom_performers, key=lambda x: x[1])
                    
                    pattern = {
                        'pattern_type': 'menu_underperformer',
                        'item_name': bottom_item.name,
                        'description': f"'{bottom_item.name}' is underperforming compared to other menu items",
                        'confidence': min(0.9, abs(bottom_z_score) / 3.0 + 0.6),
                        'impact': min(1.0, abs(bottom_z_score) / 2.0),
                        'urgency': 0.7,  # Underperformers need attention
                        'severity': 'medium',
                        'data_points': {
                            'item_id': bottom_item.id,
                            'popularity_score': bottom_item.popularity_score,
                            'z_score': bottom_z_score,
                            'order_frequency': bottom_item.order_frequency,
                            'price': bottom_item.price
                        },
                        'context': {
                            'performance_rank': 'bottom',
                            'category': bottom_item.category,
                            'relative_performance': f"{abs(bottom_z_score):.1f} standard deviations below average"
                        },
                        'recommendations': [
                            "Review and potentially redesign this underperforming item",
                            "Consider adjusting price or ingredients",
                            "Evaluate if this item should be removed from menu",
                            "Investigate customer feedback for this item"
                        ]
                    }
                    
                    patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing menu performance distribution: {str(e)}")
            return patterns
    
    async def _analyze_menu_pricing_patterns(self, menu_items: List[MenuItem]) -> List[Dict[str, Any]]:
        """Analyze menu pricing patterns"""
        patterns = []
        
        try:
            prices = [item.price for item in menu_items if item.price is not None]
            
            if len(prices) < 3:
                return patterns
            
            # Calculate pricing statistics
            price_mean = np.mean(prices)
            price_std = np.std(prices)
            price_cv = price_std / price_mean if price_mean > 0 else 0
            
            # High price variation might indicate pricing inconsistency
            if price_cv > 0.5:  # High coefficient of variation
                confidence = min(0.8, price_cv / 0.7)
                
                pattern = {
                    'pattern_type': 'pricing_inconsistency',
                    'description': f"High price variation across menu items (CV: {price_cv:.2f})",
                    'confidence': confidence,
                    'impact': min(1.0, price_cv),
                    'urgency': 0.6,
                    'severity': 'medium',
                    'data_points': {
                        'price_coefficient_variation': price_cv,
                        'price_mean': price_mean,
                        'price_std': price_std,
                        'price_range': [min(prices), max(prices)]
                    },
                    'context': {
                        'total_items': len(menu_items),
                        'pricing_strategy': 'inconsistent' if price_cv > 0.7 else 'varied'
                    },
                    'recommendations': [
                        "Review pricing strategy for consistency",
                        "Consider value-based pricing tiers",
                        "Analyze price-performance relationships",
                        "Ensure pricing aligns with customer expectations"
                    ]
                }
                
                patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing menu pricing patterns: {str(e)}")
            return patterns
    
    async def _analyze_menu_category_performance(self, menu_items: List[MenuItem]) -> List[Dict[str, Any]]:
        """Analyze performance by menu category"""
        patterns = []
        
        try:
            # Group by category
            category_performance = {}
            
            for item in menu_items:
                if item.category not in category_performance:
                    category_performance[item.category] = []
                
                if item.popularity_score is not None:
                    category_performance[item.category].append(item.popularity_score)
            
            # Analyze categories with sufficient data
            category_stats = {}
            for category, scores in category_performance.items():
                if len(scores) >= 2:
                    category_stats[category] = {
                        'mean': np.mean(scores),
                        'count': len(scores),
                        'std': np.std(scores)
                    }
            
            if len(category_stats) >= 2:
                # Find best and worst performing categories
                best_category = max(category_stats.keys(), key=lambda x: category_stats[x]['mean'])
                worst_category = min(category_stats.keys(), key=lambda x: category_stats[x]['mean'])
                
                best_mean = category_stats[best_category]['mean']
                worst_mean = category_stats[worst_category]['mean']
                
                # Check if difference is significant
                if best_mean > 0 and (best_mean - worst_mean) / best_mean > 0.3:
                    confidence = min(0.9, (best_mean - worst_mean) / best_mean)
                    
                    pattern = {
                        'pattern_type': 'category_performance_gap',
                        'description': f"Significant performance gap between menu categories: {best_category} vs {worst_category}",
                        'confidence': confidence,
                        'impact': confidence,
                        'urgency': 0.6,
                        'severity': 'medium',
                        'data_points': {
                            'best_category': best_category,
                            'worst_category': worst_category,
                            'best_category_score': best_mean,
                            'worst_category_score': worst_mean,
                            'performance_gap': best_mean - worst_mean,
                            'category_stats': category_stats
                        },
                        'context': {
                            'categories_analyzed': len(category_stats),
                            'gap_percentage': ((best_mean - worst_mean) / best_mean * 100)
                        },
                        'recommendations': [
                            f"Investigate why {best_category} items perform better",
                            f"Review and improve {worst_category} offerings",
                            "Consider rebalancing menu category focus",
                            "Analyze customer preferences by category"
                        ]
                    }
                    
                    patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing menu category performance: {str(e)}")
            return patterns
    
    async def analyze_seasonal_trends(self, restaurant_id: str) -> List[Dict[str, Any]]:
        """Analyze seasonal trends and patterns"""
        patterns = []
        
        try:
            # Get historical data for seasonal analysis
            cutoff_date = datetime.utcnow() - timedelta(days=90)  # 3 months of data
            
            query = select(RestaurantAnalytics).where(
                and_(
                    RestaurantAnalytics.restaurant_id == restaurant_id,
                    RestaurantAnalytics.date >= cutoff_date
                )
            ).order_by(RestaurantAnalytics.date)
            
            result = await self.db.execute(query)
            analytics = result.scalars().all()
            
            if len(analytics) < 30:  # Need at least a month of data
                return patterns
            
            # Convert to DataFrame
            df = pd.DataFrame([
                {
                    'date': a.date,
                    'revenue': a.estimated_revenue,
                    'customers': a.estimated_customers,
                    'avg_order_value': a.average_order_value
                }
                for a in analytics
            ])
            
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            # Add time features
            df['day_of_week'] = df['date'].dt.dayofweek
            df['day_of_month'] = df['date'].dt.day
            df['month'] = df['date'].dt.month
            
            # Analyze weekly seasonal patterns
            weekly_patterns = await self._analyze_weekly_seasonality(df)
            patterns.extend(weekly_patterns)
            
            # Analyze monthly patterns if enough data
            if len(df) >= 60:  # 2 months
                monthly_patterns = await self._analyze_monthly_seasonality(df)
                patterns.extend(monthly_patterns)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing seasonal trends: {str(e)}")
            return patterns
    
    async def _analyze_weekly_seasonality(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze weekly seasonal patterns"""
        patterns = []
        
        try:
            # Group by day of week and analyze patterns
            for metric in ['revenue', 'customers', 'avg_order_value']:
                if metric not in df.columns:
                    continue
                
                weekly_stats = df.groupby('day_of_week')[metric].agg(['mean', 'std', 'count'])
                
                if len(weekly_stats) >= 5:  # Need most days of week
                    day_means = weekly_stats['mean'].values
                    overall_mean = df[metric].mean()
                    
                    if overall_mean > 0:
                        variation = np.std(day_means) / overall_mean
                        
                        if variation > 0.15:  # Significant weekly variation
                            confidence = min(0.9, variation / 0.3)
                            
                            best_day = np.argmax(day_means)
                            worst_day = np.argmin(day_means)
                            day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                            
                            pattern = {
                                'pattern_type': f'{metric}_weekly_seasonality',
                                'description': f"Strong weekly pattern in {metric}: peaks on {day_names[best_day]}",
                                'confidence': confidence,
                                'impact': variation,
                                'urgency': 0.4,
                                'severity': 'low',
                                'data_points': {
                                    'metric': metric,
                                    'variation_coefficient': variation,
                                    'best_day': day_names[best_day],
                                    'worst_day': day_names[worst_day],
                                    'best_day_avg': day_means[best_day],
                                    'worst_day_avg': day_means[worst_day]
                                },
                                'context': {
                                    'pattern_strength': 'strong' if variation > 0.25 else 'moderate',
                                    'days_analyzed': len(weekly_stats)
                                },
                                'recommendations': [
                                    f"Optimize staffing and inventory for {day_names[best_day]} peak performance",
                                    f"Investigate opportunities to improve {day_names[worst_day]} performance",
                                    "Consider day-specific promotions and marketing",
                                    "Adjust operational hours based on daily patterns"
                                ]
                            }
                            
                            patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing weekly seasonality: {str(e)}")
            return patterns
    
    async def _analyze_monthly_seasonality(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze monthly seasonal patterns"""
        patterns = []
        
        try:
            # Group by month and analyze patterns
            for metric in ['revenue', 'customers', 'avg_order_value']:
                if metric not in df.columns:
                    continue
                
                monthly_stats = df.groupby('month')[metric].agg(['mean', 'std', 'count'])
                
                if len(monthly_stats) >= 2:  # Need at least 2 months
                    month_means = monthly_stats['mean'].values
                    overall_mean = df[metric].mean()
                    
                    if overall_mean > 0 and len(month_means) > 1:
                        variation = np.std(month_means) / overall_mean
                        
                        if variation > 0.1:  # Monthly variation threshold
                            confidence = min(0.8, variation / 0.2)
                            
                            best_month = np.argmax(month_means) + 1  # +1 because months are 1-indexed
                            worst_month = np.argmin(month_means) + 1
                            
                            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                            
                            pattern = {
                                'pattern_type': f'{metric}_monthly_seasonality',
                                'description': f"Monthly seasonal pattern in {metric}: best in {month_names[best_month-1]}",
                                'confidence': confidence,
                                'impact': variation,
                                'urgency': 0.3,
                                'severity': 'low',
                                'data_points': {
                                    'metric': metric,
                                    'variation_coefficient': variation,
                                    'best_month': month_names[best_month-1],
                                    'worst_month': month_names[worst_month-1],
                                    'best_month_avg': month_means[best_month-1],
                                    'worst_month_avg': month_means[worst_month-1]
                                },
                                'context': {
                                    'months_analyzed': len(monthly_stats),
                                    'seasonal_strength': 'strong' if variation > 0.15 else 'moderate'
                                },
                                'recommendations': [
                                    f"Prepare for seasonal peak in {month_names[best_month-1]}",
                                    f"Develop strategies to boost performance in {month_names[worst_month-1]}",
                                    "Plan inventory and staffing based on seasonal patterns",
                                    "Consider seasonal menu adjustments"
                                ]
                            }
                            
                            patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing monthly seasonality: {str(e)}")
            return patterns
    
    async def analyze_location_performance(self, restaurant: Restaurant) -> List[Dict[str, Any]]:
        """Analyze location performance compared to similar restaurants"""
        patterns = []
        
        try:
            # Get similar restaurants in the area (same city, similar cuisine)
            similar_restaurants_query = select(Restaurant).where(
                and_(
                    Restaurant.city == restaurant.city,
                    Restaurant.is_active == True,
                    Restaurant.id != restaurant.id
                )
            ).options(selectinload(Restaurant.analytics))
            
            result = await self.db.execute(similar_restaurants_query)
            similar_restaurants = result.scalars().all()
            
            if len(similar_restaurants) < 2:
                return patterns
            
            # Compare performance metrics
            comparison_patterns = await self._compare_restaurant_performance(restaurant, similar_restaurants)
            patterns.extend(comparison_patterns)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing location performance: {str(e)}")
            return patterns
    
    async def _compare_restaurant_performance(self, restaurant: Restaurant, similar_restaurants: List[Restaurant]) -> List[Dict[str, Any]]:
        """Compare restaurant performance with similar establishments"""
        patterns = []
        
        try:
            # Get recent performance data
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            
            # Get target restaurant's recent performance
            target_query = select(RestaurantAnalytics).where(
                and_(
                    RestaurantAnalytics.restaurant_id == restaurant.id,
                    RestaurantAnalytics.date >= cutoff_date
                )
            )
            
            target_result = await self.db.execute(target_query)
            target_analytics = target_result.scalars().all()
            
            if not target_analytics:
                return patterns
            
            # Calculate target restaurant's average metrics
            target_metrics = {
                'revenue': np.mean([a.estimated_revenue for a in target_analytics if a.estimated_revenue]),
                'customers': np.mean([a.estimated_customers for a in target_analytics if a.estimated_customers]),
                'rating': restaurant.average_rating or 0
            }
            
            # Get comparison data from similar restaurants
            comparison_metrics = {'revenue': [], 'customers': [], 'rating': []}
            
            for similar_restaurant in similar_restaurants:
                similar_query = select(RestaurantAnalytics).where(
                    and_(
                        RestaurantAnalytics.restaurant_id == similar_restaurant.id,
                        RestaurantAnalytics.date >= cutoff_date
                    )
                )
                
                similar_result = await self.db.execute(similar_query)
                similar_analytics = similar_result.scalars().all()
                
                if similar_analytics:
                    avg_revenue = np.mean([a.estimated_revenue for a in similar_analytics if a.estimated_revenue])
                    avg_customers = np.mean([a.estimated_customers for a in similar_analytics if a.estimated_customers])
                    
                    if avg_revenue > 0:
                        comparison_metrics['revenue'].append(avg_revenue)
                    if avg_customers > 0:
                        comparison_metrics['customers'].append(avg_customers)
                    if similar_restaurant.average_rating:
                        comparison_metrics['rating'].append(similar_restaurant.average_rating)
            
            # Analyze performance relative to peers
            for metric, target_value in target_metrics.items():
                if target_value > 0 and comparison_metrics[metric]:
                    peer_avg = np.mean(comparison_metrics[metric])
                    peer_std = np.std(comparison_metrics[metric])
                    
                    if peer_std > 0:
                        z_score = (target_value - peer_avg) / peer_std
                        
                        if abs(z_score) > 1.0:  # Significant difference
                            performance_type = 'outperforming' if z_score > 0 else 'underperforming'
                            confidence = min(0.9, abs(z_score) / 2.0 + 0.5)
                            
                            pattern = {
                                'pattern_type': f'location_{metric}_comparison',
                                'comparison_type': performance_type,
                                'description': f"Restaurant is {performance_type} peers in {metric}",
                                'confidence': confidence,
                                'impact': min(1.0, abs(z_score) / 2.0),
                                'urgency': 0.6 if performance_type == 'underperforming' else 0.3,
                                'severity': 'medium' if performance_type == 'underperforming' else 'low',
                                'data_points': {
                                    'metric': metric,
                                    'restaurant_value': target_value,
                                    'peer_average': peer_avg,
                                    'z_score': z_score,
                                    'percentile': self._calculate_percentile(target_value, comparison_metrics[metric])
                                },
                                'context': {
                                    'peers_analyzed': len(comparison_metrics[metric]),
                                    'performance_gap': target_value - peer_avg,
                                    'relative_performance': f"{abs(z_score):.1f} standard deviations {'above' if z_score > 0 else 'below'} average"
                                },
                                'recommendations': self._generate_location_comparison_recommendations(metric, performance_type, z_score)
                            }
                            
                            patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error comparing restaurant performance: {str(e)}")
            return patterns
    
    async def analyze_operational_efficiency(self, restaurant_id: str) -> List[Dict[str, Any]]:
        """Analyze operational efficiency patterns"""
        patterns = []
        
        try:
            # Get recent operational data
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            
            query = select(RestaurantAnalytics).where(
                and_(
                    RestaurantAnalytics.restaurant_id == restaurant_id,
                    RestaurantAnalytics.date >= cutoff_date
                )
            ).order_by(RestaurantAnalytics.date)
            
            result = await self.db.execute(query)
            analytics = result.scalars().all()
            
            if len(analytics) < 7:
                return patterns
            
            # Analyze efficiency metrics
            efficiency_patterns = await self._analyze_efficiency_metrics(analytics)
            patterns.extend(efficiency_patterns)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing operational efficiency: {str(e)}")
            return patterns
    
    async def _analyze_efficiency_metrics(self, analytics: List[RestaurantAnalytics]) -> List[Dict[str, Any]]:
        """Analyze operational efficiency metrics"""
        patterns = []
        
        try:
            # Calculate efficiency ratios
            efficiency_data = []
            
            for a in analytics:
                if a.estimated_revenue and a.estimated_customers and a.estimated_customers > 0:
                    revenue_per_customer = a.estimated_revenue / a.estimated_customers
                    efficiency_data.append({
                        'date': a.date,
                        'revenue_per_customer': revenue_per_customer,
                        'revenue': a.estimated_revenue,
                        'customers': a.estimated_customers
                    })
            
            if len(efficiency_data) < 7:
                return patterns
            
            # Analyze revenue per customer trends
            rpc_values = [d['revenue_per_customer'] for d in efficiency_data]
            rpc_mean = np.mean(rpc_values)
            rpc_std = np.std(rpc_values)
            
            # Check for efficiency improvements or declines
            if len(rpc_values) >= 14:  # Need enough data for trend analysis
                first_half = rpc_values[:len(rpc_values)//2]
                second_half = rpc_values[len(rpc_values)//2:]
                
                first_avg = np.mean(first_half)
                second_avg = np.mean(second_half)
                
                if first_avg > 0:
                    efficiency_change = (second_avg - first_avg) / first_avg
                    
                    if abs(efficiency_change) > 0.1:  # 10% change threshold
                        trend_type = 'improving' if efficiency_change > 0 else 'declining'
                        confidence = min(0.9, abs(efficiency_change) / 0.2 + 0.6)
                        
                        pattern = {
                            'pattern_type': 'operational_efficiency_trend',
                            'area': 'revenue_per_customer',
                            'description': f"Operational efficiency is {trend_type}: revenue per customer {trend_type}",
                            'confidence': confidence,
                            'impact': min(1.0, abs(efficiency_change)),
                            'urgency': 0.7 if trend_type == 'declining' else 0.4,
                            'severity': 'medium' if trend_type == 'declining' else 'low',
                            'data_points': {
                                'efficiency_change': efficiency_change,
                                'first_period_avg': first_avg,
                                'second_period_avg': second_avg,
                                'current_rpc': rpc_values[-1],
                                'trend_direction': trend_type
                            },
                            'context': {
                                'analysis_period_days': len(efficiency_data),
                                'efficiency_metric': 'revenue_per_customer',
                                'change_percentage': efficiency_change * 100
                            },
                            'recommendations': self._generate_efficiency_recommendations(trend_type, efficiency_change)
                        }
                        
                        patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing efficiency metrics: {str(e)}")
            return patterns
    
    def _calculate_pattern_urgency(self, confidence: float, impact: float, pattern_type: str) -> float:
        """Calculate urgency score for patterns"""
        base_urgency = confidence * 0.4 + impact * 0.4
        
        # Adjust based on pattern type
        if pattern_type in ['declining', 'underperforming', 'volatility']:
            base_urgency += 0.2
        elif pattern_type in ['improving', 'outperforming']:
            base_urgency -= 0.1
        
        return min(1.0, max(0.0, base_urgency))
    
    def _calculate_pattern_severity(self, impact: float, pattern_type: str) -> str:
        """Calculate severity level for patterns"""
        if pattern_type in ['declining', 'underperforming'] and impact > 0.5:
            return 'high'
        elif pattern_type in ['declining', 'underperforming'] and impact > 0.3:
            return 'medium'
        elif impact > 0.7:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_percentile(self, value: float, comparison_values: List[float]) -> float:
        """Calculate percentile rank of value in comparison set"""
        if not comparison_values:
            return 50.0
        
        sorted_values = sorted(comparison_values)
        rank = sum(1 for v in sorted_values if v <= value)
        return (rank / len(sorted_values)) * 100
    
    def _interpret_correlation(self, metric1: str, metric2: str, correlation: float) -> str:
        """Interpret business meaning of correlation"""
        correlation_interpretations = {
            ('customers', 'avg_order_value'): "Customer volume and spending patterns are linked",
            ('website_visits', 'online_orders'): "Online marketing effectiveness indicator",
            ('customers', 'website_visits'): "Digital presence drives foot traffic"
        }
        
        key = tuple(sorted([metric1, metric2]))
        return correlation_interpretations.get(key, f"Strong relationship between {metric1} and {metric2}")
    
    def _generate_customer_trend_recommendations(self, trend_type: str, impact: float) -> List[str]:
        """Generate recommendations for customer trends"""
        if trend_type == 'increasing':
            return [
                "Capitalize on growing customer base with retention programs",
                "Ensure operational capacity can handle increased demand",
                "Analyze what's driving customer growth for replication"
            ]
        else:
            return [
                "Implement customer acquisition campaigns immediately",
                "Investigate reasons for customer decline",
                "Review competitive landscape and market changes",
                "Consider promotional offers to attract customers"
            ]
    
    def _generate_aov_trend_recommendations(self, trend_type: str, impact: float) -> List[str]:
        """Generate recommendations for average order value trends"""
        if trend_type == 'increasing':
            return [
                "Continue strategies that are increasing order values",
                "Consider premium menu additions",
                "Implement upselling training for staff"
            ]
        else:
            return [
                "Review menu pricing strategy",
                "Implement bundling and combo offers",
                "Train staff on upselling techniques",
                "Analyze customer price sensitivity"
            ]
    
    def _generate_conversion_recommendations(self, trend_type: str, avg_conversion: float) -> List[str]:
        """Generate recommendations for conversion trends"""
        base_recommendations = [
            "Optimize website user experience",
            "Improve online ordering process",
            "Enhance digital marketing targeting"
        ]
        
        if trend_type == 'declining':
            base_recommendations.extend([
                "Urgently review website performance and usability",
                "Check for technical issues in ordering system",
                "Analyze competitor online offerings"
            ])
        
        return base_recommendations
    
    def _generate_correlation_recommendations(self, metric1: str, metric2: str, correlation: float) -> List[str]:
        """Generate recommendations based on metric correlations"""
        return [
            f"Leverage the relationship between {metric1} and {metric2} for optimization",
            "Monitor both metrics together for early trend detection",
            "Consider joint strategies that impact both metrics simultaneously"
        ]
    
    def _generate_location_comparison_recommendations(self, metric: str, performance_type: str, z_score: float) -> List[str]:
        """Generate recommendations for location comparisons"""
        if performance_type == 'outperforming':
            return [
                f"Maintain and strengthen factors contributing to superior {metric}",
                "Document best practices for potential replication",
                "Consider expanding successful strategies"
            ]
        else:
            return [
                f"Investigate why {metric} lags behind local competitors",
                "Benchmark against top-performing local establishments",
                "Implement targeted improvement strategies",
                "Consider market positioning adjustments"
            ]
    
    def _generate_efficiency_recommendations(self, trend_type: str, efficiency_change: float) -> List[str]:
        """Generate recommendations for efficiency trends"""
        if trend_type == 'improving':
            return [
                "Continue and expand efficiency improvement initiatives",
                "Document successful operational changes",
                "Monitor efficiency metrics regularly"
            ]
        else:
            return [
                "Immediately review operational processes for inefficiencies",
                "Analyze cost structure and resource allocation",
                "Implement process improvements and staff training",
                "Consider technology solutions for operational optimization"
            ]