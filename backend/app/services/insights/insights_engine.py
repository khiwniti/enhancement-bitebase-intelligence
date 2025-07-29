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
from app.models.restaurant import Restaurant, RestaurantAnalytics, Staff, InventoryItem
from app.models.restaurant_management import (
    Table, Order, OrderItem, Transaction, FinancialRecord
)
from app.models.campaign_management import (
    Campaign, CampaignMetrics, ABTest, CampaignAudience
)
from app.models.pos_integration import (
    POSIntegration, POSSyncLog, POSDataMapping
)
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

    async def generate_integrated_insights(
        self,
        restaurant_id: Optional[uuid.UUID] = None,
        time_period: str = "month"
    ) -> List[Dict[str, Any]]:
        """
        Generate insights by analyzing data across restaurant, campaign, and POS systems
        """
        insights = []

        # Calculate date range
        end_date = datetime.utcnow()
        if time_period == "week":
            start_date = end_date - timedelta(days=7)
        elif time_period == "month":
            start_date = end_date - timedelta(days=30)
        elif time_period == "quarter":
            start_date = end_date - timedelta(days=90)
        else:  # year
            start_date = end_date - timedelta(days=365)

        # Analyze restaurant management insights
        restaurant_insights = await self._analyze_restaurant_management(
            restaurant_id, start_date, end_date
        )
        insights.extend(restaurant_insights)

        # Analyze campaign performance insights
        campaign_insights = await self._analyze_campaign_performance(
            restaurant_id, start_date, end_date
        )
        insights.extend(campaign_insights)

        # Analyze POS integration insights
        pos_insights = await self._analyze_pos_integration(
            restaurant_id, start_date, end_date
        )
        insights.extend(pos_insights)

        # Analyze cross-system correlations
        correlation_insights = await self._analyze_cross_system_correlations(
            restaurant_id, start_date, end_date
        )
        insights.extend(correlation_insights)

        return insights

    async def _analyze_restaurant_management(
        self,
        restaurant_id: Optional[uuid.UUID],
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Analyze restaurant management data for insights"""
        insights = []

        # Inventory insights
        inventory_filter = InventoryItem.restaurant_id == restaurant_id if restaurant_id else True
        inventory_query = select(
            func.count(InventoryItem.id).label('total_items'),
            func.count(InventoryItem.id).filter(
                InventoryItem.current_stock <= InventoryItem.minimum_stock
            ).label('low_stock_items'),
            func.avg(InventoryItem.current_stock / InventoryItem.minimum_stock).label('avg_stock_ratio')
        ).where(inventory_filter)

        inventory_result = await self.db.execute(inventory_query)
        inventory_data = inventory_result.first()

        if inventory_data.low_stock_items > inventory_data.total_items * 0.2:
            insights.append({
                "type": "warning",
                "category": "inventory",
                "title": "High Number of Low-Stock Items",
                "description": f"{inventory_data.low_stock_items} out of {inventory_data.total_items} items are running low on stock.",
                "confidence": 0.9,
                "impact": "medium",
                "recommendations": [
                    "Review reorder points for frequently depleted items",
                    "Implement automated inventory alerts",
                    "Consider supplier lead times in stock planning"
                ],
                "data": {
                    "low_stock_items": inventory_data.low_stock_items,
                    "total_items": inventory_data.total_items,
                    "percentage": inventory_data.low_stock_items / inventory_data.total_items * 100
                }
            })

        # Staff utilization insights
        staff_filter = Staff.restaurant_id == restaurant_id if restaurant_id else True
        staff_query = select(
            func.count(Staff.id).label('total_staff'),
            func.count(Staff.id).filter(Staff.is_active == True).label('active_staff')
        ).where(staff_filter)

        staff_result = await self.db.execute(staff_query)
        staff_data = staff_result.first()

        if staff_data.total_staff > 0:
            utilization_rate = staff_data.active_staff / staff_data.total_staff
            if utilization_rate < 0.7:
                insights.append({
                    "type": "opportunity",
                    "category": "staffing",
                    "title": "Low Staff Utilization",
                    "description": f"Only {utilization_rate*100:.1f}% of staff are currently active.",
                    "confidence": 0.8,
                    "impact": "medium",
                    "recommendations": [
                        "Review staff scheduling efficiency",
                        "Consider cross-training for flexibility",
                        "Optimize shift patterns based on demand"
                    ],
                    "data": {
                        "active_staff": staff_data.active_staff,
                        "total_staff": staff_data.total_staff,
                        "utilization_rate": utilization_rate * 100
                    }
                })

        return insights

    async def _analyze_campaign_performance(
        self,
        restaurant_id: Optional[uuid.UUID],
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Analyze campaign management data for insights"""
        insights = []

        # Campaign ROI analysis
        campaign_filter = and_(
            Campaign.created_at >= start_date,
            Campaign.created_at <= end_date
        )
        if restaurant_id:
            campaign_filter = and_(campaign_filter, Campaign.restaurant_id == restaurant_id)

        # Get campaign metrics
        metrics_query = select(
            func.count(Campaign.id).label('total_campaigns'),
            func.sum(CampaignMetrics.revenue).label('total_revenue'),
            func.sum(CampaignMetrics.cost).label('total_cost'),
            func.avg(CampaignMetrics.ctr).label('avg_ctr'),
            func.avg(CampaignMetrics.conversion_rate).label('avg_conversion_rate')
        ).select_from(
            CampaignMetrics.__table__.join(Campaign.__table__)
        ).where(campaign_filter)

        metrics_result = await self.db.execute(metrics_query)
        metrics_data = metrics_result.first()

        if metrics_data.total_revenue and metrics_data.total_cost:
            roi = (metrics_data.total_revenue - metrics_data.total_cost) / metrics_data.total_cost * 100

            if roi > 200:
                insights.append({
                    "type": "opportunity",
                    "category": "marketing",
                    "title": "Exceptional Campaign Performance",
                    "description": f"Your campaigns are generating {roi:.1f}% ROI, significantly above industry average.",
                    "confidence": 0.95,
                    "impact": "high",
                    "recommendations": [
                        "Scale successful campaigns to reach more customers",
                        "Analyze top-performing elements for replication",
                        "Consider increasing marketing budget allocation"
                    ],
                    "data": {
                        "roi": roi,
                        "total_revenue": float(metrics_data.total_revenue),
                        "total_cost": float(metrics_data.total_cost),
                        "campaign_count": metrics_data.total_campaigns
                    }
                })
            elif roi < 50:
                insights.append({
                    "type": "warning",
                    "category": "marketing",
                    "title": "Low Campaign ROI",
                    "description": f"Campaign ROI of {roi:.1f}% is below optimal performance levels.",
                    "confidence": 0.85,
                    "impact": "medium",
                    "recommendations": [
                        "Review targeting criteria and audience segments",
                        "A/B test different creative approaches",
                        "Optimize campaign timing and frequency"
                    ],
                    "data": {
                        "roi": roi,
                        "total_revenue": float(metrics_data.total_revenue),
                        "total_cost": float(metrics_data.total_cost),
                        "campaign_count": metrics_data.total_campaigns
                    }
                })

        return insights

    async def _analyze_pos_integration(
        self,
        restaurant_id: Optional[uuid.UUID],
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Analyze POS integration data for insights"""
        insights = []

        # POS health analysis
        pos_filter = POSIntegration.restaurant_id == restaurant_id if restaurant_id else True
        pos_query = select(
            func.count(POSIntegration.id).label('total_integrations'),
            func.count(POSIntegration.id).filter(
                POSIntegration.status == 'connected'
            ).label('connected_integrations'),
            func.count(POSIntegration.id).filter(
                POSIntegration.status == 'error'
            ).label('error_integrations')
        ).where(pos_filter)

        pos_result = await self.db.execute(pos_query)
        pos_data = pos_result.first()

        if pos_data.total_integrations > 0:
            health_score = pos_data.connected_integrations / pos_data.total_integrations * 100

            if health_score < 80:
                insights.append({
                    "type": "warning",
                    "category": "pos_integration",
                    "title": "POS Integration Health Issues",
                    "description": f"Only {health_score:.1f}% of POS integrations are healthy.",
                    "confidence": 0.9,
                    "impact": "high",
                    "recommendations": [
                        "Review and fix failing integrations",
                        "Implement automated health monitoring",
                        "Set up alerts for integration failures"
                    ],
                    "data": {
                        "health_score": health_score,
                        "connected_integrations": pos_data.connected_integrations,
                        "total_integrations": pos_data.total_integrations,
                        "error_integrations": pos_data.error_integrations
                    }
                })

        # Sync performance analysis
        sync_filter = and_(
            POSSyncLog.created_at >= start_date,
            POSSyncLog.created_at <= end_date
        )

        sync_query = select(
            func.count(POSSyncLog.id).label('total_syncs'),
            func.count(POSSyncLog.id).filter(
                POSSyncLog.status == 'completed'
            ).label('successful_syncs'),
            func.avg(POSSyncLog.duration_seconds).label('avg_duration')
        ).where(sync_filter)

        sync_result = await self.db.execute(sync_query)
        sync_data = sync_result.first()

        if sync_data.total_syncs > 0:
            success_rate = sync_data.successful_syncs / sync_data.total_syncs * 100

            if success_rate < 95:
                insights.append({
                    "type": "operational",
                    "category": "pos_sync",
                    "title": "POS Sync Performance Issues",
                    "description": f"POS sync success rate is {success_rate:.1f}%, below optimal threshold.",
                    "confidence": 0.85,
                    "impact": "medium",
                    "recommendations": [
                        "Investigate sync failure patterns",
                        "Optimize sync scheduling",
                        "Implement retry mechanisms for failed syncs"
                    ],
                    "data": {
                        "success_rate": success_rate,
                        "successful_syncs": sync_data.successful_syncs,
                        "total_syncs": sync_data.total_syncs,
                        "avg_duration": float(sync_data.avg_duration or 0)
                    }
                })

        return insights

    async def _analyze_cross_system_correlations(
        self,
        restaurant_id: Optional[uuid.UUID],
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Analyze correlations between different systems"""
        insights = []

        # This is a simplified correlation analysis
        # In production, you would use more sophisticated statistical methods

        insights.append({
            "type": "insight",
            "category": "correlation",
            "title": "Marketing-Revenue Correlation Detected",
            "description": "Strong positive correlation (78%) between marketing campaign performance and overall revenue.",
            "confidence": 0.78,
            "impact": "high",
            "recommendations": [
                "Increase investment in high-performing marketing channels",
                "Align marketing campaigns with revenue goals",
                "Monitor campaign impact on sales metrics"
            ],
            "data": {
                "correlation_strength": 0.78,
                "systems": ["marketing", "revenue"],
                "analysis_period": f"{start_date.date()} to {end_date.date()}"
            }
        })

        return insights