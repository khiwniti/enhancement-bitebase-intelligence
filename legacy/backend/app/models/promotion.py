"""
Promotion Intelligence Models for BiteBase Intelligence
SQLAlchemy models for customer segmentation, campaign automation, and loyalty analytics
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Numeric, Index, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class CustomerSegment(Base):
    """Customer segmentation for targeted marketing"""
    __tablename__ = "customer_segments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Segment definition
    segment_name = Column(String(255), nullable=False)
    segment_description = Column(Text, nullable=True)
    segment_type = Column(String(50), nullable=False)  # behavioral, demographic, geographic, psychographic
    
    # Segmentation criteria
    segment_criteria = Column(JSON, nullable=False)  # Complex criteria object
    rfm_score_range = Column(JSON, nullable=False)  # RFM score ranges
    
    # Segment characteristics
    customer_count = Column(Integer, nullable=False, default=0)
    average_clv = Column(Numeric(12, 2), nullable=False, default=0)  # Customer Lifetime Value
    average_order_value = Column(Numeric(10, 2), nullable=False, default=0)
    average_order_frequency = Column(Numeric(6, 2), nullable=False, default=0)  # Orders per month
    
    # Behavioral patterns
    preferred_order_times = Column(JSON, nullable=True)
    preferred_menu_categories = Column(JSON, nullable=True)
    price_sensitivity_level = Column(String(20), nullable=True)  # high, medium, low
    channel_preferences = Column(JSON, nullable=True)  # delivery, pickup, dine_in
    
    # Engagement metrics
    email_open_rate = Column(Numeric(5, 2), nullable=True)  # Percentage
    email_click_rate = Column(Numeric(5, 2), nullable=True)  # Percentage
    promotion_response_rate = Column(Numeric(5, 2), nullable=True)  # Percentage
    social_media_engagement = Column(Numeric(5, 2), nullable=True)
    
    # Profitability
    total_revenue_contribution = Column(Numeric(12, 2), nullable=False, default=0)
    profit_margin_percentage = Column(Numeric(5, 2), nullable=True)
    acquisition_cost = Column(Numeric(10, 2), nullable=True)
    retention_rate = Column(Numeric(5, 2), nullable=True)  # Percentage
    
    # Segment health
    growth_rate = Column(Numeric(5, 2), nullable=True)  # Monthly growth percentage
    churn_rate = Column(Numeric(5, 2), nullable=True)  # Monthly churn percentage
    satisfaction_score = Column(Numeric(3, 2), nullable=True)  # 0-5 scale
    
    # Automation settings
    is_active = Column(Boolean, default=True)
    auto_update_enabled = Column(Boolean, default=True)
    last_updated = Column(DateTime, nullable=False)
    update_frequency_days = Column(Integer, default=7)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="customer_segments")
    segment_assignments = relationship("CustomerSegmentAssignment", back_populates="segment")
    campaigns = relationship("AutomatedCampaign", back_populates="target_segment")
    created_by_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_customer_segments_restaurant', 'restaurant_id'),
        Index('idx_customer_segments_type', 'segment_type'),
        Index('idx_customer_segments_active', 'is_active'),
        Index('idx_customer_segments_clv', 'average_clv'),
        Index('idx_customer_segments_count', 'customer_count'),
    )


class CustomerSegmentAssignment(Base):
    """Track customer assignments to segments"""
    __tablename__ = "customer_segment_assignments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), nullable=False)  # Can be anonymized
    segment_id = Column(String(36), ForeignKey("customer_segments.id"), nullable=False)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Assignment details
    assignment_date = Column(DateTime, nullable=False)
    confidence_score = Column(Numeric(3, 2), nullable=False)  # 0-1
    assignment_method = Column(String(50), nullable=False)  # manual, automated, ml_model
    
    # Customer characteristics at assignment
    customer_rfm_score = Column(String(10), nullable=True)  # "555"
    customer_clv = Column(Numeric(12, 2), nullable=True)
    customer_order_count = Column(Integer, nullable=True)
    customer_avg_order_value = Column(Numeric(10, 2), nullable=True)
    
    # Assignment status
    is_active = Column(Boolean, default=True)
    deactivation_date = Column(DateTime, nullable=True)
    deactivation_reason = Column(String(255), nullable=True)
    
    # Performance tracking
    campaigns_received = Column(Integer, default=0)
    campaigns_responded = Column(Integer, default=0)
    response_rate = Column(Numeric(5, 2), nullable=True)
    revenue_generated = Column(Numeric(12, 2), default=0)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    segment = relationship("CustomerSegment", back_populates="segment_assignments")
    restaurant = relationship("Restaurant", back_populates="customer_segment_assignments")
    
    # Indexes
    __table_args__ = (
        Index('idx_customer_segment_assignments_customer', 'customer_id'),
        Index('idx_customer_segment_assignments_segment', 'segment_id'),
        Index('idx_customer_segment_assignments_restaurant', 'restaurant_id'),
        Index('idx_customer_segment_assignments_active', 'is_active'),
        Index('idx_customer_segment_assignments_date', 'assignment_date'),
    )


class AutomatedCampaign(Base):
    """Automated marketing campaigns generated by AI"""
    __tablename__ = "automated_campaigns"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    segment_id = Column(String(36), ForeignKey("customer_segments.id"), nullable=True)
    
    # Campaign basics
    campaign_name = Column(String(255), nullable=False)
    campaign_type = Column(String(50), nullable=False)  # email, sms, push, social, in_app
    campaign_objective = Column(String(50), nullable=False)  # acquisition, retention, upsell, winback
    
    # AI generation details
    generated_by_ai = Column(Boolean, default=True)
    ai_model_version = Column(String(20), nullable=True)
    generation_prompt = Column(Text, nullable=True)
    generation_confidence = Column(Numeric(3, 2), nullable=True)  # 0-1
    
    # Campaign content
    subject_line = Column(String(255), nullable=True)
    message_content = Column(Text, nullable=False)
    call_to_action = Column(String(255), nullable=True)
    offer_details = Column(JSON, nullable=True)  # Discount, promotion details
    
    # Targeting
    target_audience_size = Column(Integer, nullable=False)
    targeting_criteria = Column(JSON, nullable=False)
    personalization_level = Column(String(20), nullable=False)  # none, basic, advanced, hyper
    
    # Scheduling
    scheduled_send_time = Column(DateTime, nullable=True)
    optimal_send_time = Column(DateTime, nullable=True)  # AI-recommended time
    time_zone = Column(String(50), nullable=False, default="UTC")
    frequency_cap = Column(Integer, nullable=True)  # Max sends per customer per period
    
    # Performance tracking
    status = Column(String(20), nullable=False, default="draft")  # draft, scheduled, sent, completed, cancelled
    sent_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    opened_count = Column(Integer, default=0)
    clicked_count = Column(Integer, default=0)
    converted_count = Column(Integer, default=0)
    
    # Metrics
    open_rate = Column(Numeric(5, 2), nullable=True)
    click_rate = Column(Numeric(5, 2), nullable=True)
    conversion_rate = Column(Numeric(5, 2), nullable=True)
    revenue_generated = Column(Numeric(12, 2), default=0)
    roi = Column(Numeric(8, 2), nullable=True)  # Return on Investment
    
    # Cost tracking
    campaign_cost = Column(Numeric(10, 2), default=0)
    cost_per_acquisition = Column(Numeric(10, 2), nullable=True)
    cost_per_click = Column(Numeric(6, 2), nullable=True)
    
    # A/B testing
    is_ab_test = Column(Boolean, default=False)
    ab_test_variant = Column(String(10), nullable=True)  # A, B, C
    ab_test_group_id = Column(String(36), nullable=True)
    
    # Optimization
    optimization_enabled = Column(Boolean, default=True)
    auto_optimization_applied = Column(JSON, nullable=True)  # List of optimizations
    performance_score = Column(Numeric(3, 2), nullable=True)  # 0-1
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="automated_campaigns")
    target_segment = relationship("CustomerSegment", back_populates="campaigns")
    created_by_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_automated_campaigns_restaurant', 'restaurant_id'),
        Index('idx_automated_campaigns_segment', 'segment_id'),
        Index('idx_automated_campaigns_status', 'status'),
        Index('idx_automated_campaigns_type', 'campaign_type'),
        Index('idx_automated_campaigns_send_time', 'scheduled_send_time'),
        Index('idx_automated_campaigns_performance', 'conversion_rate'),
    )


class LoyaltyProgram(Base):
    """Loyalty program configuration and tracking"""
    __tablename__ = "loyalty_programs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Program basics
    program_name = Column(String(255), nullable=False)
    program_type = Column(String(50), nullable=False)  # points, visits, spend, tier
    program_description = Column(Text, nullable=True)
    
    # Program rules
    earning_rules = Column(JSON, nullable=False)  # How customers earn rewards
    redemption_rules = Column(JSON, nullable=False)  # How customers redeem rewards
    tier_rules = Column(JSON, nullable=True)  # Tier progression rules
    expiration_rules = Column(JSON, nullable=True)  # Point/reward expiration
    
    # Program configuration
    points_per_dollar = Column(Numeric(4, 2), nullable=True)
    minimum_redemption_points = Column(Integer, nullable=True)
    maximum_redemption_points = Column(Integer, nullable=True)
    welcome_bonus_points = Column(Integer, nullable=True)
    referral_bonus_points = Column(Integer, nullable=True)
    
    # Program status
    is_active = Column(Boolean, default=True)
    launch_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    enrollment_open = Column(Boolean, default=True)
    
    # Performance metrics
    total_members = Column(Integer, default=0)
    active_members = Column(Integer, default=0)  # Members with activity in last 90 days
    total_points_issued = Column(Integer, default=0)
    total_points_redeemed = Column(Integer, default=0)
    total_rewards_redeemed = Column(Integer, default=0)
    
    # Financial impact
    total_revenue_from_members = Column(Numeric(12, 2), default=0)
    average_member_spend = Column(Numeric(10, 2), nullable=True)
    member_vs_non_member_aov = Column(Numeric(5, 2), nullable=True)  # Percentage difference
    program_cost = Column(Numeric(12, 2), default=0)
    program_roi = Column(Numeric(8, 2), nullable=True)
    
    # Engagement metrics
    enrollment_rate = Column(Numeric(5, 2), nullable=True)  # Percentage of customers who join
    redemption_rate = Column(Numeric(5, 2), nullable=True)  # Percentage of points redeemed
    member_retention_rate = Column(Numeric(5, 2), nullable=True)
    average_time_to_first_redemption = Column(Integer, nullable=True)  # Days
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="loyalty_programs")
    loyalty_transactions = relationship("LoyaltyTransaction", back_populates="program")
    created_by_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_loyalty_programs_restaurant', 'restaurant_id'),
        Index('idx_loyalty_programs_active', 'is_active'),
        Index('idx_loyalty_programs_type', 'program_type'),
        Index('idx_loyalty_programs_launch', 'launch_date'),
    )


class LoyaltyTransaction(Base):
    """Track individual loyalty program transactions"""
    __tablename__ = "loyalty_transactions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    program_id = Column(String(36), ForeignKey("loyalty_programs.id"), nullable=False)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    customer_id = Column(String(36), nullable=False)  # Can be anonymized
    
    # Transaction details
    transaction_type = Column(String(20), nullable=False)  # earn, redeem, expire, adjust
    transaction_date = Column(DateTime, nullable=False)
    order_id = Column(String(36), nullable=True)  # Related order if applicable
    
    # Points/rewards
    points_earned = Column(Integer, default=0)
    points_redeemed = Column(Integer, default=0)
    points_expired = Column(Integer, default=0)
    points_balance_after = Column(Integer, nullable=False)
    
    # Transaction context
    earning_reason = Column(String(255), nullable=True)  # purchase, bonus, referral
    redemption_reward = Column(String(255), nullable=True)  # free_item, discount, etc.
    order_amount = Column(Numeric(10, 2), nullable=True)
    discount_applied = Column(Numeric(8, 2), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    program = relationship("LoyaltyProgram", back_populates="loyalty_transactions")
    restaurant = relationship("Restaurant", back_populates="loyalty_transactions")
    
    # Indexes
    __table_args__ = (
        Index('idx_loyalty_transactions_program', 'program_id'),
        Index('idx_loyalty_transactions_customer', 'customer_id'),
        Index('idx_loyalty_transactions_restaurant', 'restaurant_id'),
        Index('idx_loyalty_transactions_date', 'transaction_date'),
        Index('idx_loyalty_transactions_type', 'transaction_type'),
    )
