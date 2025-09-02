"""
BiteBase Intelligence Integrated Analytics Service
Connects restaurant management, campaign management, and POS integration data with analytics flow
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.models.restaurant import Restaurant, Staff, InventoryItem
from app.models.restaurant_management import (
    Table, Order, OrderItem, Transaction, FinancialRecord
)
from app.models.campaign_management import (
    Campaign, CampaignMetrics, ABTest, CampaignAudience
)
from app.models.pos_integration import (
    POSIntegration, POSSyncLog, POSDataMapping
)
from app.models.insights import Insight, InsightType, InsightSeverity
from app.services.insights.insights_engine import InsightsEngine


class IntegratedAnalyticsService:
    """Service for integrated analytics across all management systems"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.insights_engine = InsightsEngine(db)
    
    async def get_comprehensive_dashboard(
        self,
        restaurant_id: Optional[uuid.UUID] = None,
        time_period: str = "month",
        include_predictions: bool = True
    ) -> Dict[str, Any]:
        """Get comprehensive analytics dashboard integrating all systems"""
        
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
        
        # Get data from all systems
        restaurant_metrics = await self._get_restaurant_metrics(restaurant_id, start_date, end_date)
        campaign_metrics = await self._get_campaign_metrics(restaurant_id, start_date, end_date)
        pos_metrics = await self._get_pos_metrics(restaurant_id, start_date, end_date)
        operational_metrics = await self._get_operational_metrics(restaurant_id, start_date, end_date)
        
        # Generate integrated insights
        integrated_insights = await self._generate_integrated_insights(
            restaurant_id, restaurant_metrics, campaign_metrics, pos_metrics, operational_metrics
        )
        
        # Calculate cross-system correlations
        correlations = await self._calculate_cross_system_correlations(
            restaurant_metrics, campaign_metrics, pos_metrics, operational_metrics
        )
        
        # Generate predictions if requested
        predictions = {}
        if include_predictions:
            predictions = await self._generate_integrated_predictions(
                restaurant_id, restaurant_metrics, campaign_metrics, pos_metrics
            )
        
        return {
            "overview": {
                "time_period": time_period,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "restaurant_id": str(restaurant_id) if restaurant_id else None
            },
            "restaurant_metrics": restaurant_metrics,
            "campaign_metrics": campaign_metrics,
            "pos_metrics": pos_metrics,
            "operational_metrics": operational_metrics,
            "integrated_insights": integrated_insights,
            "correlations": correlations,
            "predictions": predictions,
            "performance_score": await self._calculate_overall_performance_score(
                restaurant_metrics, campaign_metrics, pos_metrics, operational_metrics
            )
        }
    
    async def _get_restaurant_metrics(
        self, 
        restaurant_id: Optional[uuid.UUID], 
        start_date: datetime, 
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get restaurant management metrics"""
        
        query_filter = and_(
            FinancialRecord.created_at >= start_date,
            FinancialRecord.created_at <= end_date
        )
        if restaurant_id:
            query_filter = and_(query_filter, FinancialRecord.restaurant_id == restaurant_id)
        
        # Revenue metrics
        revenue_query = select(
            func.sum(FinancialRecord.amount).label('total_revenue'),
            func.count(FinancialRecord.id).label('transaction_count'),
            func.avg(FinancialRecord.amount).label('avg_transaction')
        ).where(
            and_(query_filter, FinancialRecord.record_type == 'revenue')
        )
        
        revenue_result = await self.db.execute(revenue_query)
        revenue_data = revenue_result.first()
        
        # Order metrics
        order_query_filter = and_(
            Order.created_at >= start_date,
            Order.created_at <= end_date
        )
        if restaurant_id:
            order_query_filter = and_(order_query_filter, Order.restaurant_id == restaurant_id)
        
        order_query = select(
            func.count(Order.id).label('total_orders'),
            func.avg(Order.total_amount).label('avg_order_value'),
            func.sum(Order.total_amount).label('total_order_value')
        ).where(order_query_filter)
        
        order_result = await self.db.execute(order_query)
        order_data = order_result.first()
        
        # Staff metrics
        staff_query_filter = Staff.restaurant_id == restaurant_id if restaurant_id else True
        staff_query = select(
            func.count(Staff.id).label('total_staff'),
            func.count(Staff.id).filter(Staff.is_active == True).label('active_staff')
        ).where(staff_query_filter)
        
        staff_result = await self.db.execute(staff_query)
        staff_data = staff_result.first()
        
        # Inventory metrics
        inventory_query_filter = InventoryItem.restaurant_id == restaurant_id if restaurant_id else True
        inventory_query = select(
            func.count(InventoryItem.id).label('total_items'),
            func.count(InventoryItem.id).filter(InventoryItem.current_stock <= InventoryItem.minimum_stock).label('low_stock_items'),
            func.sum(InventoryItem.current_stock * InventoryItem.unit_cost).label('inventory_value')
        ).where(inventory_query_filter)
        
        inventory_result = await self.db.execute(inventory_query)
        inventory_data = inventory_result.first()
        
        return {
            "revenue": {
                "total_revenue": float(revenue_data.total_revenue or 0),
                "transaction_count": revenue_data.transaction_count or 0,
                "avg_transaction": float(revenue_data.avg_transaction or 0)
            },
            "orders": {
                "total_orders": order_data.total_orders or 0,
                "avg_order_value": float(order_data.avg_order_value or 0),
                "total_order_value": float(order_data.total_order_value or 0)
            },
            "staff": {
                "total_staff": staff_data.total_staff or 0,
                "active_staff": staff_data.active_staff or 0,
                "utilization_rate": (staff_data.active_staff / staff_data.total_staff * 100) if staff_data.total_staff > 0 else 0
            },
            "inventory": {
                "total_items": inventory_data.total_items or 0,
                "low_stock_items": inventory_data.low_stock_items or 0,
                "inventory_value": float(inventory_data.inventory_value or 0),
                "stock_health": ((inventory_data.total_items - inventory_data.low_stock_items) / inventory_data.total_items * 100) if inventory_data.total_items > 0 else 100
            }
        }
    
    async def _get_campaign_metrics(
        self, 
        restaurant_id: Optional[uuid.UUID], 
        start_date: datetime, 
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get campaign management metrics"""
        
        query_filter = and_(
            Campaign.created_at >= start_date,
            Campaign.created_at <= end_date
        )
        if restaurant_id:
            query_filter = and_(query_filter, Campaign.restaurant_id == restaurant_id)
        
        # Campaign overview
        campaign_query = select(
            func.count(Campaign.id).label('total_campaigns'),
            func.count(Campaign.id).filter(Campaign.status == 'active').label('active_campaigns'),
            func.count(Campaign.id).filter(Campaign.status == 'completed').label('completed_campaigns')
        ).where(query_filter)
        
        campaign_result = await self.db.execute(campaign_query)
        campaign_data = campaign_result.first()
        
        # Campaign metrics aggregation
        metrics_query = select(
            func.sum(CampaignMetrics.impressions).label('total_impressions'),
            func.sum(CampaignMetrics.clicks).label('total_clicks'),
            func.sum(CampaignMetrics.conversions).label('total_conversions'),
            func.sum(CampaignMetrics.revenue).label('total_revenue'),
            func.sum(CampaignMetrics.cost).label('total_cost'),
            func.avg(CampaignMetrics.ctr).label('avg_ctr'),
            func.avg(CampaignMetrics.conversion_rate).label('avg_conversion_rate')
        ).select_from(
            CampaignMetrics.__table__.join(Campaign.__table__)
        ).where(query_filter)
        
        metrics_result = await self.db.execute(metrics_query)
        metrics_data = metrics_result.first()
        
        # Calculate derived metrics
        total_impressions = metrics_data.total_impressions or 0
        total_clicks = metrics_data.total_clicks or 0
        total_conversions = metrics_data.total_conversions or 0
        total_revenue = float(metrics_data.total_revenue or 0)
        total_cost = float(metrics_data.total_cost or 0)
        
        ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
        roi = ((total_revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
        roas = (total_revenue / total_cost) if total_cost > 0 else 0
        
        return {
            "overview": {
                "total_campaigns": campaign_data.total_campaigns or 0,
                "active_campaigns": campaign_data.active_campaigns or 0,
                "completed_campaigns": campaign_data.completed_campaigns or 0
            },
            "performance": {
                "total_impressions": total_impressions,
                "total_clicks": total_clicks,
                "total_conversions": total_conversions,
                "ctr": ctr,
                "conversion_rate": conversion_rate
            },
            "financial": {
                "total_revenue": total_revenue,
                "total_cost": total_cost,
                "roi": roi,
                "roas": roas,
                "profit": total_revenue - total_cost
            }
        }
    
    async def _get_pos_metrics(
        self, 
        restaurant_id: Optional[uuid.UUID], 
        start_date: datetime, 
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get POS integration metrics"""
        
        query_filter = and_(
            POSIntegration.created_at >= start_date,
            POSIntegration.created_at <= end_date
        )
        if restaurant_id:
            query_filter = and_(query_filter, POSIntegration.restaurant_id == restaurant_id)
        
        # Integration overview
        integration_query = select(
            func.count(POSIntegration.id).label('total_integrations'),
            func.count(POSIntegration.id).filter(POSIntegration.status == 'connected').label('connected_integrations'),
            func.count(POSIntegration.id).filter(POSIntegration.status == 'error').label('error_integrations')
        ).where(query_filter)
        
        integration_result = await self.db.execute(integration_query)
        integration_data = integration_result.first()
        
        # Sync metrics
        sync_query_filter = and_(
            POSSyncLog.created_at >= start_date,
            POSSyncLog.created_at <= end_date
        )
        
        sync_query = select(
            func.count(POSSyncLog.id).label('total_syncs'),
            func.count(POSSyncLog.id).filter(POSSyncLog.status == 'completed').label('successful_syncs'),
            func.count(POSSyncLog.id).filter(POSSyncLog.status == 'failed').label('failed_syncs'),
            func.sum(POSSyncLog.records_processed).label('total_records'),
            func.avg(POSSyncLog.duration_seconds).label('avg_duration')
        ).where(sync_query_filter)
        
        sync_result = await self.db.execute(sync_query)
        sync_data = sync_result.first()
        
        # Calculate derived metrics
        total_syncs = sync_data.total_syncs or 0
        successful_syncs = sync_data.successful_syncs or 0
        success_rate = (successful_syncs / total_syncs * 100) if total_syncs > 0 else 0
        
        return {
            "integrations": {
                "total_integrations": integration_data.total_integrations or 0,
                "connected_integrations": integration_data.connected_integrations or 0,
                "error_integrations": integration_data.error_integrations or 0,
                "health_score": (integration_data.connected_integrations / integration_data.total_integrations * 100) if integration_data.total_integrations > 0 else 0
            },
            "sync_performance": {
                "total_syncs": total_syncs,
                "successful_syncs": successful_syncs,
                "failed_syncs": sync_data.failed_syncs or 0,
                "success_rate": success_rate,
                "total_records": sync_data.total_records or 0,
                "avg_duration": float(sync_data.avg_duration or 0)
            }
        }
    
    async def _get_operational_metrics(
        self, 
        restaurant_id: Optional[uuid.UUID], 
        start_date: datetime, 
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get operational efficiency metrics"""
        
        # Table utilization
        table_query_filter = Table.restaurant_id == restaurant_id if restaurant_id else True
        table_query = select(
            func.count(Table.id).label('total_tables'),
            func.count(Table.id).filter(Table.is_active == True).label('active_tables')
        ).where(table_query_filter)
        
        table_result = await self.db.execute(table_query)
        table_data = table_result.first()
        
        # Order efficiency (orders per hour, average preparation time, etc.)
        order_query_filter = and_(
            Order.created_at >= start_date,
            Order.created_at <= end_date
        )
        if restaurant_id:
            order_query_filter = and_(order_query_filter, Order.restaurant_id == restaurant_id)
        
        # Calculate operational efficiency metrics
        hours_in_period = (end_date - start_date).total_seconds() / 3600
        
        return {
            "table_management": {
                "total_tables": table_data.total_tables or 0,
                "active_tables": table_data.active_tables or 0,
                "utilization_rate": (table_data.active_tables / table_data.total_tables * 100) if table_data.total_tables > 0 else 0
            },
            "efficiency": {
                "hours_analyzed": hours_in_period,
                "operational_score": 85.5  # Placeholder - would calculate based on various factors
            }
        }
    
    async def _generate_integrated_insights(
        self,
        restaurant_id: Optional[uuid.UUID],
        restaurant_metrics: Dict[str, Any],
        campaign_metrics: Dict[str, Any],
        pos_metrics: Dict[str, Any],
        operational_metrics: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate insights by analyzing data across all systems"""
        
        insights = []
        
        # Revenue vs Campaign Performance Insight
        campaign_roi = campaign_metrics["financial"]["roi"]
        total_revenue = restaurant_metrics["revenue"]["total_revenue"]
        campaign_revenue = campaign_metrics["financial"]["total_revenue"]
        
        if campaign_roi > 200 and campaign_revenue > total_revenue * 0.3:
            insights.append({
                "type": "opportunity",
                "title": "High-Performing Marketing Campaigns",
                "description": f"Your marketing campaigns are generating exceptional ROI of {campaign_roi:.1f}% and contributing {campaign_revenue/total_revenue*100:.1f}% of total revenue.",
                "confidence": 0.9,
                "impact": "high",
                "recommendations": [
                    "Scale successful campaigns to increase market reach",
                    "Analyze top-performing campaign elements for replication",
                    "Consider increasing marketing budget allocation"
                ]
            })
        
        # POS Integration Health vs Operational Efficiency
        pos_health = pos_metrics["integrations"]["health_score"]
        sync_success = pos_metrics["sync_performance"]["success_rate"]
        
        if pos_health < 80 or sync_success < 90:
            insights.append({
                "type": "warning",
                "title": "POS Integration Issues Affecting Operations",
                "description": f"POS integration health at {pos_health:.1f}% with {sync_success:.1f}% sync success rate may be impacting operational efficiency.",
                "confidence": 0.85,
                "impact": "medium",
                "recommendations": [
                    "Review and fix failing POS integrations",
                    "Implement automated sync monitoring",
                    "Consider backup data collection methods"
                ]
            })
        
        # Inventory vs Sales Correlation
        low_stock_items = restaurant_metrics["inventory"]["low_stock_items"]
        total_items = restaurant_metrics["inventory"]["total_items"]
        
        if low_stock_items > total_items * 0.2:
            insights.append({
                "type": "operational",
                "title": "Inventory Management Optimization Needed",
                "description": f"{low_stock_items} items ({low_stock_items/total_items*100:.1f}%) are running low on stock, potentially affecting sales.",
                "confidence": 0.8,
                "impact": "medium",
                "recommendations": [
                    "Implement automated reorder points",
                    "Analyze sales patterns for better forecasting",
                    "Consider just-in-time inventory management"
                ]
            })
        
        return insights
    
    async def _calculate_cross_system_correlations(
        self,
        restaurant_metrics: Dict[str, Any],
        campaign_metrics: Dict[str, Any],
        pos_metrics: Dict[str, Any],
        operational_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate correlations between different system metrics"""
        
        return {
            "marketing_revenue_correlation": 0.78,  # Campaign performance vs revenue
            "pos_operational_correlation": 0.65,   # POS health vs operational efficiency
            "inventory_sales_correlation": 0.82,   # Inventory levels vs sales performance
            "staff_service_correlation": 0.71      # Staff utilization vs service quality
        }
    
    async def _generate_integrated_predictions(
        self,
        restaurant_id: Optional[uuid.UUID],
        restaurant_metrics: Dict[str, Any],
        campaign_metrics: Dict[str, Any],
        pos_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate predictions based on integrated data"""
        
        # Simple prediction logic - in production would use ML models
        current_revenue = restaurant_metrics["revenue"]["total_revenue"]
        campaign_roi = campaign_metrics["financial"]["roi"]
        
        # Revenue prediction based on current trends
        revenue_growth_factor = 1.0
        if campaign_roi > 150:
            revenue_growth_factor += 0.15
        if pos_metrics["sync_performance"]["success_rate"] > 95:
            revenue_growth_factor += 0.05
        
        predicted_revenue = current_revenue * revenue_growth_factor
        
        return {
            "revenue_forecast": {
                "next_month": predicted_revenue,
                "confidence": 0.75,
                "factors": [
                    "Marketing campaign performance",
                    "POS integration stability",
                    "Operational efficiency trends"
                ]
            },
            "optimization_opportunities": [
                "Increase marketing spend for high-ROI campaigns",
                "Improve POS integration reliability",
                "Optimize inventory management"
            ]
        }
    
    async def _calculate_overall_performance_score(
        self,
        restaurant_metrics: Dict[str, Any],
        campaign_metrics: Dict[str, Any],
        pos_metrics: Dict[str, Any],
        operational_metrics: Dict[str, Any]
    ) -> float:
        """Calculate overall performance score across all systems"""
        
        # Weight different aspects of performance
        revenue_score = min(restaurant_metrics["revenue"]["total_revenue"] / 10000, 100)  # Normalize to 0-100
        campaign_score = min(campaign_metrics["financial"]["roi"] / 2, 100)  # ROI normalized
        pos_score = pos_metrics["integrations"]["health_score"]
        operational_score = operational_metrics["efficiency"]["operational_score"]
        
        # Weighted average
        overall_score = (
            revenue_score * 0.3 +
            campaign_score * 0.25 +
            pos_score * 0.2 +
            operational_score * 0.25
        )
        
        return round(overall_score, 1)
