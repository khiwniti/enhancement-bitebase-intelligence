"""
Campaign Management Schemas

Pydantic models for campaign management API requests and responses.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum


class CampaignTypeEnum(str, Enum):
    PROMOTION = "promotion"
    LOYALTY = "loyalty"
    SEASONAL = "seasonal"
    PRODUCT_LAUNCH = "product_launch"
    RETENTION = "retention"
    ACQUISITION = "acquisition"


class CampaignStatusEnum(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class CampaignChannelEnum(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    SOCIAL_MEDIA = "social_media"
    GOOGLE_ADS = "google_ads"
    FACEBOOK_ADS = "facebook_ads"
    INSTAGRAM = "instagram"
    IN_STORE = "in_store"
    WEBSITE = "website"
    PUSH_NOTIFICATION = "push_notification"


class ABTestStatusEnum(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# Campaign Schemas
class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    type: CampaignTypeEnum
    start_date: datetime
    end_date: datetime
    budget: Optional[float] = Field(default=0.00, ge=0)
    target_demographics: Optional[Dict[str, Any]] = {}
    target_behaviors: Optional[Dict[str, Any]] = {}
    content: Optional[Dict[str, Any]] = {}
    creative_assets: Optional[Dict[str, Any]] = {}
    channels: Optional[List[CampaignChannelEnum]] = []
    frequency_cap: Optional[int] = Field(default=1, ge=1)
    is_ab_test: Optional[bool] = False

    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class CampaignUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[CampaignStatusEnum] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[float] = Field(None, ge=0)
    target_demographics: Optional[Dict[str, Any]] = None
    target_behaviors: Optional[Dict[str, Any]] = None
    content: Optional[Dict[str, Any]] = None
    creative_assets: Optional[Dict[str, Any]] = None
    channels: Optional[List[CampaignChannelEnum]] = None
    frequency_cap: Optional[int] = Field(None, ge=1)


class ABTestCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    traffic_split: Optional[float] = Field(default=50.00, ge=0, le=100)
    confidence_level: Optional[float] = Field(default=95.00, ge=80, le=99.9)
    minimum_sample_size: Optional[int] = Field(default=100, ge=10)
    variant_a_content: Optional[Dict[str, Any]] = {}
    variant_b_content: Optional[Dict[str, Any]] = {}
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CampaignMetricsCreate(BaseModel):
    date: datetime
    impressions: Optional[int] = Field(default=0, ge=0)
    clicks: Optional[int] = Field(default=0, ge=0)
    opens: Optional[int] = Field(default=0, ge=0)
    views: Optional[int] = Field(default=0, ge=0)
    shares: Optional[int] = Field(default=0, ge=0)
    likes: Optional[int] = Field(default=0, ge=0)
    comments: Optional[int] = Field(default=0, ge=0)
    conversions: Optional[int] = Field(default=0, ge=0)
    revenue: Optional[float] = Field(default=0.00, ge=0)
    orders: Optional[int] = Field(default=0, ge=0)
    new_customers: Optional[int] = Field(default=0, ge=0)
    returning_customers: Optional[int] = Field(default=0, ge=0)
    cost: Optional[float] = Field(default=0.00, ge=0)
    channel: Optional[CampaignChannelEnum] = None


class CampaignAudienceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    criteria: Optional[Dict[str, Any]] = {}
    estimated_size: Optional[int] = Field(default=0, ge=0)


class CampaignTemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    template_data: Optional[Dict[str, Any]] = {}
    is_public: Optional[bool] = False


# Response Schemas
class ABTestResponse(BaseModel):
    id: str
    campaign_id: str
    name: str
    description: Optional[str]
    status: ABTestStatusEnum
    traffic_split: float
    confidence_level: float
    minimum_sample_size: int
    variant_a_content: Dict[str, Any]
    variant_b_content: Dict[str, Any]
    variant_a_conversions: int
    variant_b_conversions: int
    variant_a_impressions: int
    variant_b_impressions: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    p_value: Optional[float]
    is_significant: bool
    winning_variant: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CampaignMetricsResponse(BaseModel):
    id: str
    campaign_id: str
    date: datetime
    impressions: int
    clicks: int
    opens: int
    views: int
    shares: int
    likes: int
    comments: int
    conversions: int
    revenue: float
    orders: int
    new_customers: int
    returning_customers: int
    cost: float
    cpc: float
    cpm: float
    cpa: float
    ctr: float
    conversion_rate: float
    roi: float
    roas: float
    channel: Optional[CampaignChannelEnum]
    created_at: datetime

    class Config:
        from_attributes = True


class CampaignAudienceResponse(BaseModel):
    id: str
    campaign_id: str
    name: str
    description: Optional[str]
    criteria: Dict[str, Any]
    estimated_size: int
    actual_size: int
    impressions: int
    clicks: int
    conversions: int
    revenue: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CampaignResponse(BaseModel):
    id: str
    restaurant_id: str
    name: str
    description: Optional[str]
    type: CampaignTypeEnum
    status: CampaignStatusEnum
    start_date: datetime
    end_date: datetime
    budget: float
    spent: float
    target_audience_size: int
    target_demographics: Dict[str, Any]
    target_behaviors: Dict[str, Any]
    content: Dict[str, Any]
    creative_assets: Dict[str, Any]
    channels: List[str]
    frequency_cap: int
    is_ab_test: bool
    created_at: datetime
    updated_at: datetime
    ab_tests: List[ABTestResponse] = []
    campaign_metrics: List[CampaignMetricsResponse] = []
    campaign_audiences: List[CampaignAudienceResponse] = []

    class Config:
        from_attributes = True


class CampaignTemplateResponse(BaseModel):
    id: str
    restaurant_id: str
    name: str
    description: Optional[str]
    category: Optional[str]
    template_data: Dict[str, Any]
    usage_count: int
    is_public: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CampaignPerformanceResponse(BaseModel):
    total_impressions: int
    total_clicks: int
    total_conversions: int
    total_revenue: float
    total_cost: float
    average_ctr: float
    average_conversion_rate: float
    roi: float
    roas: float
    daily_metrics: List[Dict[str, Any]]


class CampaignListResponse(BaseModel):
    campaigns: List[CampaignResponse]
    total: int
    page: int
    per_page: int


# Query Parameters
class CampaignQueryParams(BaseModel):
    status: Optional[CampaignStatusEnum] = None
    type: Optional[CampaignTypeEnum] = None
    limit: Optional[int] = Field(default=50, ge=1, le=100)
    offset: Optional[int] = Field(default=0, ge=0)


class CampaignPerformanceQueryParams(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
