"""
BiteBase Intelligence Insights Engine
Main orchestrator for automated insights generation
"""

import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload

from app.models.insights import Insight, InsightPattern, InsightMetrics, InsightType, InsightSeverity
from app.models.restaurant import Restaurant, RestaurantAnalytics
from app.schemas.insights import InsightCreate, InsightResponse
from .anomaly_detector import AnomalyDetector
from .pattern_analyzer import PatternAnalyzer
from .notification_service import NotificationService

logger = logging.getLogger(__name__)


class InsightsEngine:
    """
    Main insights engine for automated pattern recognition and anomaly detection
    Target: Generate 15+ actionable insights per dashboard per week
    """
    
    def __init__(self, db: AsyncSession, anthropic_client=None):
        self.db = db
        self.anthropic_client = anthropic_client
        
        # Initialize sub-components
        self.anomaly_detector = AnomalyDetector(db)
        self.pattern_analyzer = PatternAnalyzer(db)
        self.notification_service = NotificationService(db)
        
        # Performance tracking
        self.processing_stats = {
            'insights_generated': 0,
            'processing_time_total': 0.0,
            'avg_processing_time': 0.0,
            'anomalies_detected': 0,
            'patterns_matched': 0
        }
        
        # Configuration
        self.config = {
            'min_confidence_threshold': 0.7,
            'max_insights_per_run': 100,
            'insight_retention_days': 90,
            'batch_size': 50,
            'parallel_processing': True
        }
    
    async def generate_insights(
        self, 
        restaurant_ids: Optional[List[str]] = None,
        insight_types: Optional[List[InsightType]] = None,
        force_regenerate: bool = False
    ) -> List[InsightResponse]:
        """
        Main entry point for generating insights
        Target: <100ms processing time for real-time updates
        """
        start_time = datetime.utcnow()
        generated_insights = []
        
        try:
            logger.info(f"Starting insights generation for {len(restaurant_ids) if restaurant_ids else 'all'} restaurants")
            
            # Get restaurants to analyze
            restaurants = await self._get_restaurants_for_analysis(restaurant_ids)
            
            if not restaurants:
                logger.warning("No restaurants found for analysis")
                return []
            
            # Parallel processing for performance
            if self.config['parallel_processing'] and len(restaurants) > 1:
                tasks = []
                for restaurant_batch in self._batch_restaurants(restaurants):
                    task = asyncio.create_task(
                        self._process_restaurant_batch(restaurant_batch, insight_types, force_regenerate)
                    )
                    tasks.append(task)
                
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Collect results from all batches
                for result in batch_results:
                    if isinstance(result, Exception):
                        logger.error(f"Batch processing error: {str(result)}")
                    else:
                        generated_insights.extend(result)
            else:
                # Sequential processing for small datasets
                for restaurant in restaurants:
                    insights = await self._generate_restaurant_insights(restaurant, insight_types, force_regenerate)
                    generated_insights.extend(insights)
            
            # Update processing statistics
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            await self._update_processing_stats(len(generated_insights), processing_time)
            
            logger.info(f"Generated {len(generated_insights)} insights in {processing_time:.2f}ms")
            
            return generated_insights
            
        except Exception as e:
            logger.error(f"Error in insights generation: {str(e)}")
            raise
    
    async def _get_restaurants_for_analysis(self, restaurant_ids: Optional[List[str]]) -> List[Restaurant]:
        """Get restaurants that need analysis"""
        try:
            query = select(Restaurant).where(Restaurant.is_active == True)
            
            if restaurant_ids:
                query = query.where(Restaurant.id.in_(restaurant_ids))
            
            # Include analytics data for analysis
            query = query.options(selectinload(Restaurant.analytics))
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            logger.error(f"Error fetching restaurants: {str(e)}")
            return []
    
    def _batch_restaurants(self, restaurants: List[Restaurant]) -> List[List[Restaurant]]:
        """Split restaurants into batches for parallel processing"""
        batch_size = self.config['batch_size']
        return [restaurants[i:i + batch_size] for i in range(0, len(restaurants), batch_size)]
    
    async def _process_restaurant_batch(
        self, 
        restaurants: List[Restaurant], 
        insight_types: Optional[List[InsightType]], 
        force_regenerate: bool
    ) -> List[InsightResponse]:
        """Process a batch of restaurants"""
        batch_insights = []
        
        for restaurant in restaurants:
            try:
                insights = await self._generate_restaurant_insights(restaurant, insight_types, force_regenerate)
                batch_insights.extend(insights)
            except Exception as e:
                logger.error(f"Error processing restaurant {restaurant.id}: {str(e)}")
                continue
        
        return batch_insights
    
    async def _generate_restaurant_insights(
        self, 
        restaurant: Restaurant, 
        insight_types: Optional[List[InsightType]], 
        force_regenerate: bool
    ) -> List[InsightResponse]:
        """Generate insights for a specific restaurant"""
        insights = []
        
        try:
            # Skip if no recent data
            if not await self._has_recent_data(restaurant):
                return insights
            
            # Check for existing recent insights (unless force regenerate)
            if not force_regenerate:
                recent_insights = await self._get_recent_insights(restaurant.id)
                if len(recent_insights) >= 5:  # Limit to avoid spam
                    return insights
            
            # Generate different types of insights
            insight_generators = {
                InsightType.REVENUE_ANOMALY: self._generate_revenue_anomaly_insights,
                InsightType.CUSTOMER_PATTERN_CHANGE: self._generate_customer_pattern_insights,
                InsightType.MENU_PERFORMANCE: self._generate_menu_performance_insights,
                InsightType.SEASONAL_TREND: self._generate_seasonal_trend_insights,
                InsightType.LOCATION_COMPARISON: self._generate_location_comparison_insights,
                InsightType.OPERATIONAL_INSIGHT: self._generate_operational_insights
            }
            
            # Filter by requested insight types
            if insight_types:
                insight_generators = {k: v for k, v in insight_generators.items() if k in insight_types}
            
            # Generate insights of each type
            for insight_type, generator in insight_generators.items():
                try:
                    type_insights = await generator(restaurant)
                    insights.extend(type_insights)
                except Exception as e:
                    logger.error(f"Error generating {insight_type} insights for restaurant {restaurant.id}: {str(e)}")
                    continue
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating insights for restaurant {restaurant.id}: {str(e)}")
            return insights
    
    async def _has_recent_data(self, restaurant: Restaurant) -> bool:
        """Check if restaurant has recent data for analysis"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=7)
            
            query = select(func.count(RestaurantAnalytics.id)).where(
                and_(
                    RestaurantAnalytics.restaurant_id == restaurant.id,
                    RestaurantAnalytics.date >= cutoff_date
                )
            )
            
            result = await self.db.execute(query)
            count = result.scalar()
            
            return count > 0
            
        except Exception as e:
            logger.error(f"Error checking recent data for restaurant {restaurant.id}: {str(e)}")
            return False
    
    async def _get_recent_insights(self, restaurant_id: str) -> List[Insight]:
        """Get recent insights for a restaurant"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(hours=24)
            
            query = select(Insight).where(
                and_(
                    Insight.restaurant_id == restaurant_id,
                    Insight.detected_at >= cutoff_date
                )
            )
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            logger.error(f"Error fetching recent insights: {str(e)}")
            return []
    
    async def _generate_revenue_anomaly_insights(self, restaurant: Restaurant) -> List[InsightResponse]:
        """Generate revenue anomaly insights using statistical analysis"""
        insights = []
        
        try:
            # Get recent revenue data
            revenue_data = await self._get_revenue_time_series(restaurant.id)
            
            if len(revenue_data) < 7:  # Need at least a week of data
                return insights
            
            # Detect anomalies using multiple algorithms
            anomalies = await self.anomaly_detector.detect_revenue_anomalies(revenue_data)
            
            for anomaly in anomalies:
                if anomaly['confidence'] >= self.config['min_confidence_threshold']:
                    # Generate natural language explanation
                    explanation = await self._generate_explanation(
                        f"Revenue anomaly detected: {anomaly['description']}", 
                        anomaly['context']
                    )
                    
                    # Create insight
                    insight_data = InsightCreate(
                        title=f"Revenue Anomaly Detected - {anomaly['severity'].title()}",
                        description=anomaly['description'],
                        insight_type=InsightType.REVENUE_ANOMALY,
                        severity=self._map_severity(anomaly['severity']),
                        restaurant_id=uuid.UUID(restaurant.id),
                        confidence_score=anomaly['confidence'],
                        impact_score=anomaly['impact'],
                        urgency_score=anomaly['urgency'],
                        data_points=anomaly['data_points'],
                        context=anomaly['context'],
                        explanation=explanation,
                        recommendations=anomaly.get('recommendations', []),
                        data_period_start=anomaly.get('period_start'),
                        data_period_end=anomaly.get('period_end'),
                        metadata=anomaly.get('metadata', {})
                    )
                    
                    # Save insight to database
                    insight = await self._save_insight(insight_data)
                    if insight:
                        insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating revenue anomaly insights: {str(e)}")
            return insights
    
    async def _generate_customer_pattern_insights(self, restaurant: Restaurant) -> List[InsightResponse]:
        """Generate customer pattern change insights"""
        insights = []
        
        try:
            # Get customer metrics data
            customer_data = await self._get_customer_metrics(restaurant.id)
            
            if not customer_data:
                return insights
            
            # Analyze patterns using pattern analyzer
            patterns = await self.pattern_analyzer.analyze_customer_patterns(customer_data)
            
            for pattern in patterns:
                if pattern['significance'] >= self.config['min_confidence_threshold']:
                    explanation = await self._generate_explanation(
                        f"Customer pattern change: {pattern['description']}", 
                        pattern['context']
                    )
                    
                    insight_data = InsightCreate(
                        title=f"Customer Pattern Change - {pattern['pattern_type'].title()}",
                        description=pattern['description'],
                        insight_type=InsightType.CUSTOMER_PATTERN_CHANGE,
                        severity=self._map_severity(pattern['severity']),
                        restaurant_id=uuid.UUID(restaurant.id),
                        confidence_score=pattern['significance'],
                        impact_score=pattern['impact'],
                        urgency_score=pattern['urgency'],
                        data_points=pattern['data_points'],
                        context=pattern['context'],
                        explanation=explanation,
                        recommendations=pattern.get('recommendations', []),
                        data_period_start=pattern.get('period_start'),
                        data_period_end=pattern.get('period_end')
                    )
                    
                    insight = await self._save_insight(insight_data)
                    if insight:
                        insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating customer pattern insights: {str(e)}")
            return insights
    
    async def _generate_menu_performance_insights(self, restaurant: Restaurant) -> List[InsightResponse]:
        """Generate menu performance insights"""
        insights = []
        
        try:
            # Analyze menu item performance
            menu_analysis = await self.pattern_analyzer.analyze_menu_performance(restaurant.id)
            
            for analysis in menu_analysis:
                if analysis['confidence'] >= self.config['min_confidence_threshold']:
                    explanation = await self._generate_explanation(
                        f"Menu performance insight: {analysis['description']}", 
                        analysis['context']
                    )
                    
                    insight_data = InsightCreate(
                        title=f"Menu Performance - {analysis['item_name']}",
                        description=analysis['description'],
                        insight_type=InsightType.MENU_PERFORMANCE,
                        severity=self._map_severity(analysis['severity']),
                        restaurant_id=uuid.UUID(restaurant.id),
                        confidence_score=analysis['confidence'],
                        impact_score=analysis['impact'],
                        urgency_score=analysis['urgency'],
                        data_points=analysis['data_points'],
                        context=analysis['context'],
                        explanation=explanation,
                        recommendations=analysis.get('recommendations', [])
                    )
                    
                    insight = await self._save_insight(insight_data)
                    if insight:
                        insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating menu performance insights: {str(e)}")
            return insights
    
    async def _generate_seasonal_trend_insights(self, restaurant: Restaurant) -> List[InsightResponse]:
        """Generate seasonal trend insights"""
        insights = []
        
        try:
            # Analyze seasonal patterns
            seasonal_analysis = await self.pattern_analyzer.analyze_seasonal_trends(restaurant.id)
            
            for trend in seasonal_analysis:
                if trend['confidence'] >= self.config['min_confidence_threshold']:
                    explanation = await self._generate_explanation(
                        f"Seasonal trend: {trend['description']}", 
                        trend['context']
                    )
                    
                    insight_data = InsightCreate(
                        title=f"Seasonal Trend - {trend['trend_type'].title()}",
                        description=trend['description'],
                        insight_type=InsightType.SEASONAL_TREND,
                        severity=self._map_severity(trend['severity']),
                        restaurant_id=uuid.UUID(restaurant.id),
                        confidence_score=trend['confidence'],
                        impact_score=trend['impact'],
                        urgency_score=trend['urgency'],
                        data_points=trend['data_points'],
                        context=trend['context'],
                        explanation=explanation,
                        recommendations=trend.get('recommendations', [])
                    )
                    
                    insight = await self._save_insight(insight_data)
                    if insight:
                        insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating seasonal trend insights: {str(e)}")
            return insights
    
    async def _generate_location_comparison_insights(self, restaurant: Restaurant) -> List[InsightResponse]:
        """Generate location comparison insights"""
        insights = []
        
        try:
            # Compare with similar restaurants in the area
            comparison_analysis = await self.pattern_analyzer.analyze_location_performance(restaurant)
            
            for comparison in comparison_analysis:
                if comparison['confidence'] >= self.config['min_confidence_threshold']:
                    explanation = await self._generate_explanation(
                        f"Location comparison: {comparison['description']}", 
                        comparison['context']
                    )
                    
                    insight_data = InsightCreate(
                        title=f"Location Performance - {comparison['comparison_type'].title()}",
                        description=comparison['description'],
                        insight_type=InsightType.LOCATION_COMPARISON,
                        severity=self._map_severity(comparison['severity']),
                        restaurant_id=uuid.UUID(restaurant.id),
                        confidence_score=comparison['confidence'],
                        impact_score=comparison['impact'],
                        urgency_score=comparison['urgency'],
                        data_points=comparison['data_points'],
                        context=comparison['context'],
                        explanation=explanation,
                        recommendations=comparison.get('recommendations', [])
                    )
                    
                    insight = await self._save_insight(insight_data)
                    if insight:
                        insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating location comparison insights: {str(e)}")
            return insights
    
    async def _generate_operational_insights(self, restaurant: Restaurant) -> List[InsightResponse]:
        """Generate operational efficiency insights"""
        insights = []
        
        try:
            # Analyze operational metrics
            operational_analysis = await self.pattern_analyzer.analyze_operational_efficiency(restaurant.id)
            
            for analysis in operational_analysis:
                if analysis['confidence'] >= self.config['min_confidence_threshold']:
                    explanation = await self._generate_explanation(
                        f"Operational insight: {analysis['description']}", 
                        analysis['context']
                    )
                    
                    insight_data = InsightCreate(
                        title=f"Operational Efficiency - {analysis['area']}",
                        description=analysis['description'],
                        insight_type=InsightType.OPERATIONAL_INSIGHT,
                        severity=self._map_severity(analysis['severity']),
                        restaurant_id=uuid.UUID(restaurant.id),
                        confidence_score=analysis['confidence'],
                        impact_score=analysis['impact'],
                        urgency_score=analysis['urgency'],
                        data_points=analysis['data_points'],
                        context=analysis['context'],
                        explanation=explanation,
                        recommendations=analysis.get('recommendations', [])
                    )
                    
                    insight = await self._save_insight(insight_data)
                    if insight:
                        insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating operational insights: {str(e)}")
            return insights
    
    async def _get_revenue_time_series(self, restaurant_id: str) -> List[Dict[str, Any]]:
        """Get revenue time series data for analysis"""
        try:
            # Get last 30 days of revenue data
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            
            query = select(RestaurantAnalytics).where(
                and_(
                    RestaurantAnalytics.restaurant_id == restaurant_id,
                    RestaurantAnalytics.date >= cutoff_date,
                    RestaurantAnalytics.estimated_revenue.isnot(None)
                )
            ).order_by(RestaurantAnalytics.date)
            
            result = await self.db.execute(query)
            analytics = result.scalars().all()
            
            return [
                {
                    'date': a.date,
                    'revenue': a.estimated_revenue,
                    'customers': a.estimated_customers,
                    'avg_order_value': a.average_order_value
                }
                for a in analytics
            ]
            
        except Exception as e:
            logger.error(f"Error fetching revenue time series: {str(e)}")
            return []
    
    async def _get_customer_metrics(self, restaurant_id: str) -> Dict[str, Any]:
        """Get customer metrics for pattern analysis"""
        try:
            # Get recent customer data
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            
            query = select(RestaurantAnalytics).where(
                and_(
                    RestaurantAnalytics.restaurant_id == restaurant_id,
                    RestaurantAnalytics.date >= cutoff_date
                )
            ).order_by(RestaurantAnalytics.date)
            
            result = await self.db.execute(query)
            analytics = result.scalars().all()
            
            return {
                'time_series': [
                    {
                        'date': a.date,
                        'customers': a.estimated_customers,
                        'avg_order_value': a.average_order_value,
                        'website_visits': a.website_visits,
                        'online_orders': a.online_orders
                    }
                    for a in analytics
                ],
                'restaurant_id': restaurant_id
            }
            
        except Exception as e:
            logger.error(f"Error fetching customer metrics: {str(e)}")
            return {}
    
    async def _generate_explanation(self, insight_summary: str, context: Dict[str, Any]) -> str:
        """Generate natural language explanation using AI"""
        try:
            if not self.anthropic_client:
                return f"Analysis shows: {insight_summary}"
            
            # Use Anthropic to generate detailed explanation
            prompt = f"""
            Generate a clear, actionable explanation for this restaurant business insight:
            
            Summary: {insight_summary}
            Context: {context}
            
            Provide a concise explanation that:
            1. Explains what happened
            2. Why it's important
            3. What actions should be considered
            
            Keep it under 200 words and business-focused.
            """
            
            # This would use the actual Anthropic client
            # For now, return a structured explanation
            return f"Analysis indicates: {insight_summary}. This insight is based on recent data patterns and statistical analysis. Consider reviewing the underlying factors and implementing recommended actions to optimize performance."
            
        except Exception as e:
            logger.error(f"Error generating explanation: {str(e)}")
            return f"Analysis shows: {insight_summary}"
    
    def _map_severity(self, severity_str: str) -> InsightSeverity:
        """Map string severity to enum"""
        severity_map = {
            'low': InsightSeverity.LOW,
            'medium': InsightSeverity.MEDIUM,
            'high': InsightSeverity.HIGH,
            'critical': InsightSeverity.CRITICAL
        }
        return severity_map.get(severity_str.lower(), InsightSeverity.MEDIUM)
    
    async def _save_insight(self, insight_data: InsightCreate) -> Optional[InsightResponse]:
        """Save insight to database"""
        try:
            # Create insight model
            insight = Insight(
                id=str(uuid.uuid4()),
                title=insight_data.title,
                description=insight_data.description,
                insight_type=insight_data.insight_type,
                severity=insight_data.severity,
                restaurant_id=str(insight_data.restaurant_id) if insight_data.restaurant_id else None,
                confidence_score=insight_data.confidence_score,
                impact_score=insight_data.impact_score,
                urgency_score=insight_data.urgency_score,
                data_points=insight_data.data_points,
                context=insight_data.context,
                explanation=insight_data.explanation,
                recommendations=insight_data.recommendations,
                data_period_start=insight_data.data_period_start,
                data_period_end=insight_data.data_period_end,
                metadata=insight_data.metadata
            )
            
            self.db.add(insight)
            await self.db.commit()
            await self.db.refresh(insight)
            
            # Convert to response schema
            insight_response = InsightResponse.from_orm(insight)
            
            # Send notifications if high severity
            if insight.severity in [InsightSeverity.HIGH, InsightSeverity.CRITICAL]:
                await self.notification_service.send_insight_notification(insight)
            
            return insight_response
            
        except Exception as e:
            logger.error(f"Error saving insight: {str(e)}")
            await self.db.rollback()
            return None
    
    async def _update_processing_stats(self, insights_count: int, processing_time: float):
        """Update processing statistics"""
        try:
            self.processing_stats['insights_generated'] += insights_count
            self.processing_stats['processing_time_total'] += processing_time
            
            total_runs = self.processing_stats['insights_generated']
            if total_runs > 0:
                self.processing_stats['avg_processing_time'] = (
                    self.processing_stats['processing_time_total'] / total_runs
                )
            
            # Save metrics to database
            metrics = InsightMetrics(
                date=datetime.utcnow(),
                period_type='run',
                insights_generated=insights_count,
                avg_processing_time_ms=processing_time,
                data_points_processed=insights_count * 10  # Estimate
            )
            
            self.db.add(metrics)
            await self.db.commit()
            
        except Exception as e:
            logger.error(f"Error updating processing stats: {str(e)}")
    
    async def get_processing_stats(self) -> Dict[str, Any]:
        """Get current processing statistics"""
        return {
            **self.processing_stats,
            'config': self.config
        }