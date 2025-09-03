"""
Campaign Management Service

This module provides business logic for campaign management operations.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
import uuid

from app.models.campaign_management import (
    Campaign, ABTest, CampaignMetrics, CampaignAudience, CampaignTemplate,
    CampaignType, CampaignStatus, CampaignChannel, ABTestStatus
)
from app.models.restaurant import Restaurant


class CampaignManagementService:
    """Service for managing marketing campaigns and related operations"""

    @staticmethod
    async def create_campaign(
        db: AsyncSession,
        restaurant_id: str,
        campaign_data: Dict[str, Any]
    ) -> Campaign:
        """Create a new marketing campaign"""
        campaign = Campaign(
            restaurant_id=uuid.UUID(restaurant_id),
            name=campaign_data["name"],
            description=campaign_data.get("description"),
            type=CampaignType(campaign_data["type"]),
            start_date=datetime.fromisoformat(campaign_data["start_date"]),
            end_date=datetime.fromisoformat(campaign_data["end_date"]),
            budget=campaign_data.get("budget", 0.00),
            target_demographics=campaign_data.get("target_demographics", {}),
            target_behaviors=campaign_data.get("target_behaviors", {}),
            content=campaign_data.get("content", {}),
            creative_assets=campaign_data.get("creative_assets", {}),
            channels=campaign_data.get("channels", []),
            frequency_cap=campaign_data.get("frequency_cap", 1),
            is_ab_test=campaign_data.get("is_ab_test", False)
        )
        
        db.add(campaign)
        await db.commit()
        await db.refresh(campaign)
        return campaign

    @staticmethod
    async def get_campaigns(
        db: AsyncSession,
        restaurant_id: str,
        status: Optional[CampaignStatus] = None,
        campaign_type: Optional[CampaignType] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Campaign]:
        """Get campaigns for a restaurant with optional filtering"""
        query = select(Campaign).where(Campaign.restaurant_id == uuid.UUID(restaurant_id))
        
        if status:
            query = query.where(Campaign.status == status)
        if campaign_type:
            query = query.where(Campaign.type == campaign_type)
            
        query = query.options(
            selectinload(Campaign.ab_tests),
            selectinload(Campaign.campaign_metrics),
            selectinload(Campaign.campaign_audiences)
        ).order_by(desc(Campaign.created_at)).limit(limit).offset(offset)
        
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_campaign_by_id(
        db: AsyncSession,
        campaign_id: str,
        restaurant_id: str
    ) -> Optional[Campaign]:
        """Get a specific campaign by ID"""
        query = select(Campaign).where(
            and_(
                Campaign.id == uuid.UUID(campaign_id),
                Campaign.restaurant_id == uuid.UUID(restaurant_id)
            )
        ).options(
            selectinload(Campaign.ab_tests),
            selectinload(Campaign.campaign_metrics),
            selectinload(Campaign.campaign_audiences)
        )
        
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_campaign(
        db: AsyncSession,
        campaign_id: str,
        restaurant_id: str,
        update_data: Dict[str, Any]
    ) -> Optional[Campaign]:
        """Update an existing campaign"""
        campaign = await CampaignManagementService.get_campaign_by_id(
            db, campaign_id, restaurant_id
        )
        
        if not campaign:
            return None
            
        for key, value in update_data.items():
            if hasattr(campaign, key):
                if key in ["start_date", "end_date"] and isinstance(value, str):
                    value = datetime.fromisoformat(value)
                elif key == "type" and isinstance(value, str):
                    value = CampaignType(value)
                elif key == "status" and isinstance(value, str):
                    value = CampaignStatus(value)
                setattr(campaign, key, value)
        
        campaign.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(campaign)
        return campaign

    @staticmethod
    async def delete_campaign(
        db: AsyncSession,
        campaign_id: str,
        restaurant_id: str
    ) -> bool:
        """Delete a campaign"""
        campaign = await CampaignManagementService.get_campaign_by_id(
            db, campaign_id, restaurant_id
        )
        
        if not campaign:
            return False
            
        await db.delete(campaign)
        await db.commit()
        return True

    @staticmethod
    async def create_ab_test(
        db: AsyncSession,
        campaign_id: str,
        restaurant_id: str,
        ab_test_data: Dict[str, Any]
    ) -> Optional[ABTest]:
        """Create an A/B test for a campaign"""
        # Verify campaign exists and belongs to restaurant
        campaign = await CampaignManagementService.get_campaign_by_id(
            db, campaign_id, restaurant_id
        )
        
        if not campaign:
            return None
            
        ab_test = ABTest(
            campaign_id=uuid.UUID(campaign_id),
            name=ab_test_data["name"],
            description=ab_test_data.get("description"),
            traffic_split=ab_test_data.get("traffic_split", 50.00),
            confidence_level=ab_test_data.get("confidence_level", 95.00),
            minimum_sample_size=ab_test_data.get("minimum_sample_size", 100),
            variant_a_content=ab_test_data.get("variant_a_content", {}),
            variant_b_content=ab_test_data.get("variant_b_content", {}),
            start_date=datetime.fromisoformat(ab_test_data["start_date"]) if ab_test_data.get("start_date") else None,
            end_date=datetime.fromisoformat(ab_test_data["end_date"]) if ab_test_data.get("end_date") else None
        )
        
        db.add(ab_test)
        await db.commit()
        await db.refresh(ab_test)
        return ab_test

    @staticmethod
    async def record_campaign_metrics(
        db: AsyncSession,
        campaign_id: str,
        metrics_data: Dict[str, Any]
    ) -> CampaignMetrics:
        """Record daily metrics for a campaign"""
        metrics = CampaignMetrics(
            campaign_id=uuid.UUID(campaign_id),
            date=datetime.fromisoformat(metrics_data["date"]) if isinstance(metrics_data["date"], str) else metrics_data["date"],
            impressions=metrics_data.get("impressions", 0),
            clicks=metrics_data.get("clicks", 0),
            opens=metrics_data.get("opens", 0),
            views=metrics_data.get("views", 0),
            shares=metrics_data.get("shares", 0),
            likes=metrics_data.get("likes", 0),
            comments=metrics_data.get("comments", 0),
            conversions=metrics_data.get("conversions", 0),
            revenue=metrics_data.get("revenue", 0.00),
            orders=metrics_data.get("orders", 0),
            new_customers=metrics_data.get("new_customers", 0),
            returning_customers=metrics_data.get("returning_customers", 0),
            cost=metrics_data.get("cost", 0.00),
            channel=CampaignChannel(metrics_data["channel"]) if metrics_data.get("channel") else None
        )
        
        # Calculate derived metrics
        if metrics.impressions > 0:
            metrics.ctr = (metrics.clicks / metrics.impressions) * 100
            if metrics.cost > 0:
                metrics.cpm = (metrics.cost / metrics.impressions) * 1000
        
        if metrics.clicks > 0:
            metrics.conversion_rate = (metrics.conversions / metrics.clicks) * 100
            if metrics.cost > 0:
                metrics.cpc = metrics.cost / metrics.clicks
        
        if metrics.conversions > 0 and metrics.cost > 0:
            metrics.cpa = metrics.cost / metrics.conversions
        
        if metrics.cost > 0:
            metrics.roi = ((metrics.revenue - metrics.cost) / metrics.cost) * 100
            metrics.roas = metrics.revenue / metrics.cost
        
        db.add(metrics)
        await db.commit()
        await db.refresh(metrics)
        return metrics

    @staticmethod
    async def get_campaign_performance(
        db: AsyncSession,
        campaign_id: str,
        restaurant_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get aggregated performance metrics for a campaign"""
        # Verify campaign exists and belongs to restaurant
        campaign = await CampaignManagementService.get_campaign_by_id(
            db, campaign_id, restaurant_id
        )
        
        if not campaign:
            return {}
        
        query = select(CampaignMetrics).where(CampaignMetrics.campaign_id == uuid.UUID(campaign_id))
        
        if start_date:
            query = query.where(CampaignMetrics.date >= start_date)
        if end_date:
            query = query.where(CampaignMetrics.date <= end_date)
        
        result = await db.execute(query)
        metrics = result.scalars().all()
        
        if not metrics:
            return {
                "total_impressions": 0,
                "total_clicks": 0,
                "total_conversions": 0,
                "total_revenue": 0.00,
                "total_cost": 0.00,
                "average_ctr": 0.00,
                "average_conversion_rate": 0.00,
                "roi": 0.00,
                "roas": 0.00
            }
        
        # Aggregate metrics
        total_impressions = sum(m.impressions for m in metrics)
        total_clicks = sum(m.clicks for m in metrics)
        total_conversions = sum(m.conversions for m in metrics)
        total_revenue = sum(m.revenue for m in metrics)
        total_cost = sum(m.cost for m in metrics)
        
        # Calculate averages and ratios
        avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        avg_conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
        roi = ((total_revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
        roas = (total_revenue / total_cost) if total_cost > 0 else 0
        
        return {
            "total_impressions": total_impressions,
            "total_clicks": total_clicks,
            "total_conversions": total_conversions,
            "total_revenue": float(total_revenue),
            "total_cost": float(total_cost),
            "average_ctr": round(avg_ctr, 2),
            "average_conversion_rate": round(avg_conversion_rate, 2),
            "roi": round(roi, 2),
            "roas": round(roas, 2),
            "daily_metrics": [
                {
                    "date": m.date.isoformat(),
                    "impressions": m.impressions,
                    "clicks": m.clicks,
                    "conversions": m.conversions,
                    "revenue": float(m.revenue),
                    "cost": float(m.cost),
                    "ctr": float(m.ctr) if m.ctr else 0,
                    "conversion_rate": float(m.conversion_rate) if m.conversion_rate else 0,
                    "channel": m.channel.value if m.channel else None
                }
                for m in sorted(metrics, key=lambda x: x.date)
            ]
        }

    @staticmethod
    async def create_campaign_audience(
        db: AsyncSession,
        campaign_id: str,
        restaurant_id: str,
        audience_data: Dict[str, Any]
    ) -> Optional[CampaignAudience]:
        """Create a targeted audience for a campaign"""
        # Verify campaign exists and belongs to restaurant
        campaign = await CampaignManagementService.get_campaign_by_id(
            db, campaign_id, restaurant_id
        )
        
        if not campaign:
            return None
            
        audience = CampaignAudience(
            campaign_id=uuid.UUID(campaign_id),
            name=audience_data["name"],
            description=audience_data.get("description"),
            criteria=audience_data.get("criteria", {}),
            estimated_size=audience_data.get("estimated_size", 0)
        )
        
        db.add(audience)
        await db.commit()
        await db.refresh(audience)
        return audience

    @staticmethod
    async def get_campaign_templates(
        db: AsyncSession,
        restaurant_id: str,
        category: Optional[str] = None
    ) -> List[CampaignTemplate]:
        """Get campaign templates for a restaurant"""
        query = select(CampaignTemplate).where(
            or_(
                CampaignTemplate.restaurant_id == uuid.UUID(restaurant_id),
                CampaignTemplate.is_public == True
            )
        )
        
        if category:
            query = query.where(CampaignTemplate.category == category)
            
        query = query.order_by(desc(CampaignTemplate.usage_count))
        
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def create_campaign_template(
        db: AsyncSession,
        restaurant_id: str,
        template_data: Dict[str, Any]
    ) -> CampaignTemplate:
        """Create a new campaign template"""
        template = CampaignTemplate(
            restaurant_id=uuid.UUID(restaurant_id),
            name=template_data["name"],
            description=template_data.get("description"),
            category=template_data.get("category"),
            template_data=template_data.get("template_data", {}),
            is_public=template_data.get("is_public", False)
        )
        
        db.add(template)
        await db.commit()
        await db.refresh(template)
        return template
