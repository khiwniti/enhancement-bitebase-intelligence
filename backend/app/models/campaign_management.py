"""
Campaign Management Models

This module contains SQLAlchemy models for campaign management functionality.
"""

from sqlalchemy import Column, String, Text, DateTime, Numeric, Integer, Boolean, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from app.core.database import Base


class CampaignType(enum.Enum):
    PROMOTION = "promotion"
    LOYALTY = "loyalty"
    SEASONAL = "seasonal"
    PRODUCT_LAUNCH = "product_launch"
    RETENTION = "retention"
    ACQUISITION = "acquisition"


class CampaignStatus(enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class CampaignChannel(enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    SOCIAL_MEDIA = "social_media"
    GOOGLE_ADS = "google_ads"
    FACEBOOK_ADS = "facebook_ads"
    INSTAGRAM = "instagram"
    IN_STORE = "in_store"
    WEBSITE = "website"
    PUSH_NOTIFICATION = "push_notification"


class ABTestStatus(enum.Enum):
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=False)
    
    # Basic Information
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(SQLEnum(CampaignType), nullable=False)
    status = Column(SQLEnum(CampaignStatus), default=CampaignStatus.DRAFT)
    
    # Scheduling
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Budget and Performance
    budget = Column(Numeric(10, 2), default=0.00)
    spent = Column(Numeric(10, 2), default=0.00)
    target_audience_size = Column(Integer, default=0)
    
    # Targeting
    target_demographics = Column(JSON)  # Age, gender, location, etc.
    target_behaviors = Column(JSON)     # Purchase history, preferences, etc.
    
    # Content
    content = Column(JSON)  # Campaign content for different channels
    creative_assets = Column(JSON)  # Images, videos, etc.
    
    # Settings
    channels = Column(JSON)  # List of channels to use
    frequency_cap = Column(Integer, default=1)  # Max times to show per user
    is_ab_test = Column(Boolean, default=False)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="campaigns")
    ab_tests = relationship("ABTest", back_populates="campaign", cascade="all, delete-orphan")
    campaign_metrics = relationship("CampaignMetrics", back_populates="campaign", cascade="all, delete-orphan")
    campaign_audiences = relationship("CampaignAudience", back_populates="campaign", cascade="all, delete-orphan")


class ABTest(Base):
    __tablename__ = "ab_tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False)
    
    # Test Information
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(SQLEnum(ABTestStatus), default=ABTestStatus.DRAFT)
    
    # Test Configuration
    traffic_split = Column(Numeric(5, 2), default=50.00)  # Percentage for variant A
    confidence_level = Column(Numeric(5, 2), default=95.00)
    minimum_sample_size = Column(Integer, default=100)
    
    # Variants
    variant_a_content = Column(JSON)  # Control variant
    variant_b_content = Column(JSON)  # Test variant
    
    # Results
    variant_a_conversions = Column(Integer, default=0)
    variant_b_conversions = Column(Integer, default=0)
    variant_a_impressions = Column(Integer, default=0)
    variant_b_impressions = Column(Integer, default=0)
    
    # Timing
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Statistical significance
    p_value = Column(Numeric(10, 8))
    is_significant = Column(Boolean, default=False)
    winning_variant = Column(String(1))  # 'A' or 'B'
    
    # Relationships
    campaign = relationship("Campaign", back_populates="ab_tests")


class CampaignMetrics(Base):
    __tablename__ = "campaign_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False)
    
    # Date tracking
    date = Column(DateTime, nullable=False)
    
    # Engagement Metrics
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    opens = Column(Integer, default=0)  # For email campaigns
    views = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    
    # Conversion Metrics
    conversions = Column(Integer, default=0)
    revenue = Column(Numeric(10, 2), default=0.00)
    orders = Column(Integer, default=0)
    new_customers = Column(Integer, default=0)
    returning_customers = Column(Integer, default=0)
    
    # Cost Metrics
    cost = Column(Numeric(10, 2), default=0.00)
    cpc = Column(Numeric(10, 4), default=0.0000)  # Cost per click
    cpm = Column(Numeric(10, 4), default=0.0000)  # Cost per mille
    cpa = Column(Numeric(10, 2), default=0.00)    # Cost per acquisition
    
    # Calculated Metrics
    ctr = Column(Numeric(5, 4), default=0.0000)   # Click-through rate
    conversion_rate = Column(Numeric(5, 4), default=0.0000)
    roi = Column(Numeric(10, 2), default=0.00)    # Return on investment
    roas = Column(Numeric(10, 2), default=0.00)   # Return on ad spend
    
    # Channel specific
    channel = Column(SQLEnum(CampaignChannel))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    campaign = relationship("Campaign", back_populates="campaign_metrics")


class CampaignAudience(Base):
    __tablename__ = "campaign_audiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False)
    
    # Audience Information
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Audience Criteria
    criteria = Column(JSON)  # Complex audience targeting criteria
    estimated_size = Column(Integer, default=0)
    actual_size = Column(Integer, default=0)
    
    # Performance
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    revenue = Column(Numeric(10, 2), default=0.00)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    campaign = relationship("Campaign", back_populates="campaign_audiences")


class CampaignTemplate(Base):
    __tablename__ = "campaign_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=False)
    
    # Template Information
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))  # e.g., "seasonal", "promotion", "loyalty"
    
    # Template Content
    template_data = Column(JSON)  # Complete campaign template structure
    
    # Usage
    usage_count = Column(Integer, default=0)
    is_public = Column(Boolean, default=False)  # Can be shared across restaurants
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("Restaurant")
