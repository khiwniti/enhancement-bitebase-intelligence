"""
BiteBase Intelligence Multi-Location Management Service
Enterprise-grade multi-location restaurant management with comparative analytics
"""

import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, case
from sqlalchemy.orm import selectinload
from fastapi import Depends
import pandas as pd
import numpy as np

from app.models.restaurant import Restaurant
from app.models.pos_integration import POSLocation
from app.models.analytics import AnalyticsEvent
from app.core.database import get_db
from app.core.database import get_db

logger = logging.getLogger(__name__)

class LocationPerformanceAnalyzer:
    """Analyze and compare performance across multiple locations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_location_performance_summary(
        self,
        restaurant_id: uuid.UUID,
        date_range_days: int = 30
    ) -> Dict[str, Any]:
        """Get comprehensive performance summary for all locations"""
        try:
            # Get all locations for the restaurant
            locations = await self._get_restaurant_locations(restaurant_id)
            
            if not locations:
                return {
                    'total_locations': 0,
                    'locations': [],
                    'comparative_metrics': {},
                    'recommendations': []
                }
            
            # Analyze each location
            location_analyses = []
            for location in locations:
                analysis = await self._analyze_single_location(location, date_range_days)
                location_analyses.append(analysis)
            
            # Generate comparative metrics
            comparative_metrics = self._generate_comparative_metrics(location_analyses)
            
            # Generate recommendations
            recommendations = self._generate_location_recommendations(location_analyses, comparative_metrics)
            
            return {
                'total_locations': len(locations),
                'locations': location_analyses,
                'comparative_metrics': comparative_metrics,
                'recommendations': recommendations,
                'analysis_period_days': date_range_days,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting location performance summary: {e}")
            return {
                'total_locations': 0,
                'locations': [],
                'error': str(e)
            }
    
    async def compare_locations(
        self,
        restaurant_id: uuid.UUID,
        location_ids: List[str],
        metrics: List[str] = None,
        date_range_days: int = 30
    ) -> Dict[str, Any]:
        """Compare specific locations across selected metrics"""
        try:
            if metrics is None:
                metrics = ['revenue', 'customers', 'avg_order_value', 'profit_margin']
            
            # Get location data
            comparison_data = []
            for location_id in location_ids:
                location_data = await self._get_location_comparison_data(
                    restaurant_id, location_id, metrics, date_range_days
                )
                comparison_data.append(location_data)
            
            # Generate comparison insights
            insights = self._generate_comparison_insights(comparison_data, metrics)
            
            # Calculate rankings
            rankings = self._calculate_location_rankings(comparison_data, metrics)
            
            return {
                'comparison_data': comparison_data,
                'insights': insights,
                'rankings': rankings,
                'metrics_analyzed': metrics,
                'date_range_days': date_range_days,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error comparing locations: {e}")
            return {'error': str(e)}
    
    async def get_location_benchmarks(
        self,
        restaurant_id: uuid.UUID,
        location_id: str,
        benchmark_type: str = 'internal'  # internal, industry, regional
    ) -> Dict[str, Any]:
        """Get performance benchmarks for a specific location"""
        try:
            location_metrics = await self._get_location_metrics(restaurant_id, location_id)
            
            if benchmark_type == 'internal':
                benchmarks = await self._get_internal_benchmarks(restaurant_id, location_id)
            elif benchmark_type == 'industry':
                benchmarks = await self._get_industry_benchmarks(location_metrics)
            else:  # regional
                benchmarks = await self._get_regional_benchmarks(location_metrics)
            
            # Calculate performance gaps
            performance_gaps = self._calculate_performance_gaps(location_metrics, benchmarks)
            
            # Generate improvement opportunities
            opportunities = self._identify_improvement_opportunities(performance_gaps)
            
            return {
                'location_id': location_id,
                'current_metrics': location_metrics,
                'benchmarks': benchmarks,
                'performance_gaps': performance_gaps,
                'improvement_opportunities': opportunities,
                'benchmark_type': benchmark_type,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting location benchmarks: {e}")
            return {'error': str(e)}
    
    async def _get_restaurant_locations(self, restaurant_id: uuid.UUID) -> List[POSLocation]:
        """Get all locations for a restaurant"""
        try:
            result = await self.db.execute(
                select(POSLocation)
                .where(POSLocation.restaurant_id == str(restaurant_id))
                .options(selectinload(POSLocation.restaurant))
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error getting restaurant locations: {e}")
            return []
    
    async def _analyze_single_location(
        self,
        location: POSLocation,
        date_range_days: int
    ) -> Dict[str, Any]:
        """Analyze performance of a single location"""
        try:
            # Generate mock performance data for demonstration
            np.random.seed(hash(location.id) % 2**32)
            
            # Base metrics with location-specific variations
            base_revenue = np.random.uniform(15000, 45000)
            base_customers = np.random.randint(300, 1200)
            base_orders = np.random.randint(400, 1500)
            
            # Calculate derived metrics
            avg_order_value = base_revenue / base_orders
            customers_per_day = base_customers / date_range_days
            revenue_per_customer = base_revenue / base_customers
            
            # Performance indicators
            growth_rate = np.random.uniform(-5, 15)  # % growth
            profit_margin = np.random.uniform(8, 25)  # % profit margin
            customer_satisfaction = np.random.uniform(3.5, 4.8)  # rating out of 5
            
            # Operational metrics
            staff_efficiency = np.random.uniform(70, 95)  # % efficiency
            inventory_turnover = np.random.uniform(8, 20)  # times per month
            
            return {
                'location_id': location.id,
                'location_name': location.name,
                'address': location.address,
                'city': location.city,
                'coordinates': {
                    'latitude': location.latitude,
                    'longitude': location.longitude
                },
                'performance_metrics': {
                    'revenue': {
                        'total': round(base_revenue, 2),
                        'daily_average': round(base_revenue / date_range_days, 2),
                        'growth_rate': round(growth_rate, 2)
                    },
                    'customers': {
                        'total': base_customers,
                        'daily_average': round(customers_per_day, 1),
                        'retention_rate': round(np.random.uniform(60, 85), 1)
                    },
                    'orders': {
                        'total': base_orders,
                        'daily_average': round(base_orders / date_range_days, 1),
                        'avg_order_value': round(avg_order_value, 2)
                    },
                    'profitability': {
                        'profit_margin': round(profit_margin, 2),
                        'revenue_per_customer': round(revenue_per_customer, 2),
                        'cost_efficiency': round(np.random.uniform(75, 92), 1)
                    },
                    'operational': {
                        'staff_efficiency': round(staff_efficiency, 1),
                        'inventory_turnover': round(inventory_turnover, 1),
                        'customer_satisfaction': round(customer_satisfaction, 2)
                    }
                },
                'performance_score': round(
                    (growth_rate + profit_margin + customer_satisfaction * 20 + staff_efficiency) / 4, 1
                ),
                'status': self._determine_location_status(growth_rate, profit_margin, customer_satisfaction)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing location {location.id}: {e}")
            return {
                'location_id': location.id,
                'location_name': location.name,
                'error': str(e)
            }
    
    def _generate_comparative_metrics(self, location_analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate comparative metrics across all locations"""
        try:
            if not location_analyses:
                return {}
            
            # Extract metrics for comparison
            revenues = [loc['performance_metrics']['revenue']['total'] for loc in location_analyses if 'performance_metrics' in loc]
            customers = [loc['performance_metrics']['customers']['total'] for loc in location_analyses if 'performance_metrics' in loc]
            profit_margins = [loc['performance_metrics']['profitability']['profit_margin'] for loc in location_analyses if 'performance_metrics' in loc]
            performance_scores = [loc['performance_score'] for loc in location_analyses if 'performance_score' in loc]
            
            if not revenues:
                return {}
            
            return {
                'revenue': {
                    'total': sum(revenues),
                    'average': np.mean(revenues),
                    'highest': max(revenues),
                    'lowest': min(revenues),
                    'std_deviation': np.std(revenues),
                    'coefficient_of_variation': np.std(revenues) / np.mean(revenues) if np.mean(revenues) > 0 else 0
                },
                'customers': {
                    'total': sum(customers),
                    'average': np.mean(customers),
                    'highest': max(customers),
                    'lowest': min(customers)
                },
                'profitability': {
                    'average_margin': np.mean(profit_margins),
                    'best_margin': max(profit_margins),
                    'worst_margin': min(profit_margins),
                    'margin_consistency': 1 - (np.std(profit_margins) / np.mean(profit_margins)) if np.mean(profit_margins) > 0 else 0
                },
                'performance': {
                    'average_score': np.mean(performance_scores),
                    'top_performer': max(performance_scores),
                    'lowest_performer': min(performance_scores),
                    'performance_gap': max(performance_scores) - min(performance_scores)
                },
                'location_distribution': {
                    'high_performers': len([s for s in performance_scores if s >= 80]),
                    'average_performers': len([s for s in performance_scores if 60 <= s < 80]),
                    'underperformers': len([s for s in performance_scores if s < 60])
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating comparative metrics: {e}")
            return {}
    
    def _generate_location_recommendations(
        self,
        location_analyses: List[Dict[str, Any]],
        comparative_metrics: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate recommendations for location management"""
        recommendations = []
        
        try:
            if not location_analyses or not comparative_metrics:
                return recommendations
            
            # Identify top and bottom performers
            performance_scores = [(loc['location_id'], loc['location_name'], loc['performance_score']) 
                                for loc in location_analyses if 'performance_score' in loc]
            performance_scores.sort(key=lambda x: x[2], reverse=True)
            
            if len(performance_scores) >= 2:
                top_performer = performance_scores[0]
                bottom_performer = performance_scores[-1]
                
                # Best practices sharing
                recommendations.append({
                    'type': 'best_practices',
                    'priority': 'high',
                    'title': 'Share Best Practices',
                    'description': f"Analyze and replicate successful strategies from {top_performer[1]} (score: {top_performer[2]}) to other locations",
                    'affected_locations': [loc[0] for loc in performance_scores[1:]],
                    'expected_impact': 'Improve overall performance consistency'
                })
                
                # Underperformer support
                if bottom_performer[2] < 60:
                    recommendations.append({
                        'type': 'performance_improvement',
                        'priority': 'urgent',
                        'title': 'Address Underperforming Location',
                        'description': f"{bottom_performer[1]} requires immediate attention (score: {bottom_performer[2]})",
                        'affected_locations': [bottom_performer[0]],
                        'expected_impact': 'Prevent further performance decline'
                    })
            
            # Revenue optimization
            if 'revenue' in comparative_metrics:
                cv = comparative_metrics['revenue']['coefficient_of_variation']
                if cv > 0.3:  # High variation
                    recommendations.append({
                        'type': 'revenue_optimization',
                        'priority': 'medium',
                        'title': 'Standardize Revenue Performance',
                        'description': 'High revenue variation detected across locations. Consider standardizing operations and pricing.',
                        'affected_locations': 'all',
                        'expected_impact': 'Reduce revenue volatility and improve predictability'
                    })
            
            # Operational efficiency
            low_efficiency_locations = [
                loc for loc in location_analyses 
                if 'performance_metrics' in loc and 
                loc['performance_metrics']['operational']['staff_efficiency'] < 80
            ]
            
            if low_efficiency_locations:
                recommendations.append({
                    'type': 'operational_efficiency',
                    'priority': 'medium',
                    'title': 'Improve Staff Efficiency',
                    'description': f"{len(low_efficiency_locations)} locations have staff efficiency below 80%",
                    'affected_locations': [loc['location_id'] for loc in low_efficiency_locations],
                    'expected_impact': 'Reduce operational costs and improve service quality'
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return recommendations
    
    def _determine_location_status(
        self,
        growth_rate: float,
        profit_margin: float,
        customer_satisfaction: float
    ) -> str:
        """Determine the status of a location based on key metrics"""
        if growth_rate > 10 and profit_margin > 20 and customer_satisfaction > 4.5:
            return 'excellent'
        elif growth_rate > 5 and profit_margin > 15 and customer_satisfaction > 4.0:
            return 'good'
        elif growth_rate > 0 and profit_margin > 10 and customer_satisfaction > 3.5:
            return 'average'
        elif growth_rate < -2 or profit_margin < 8 or customer_satisfaction < 3.0:
            return 'poor'
        else:
            return 'needs_attention'
    
    async def _get_location_comparison_data(
        self,
        restaurant_id: uuid.UUID,
        location_id: str,
        metrics: List[str],
        date_range_days: int
    ) -> Dict[str, Any]:
        """Get comparison data for a specific location"""
        # Mock implementation - in production, this would query actual data
        np.random.seed(hash(location_id) % 2**32)
        
        data = {
            'location_id': location_id,
            'location_name': f"Location {location_id[-4:]}",
            'metrics': {}
        }
        
        for metric in metrics:
            if metric == 'revenue':
                data['metrics'][metric] = round(np.random.uniform(15000, 45000), 2)
            elif metric == 'customers':
                data['metrics'][metric] = np.random.randint(300, 1200)
            elif metric == 'avg_order_value':
                data['metrics'][metric] = round(np.random.uniform(25, 65), 2)
            elif metric == 'profit_margin':
                data['metrics'][metric] = round(np.random.uniform(8, 25), 2)
        
        return data
    
    def _generate_comparison_insights(
        self,
        comparison_data: List[Dict[str, Any]],
        metrics: List[str]
    ) -> List[Dict[str, Any]]:
        """Generate insights from location comparison"""
        insights = []
        
        try:
            for metric in metrics:
                values = [loc['metrics'][metric] for loc in comparison_data if metric in loc['metrics']]
                if not values:
                    continue
                
                best_idx = values.index(max(values))
                worst_idx = values.index(min(values))
                
                insights.append({
                    'metric': metric,
                    'best_location': comparison_data[best_idx]['location_name'],
                    'best_value': values[best_idx],
                    'worst_location': comparison_data[worst_idx]['location_name'],
                    'worst_value': values[worst_idx],
                    'improvement_potential': round(((max(values) - min(values)) / min(values)) * 100, 1)
                })
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating comparison insights: {e}")
            return insights
    
    def _calculate_location_rankings(
        self,
        comparison_data: List[Dict[str, Any]],
        metrics: List[str]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Calculate rankings for each metric"""
        rankings = {}
        
        try:
            for metric in metrics:
                metric_data = [
                    {
                        'location_id': loc['location_id'],
                        'location_name': loc['location_name'],
                        'value': loc['metrics'][metric]
                    }
                    for loc in comparison_data if metric in loc['metrics']
                ]
                
                # Sort by value (descending for most metrics)
                metric_data.sort(key=lambda x: x['value'], reverse=True)
                
                # Add ranking
                for i, item in enumerate(metric_data):
                    item['rank'] = i + 1
                
                rankings[metric] = metric_data
            
            return rankings
            
        except Exception as e:
            logger.error(f"Error calculating rankings: {e}")
            return rankings

class MultiLocationManager:
    """Main multi-location management orchestrator"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.performance_analyzer = LocationPerformanceAnalyzer(db)
    
    async def get_multi_location_dashboard(
        self,
        restaurant_id: uuid.UUID,
        date_range_days: int = 30
    ) -> Dict[str, Any]:
        """Get comprehensive multi-location dashboard data"""
        try:
            # Get performance summary
            performance_summary = await self.performance_analyzer.get_location_performance_summary(
                restaurant_id, date_range_days
            )
            
            # Get location health status
            health_status = await self._get_locations_health_status(restaurant_id)
            
            # Get operational alerts
            alerts = await self._get_operational_alerts(restaurant_id)
            
            return {
                'restaurant_id': str(restaurant_id),
                'performance_summary': performance_summary,
                'health_status': health_status,
                'operational_alerts': alerts,
                'dashboard_generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting multi-location dashboard: {e}")
            return {
                'restaurant_id': str(restaurant_id),
                'error': str(e)
            }
    
    async def _get_locations_health_status(self, restaurant_id: uuid.UUID) -> Dict[str, Any]:
        """Get health status for all locations"""
        # Mock implementation
        return {
            'overall_health': 'good',
            'locations_online': 4,
            'locations_offline': 0,
            'locations_warning': 1,
            'last_sync': datetime.utcnow().isoformat()
        }
    
    async def _get_operational_alerts(self, restaurant_id: uuid.UUID) -> List[Dict[str, Any]]:
        """Get operational alerts across all locations"""
        # Mock implementation
        return [
            {
                'id': str(uuid.uuid4()),
                'type': 'performance',
                'severity': 'medium',
                'location_id': 'loc_001',
                'location_name': 'Downtown Location',
                'message': 'Revenue down 15% compared to last month',
                'created_at': datetime.utcnow().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'operational',
                'severity': 'low',
                'location_id': 'loc_003',
                'location_name': 'Mall Location',
                'message': 'Staff efficiency below target (78%)',
                'created_at': datetime.utcnow().isoformat()
            }
        ]

# Global multi-location manager instance
async def get_multi_location_manager(db: AsyncSession = Depends(get_db)) -> MultiLocationManager:
    """Get multi-location manager instance"""
    return MultiLocationManager(db)
