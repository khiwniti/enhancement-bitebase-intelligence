"""
BiteBase Intelligence Analytics Schemas
Pydantic schemas for analytics and real-time data
"""

from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from uuid import UUID
from pydantic import BaseModel, Field, validator

class RealtimeMetricResponse(BaseModel):
    """Response schema for real-time metrics"""
    id: str
    metric_type: str
    value: Union[str, int, float, Dict, List]
    restaurant_id: str
    timestamp: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        from_attributes = True

class RealtimeSubscriptionRequest(BaseModel):
    """Request schema for subscribing to real-time analytics"""
    restaurant_ids: List[UUID]
    metric_types: Optional[List[str]] = None

    @validator('restaurant_ids')
    def validate_restaurant_ids(cls, v):
        if not v:
            raise ValueError('At least one restaurant ID is required')
        return v

class RealtimeAnalyticsStatus(BaseModel):
    """Status schema for real-time analytics system"""
    is_running: bool
    active_connections: int
    active_subscriptions: int
    redis_available: bool
    cache_size: int
    timestamp: datetime

class AnalyticsEventCreate(BaseModel):
    """Schema for creating analytics events"""
    event_type: str = Field(..., description="Type of analytics event")
    restaurant_id: UUID = Field(..., description="Restaurant ID")
    user_id: Optional[UUID] = Field(None, description="User ID if applicable")
    event_data: Dict[str, Any] = Field(default_factory=dict, description="Event data")
    session_id: Optional[str] = Field(None, description="Session ID")
    ip_address: Optional[str] = Field(None, description="IP address")
    user_agent: Optional[str] = Field(None, description="User agent")

class AnalyticsEventResponse(BaseModel):
    """Response schema for analytics events"""
    id: UUID
    event_type: str
    restaurant_id: UUID
    user_id: Optional[UUID]
    event_data: Dict[str, Any]
    session_id: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class AnalyticsQuery(BaseModel):
    """Schema for analytics queries"""
    restaurant_id: UUID
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    event_types: Optional[List[str]] = None
    user_id: Optional[UUID] = None
    limit: int = Field(default=100, ge=1, le=1000)
    offset: int = Field(default=0, ge=0)

class AnalyticsMetric(BaseModel):
    """Schema for analytics metrics"""
    name: str
    value: Union[int, float, str]
    unit: Optional[str] = None
    description: Optional[str] = None
    timestamp: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AnalyticsSummary(BaseModel):
    """Schema for analytics summary"""
    restaurant_id: UUID
    period_start: datetime
    period_end: datetime
    total_events: int
    unique_users: int
    top_events: List[Dict[str, Any]]
    metrics: List[AnalyticsMetric]

class RevenueMetric(BaseModel):
    """Schema for revenue metrics"""
    total_revenue: float
    average_order_value: float
    order_count: int
    revenue_per_hour: float
    peak_hour: Optional[int] = None
    growth_rate: Optional[float] = None

class CustomerMetric(BaseModel):
    """Schema for customer metrics"""
    total_customers: int
    new_customers: int
    returning_customers: int
    customer_retention_rate: float
    average_session_duration: Optional[float] = None
    bounce_rate: Optional[float] = None

class MenuMetric(BaseModel):
    """Schema for menu performance metrics"""
    item_name: str
    item_id: UUID
    orders_count: int
    revenue: float
    profit_margin: Optional[float] = None
    popularity_score: float
    category: Optional[str] = None

class LocationMetric(BaseModel):
    """Schema for location-based metrics"""
    location_name: str
    customer_count: int
    revenue: float
    average_order_value: float
    peak_hours: List[int]
    delivery_radius: Optional[float] = None

class PerformanceMetric(BaseModel):
    """Schema for performance metrics"""
    metric_name: str
    current_value: float
    target_value: Optional[float] = None
    unit: str
    status: str = Field(..., pattern="^(good|warning|critical)$")
    trend: Optional[str] = Field(None, pattern="^(up|down|stable)$")

class DashboardMetrics(BaseModel):
    """Schema for dashboard metrics collection"""
    restaurant_id: UUID
    timestamp: datetime
    revenue: RevenueMetric
    customers: CustomerMetric
    top_menu_items: List[MenuMetric]
    locations: List[LocationMetric]
    performance: List[PerformanceMetric]
    real_time_data: Dict[str, Any] = Field(default_factory=dict)

class AlertRule(BaseModel):
    """Schema for analytics alert rules"""
    name: str
    description: Optional[str] = None
    metric_type: str
    condition: str = Field(..., pattern="^(greater_than|less_than|equals|not_equals)$")
    threshold: float
    is_active: bool = True
    notification_channels: List[str] = Field(default_factory=list)

class AlertRuleCreate(AlertRule):
    """Schema for creating alert rules"""
    restaurant_id: UUID

class AlertRuleResponse(AlertRule):
    """Response schema for alert rules"""
    id: UUID
    restaurant_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AnalyticsAlert(BaseModel):
    """Schema for analytics alerts"""
    id: UUID
    rule_id: UUID
    restaurant_id: UUID
    metric_type: str
    current_value: float
    threshold: float
    condition: str
    message: str
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    is_acknowledged: bool = False
    created_at: datetime
    acknowledged_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WebSocketMessage(BaseModel):
    """Base schema for WebSocket messages"""
    type: str
    timestamp: datetime
    data: Dict[str, Any] = Field(default_factory=dict)

class RealtimeUpdate(WebSocketMessage):
    """Schema for real-time updates"""
    restaurant_id: str
    metric_type: str
    value: Any
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ConnectionStatus(BaseModel):
    """Schema for connection status"""
    user_id: str
    is_connected: bool
    connection_time: datetime
    last_activity: datetime
    subscribed_restaurants: List[str] = Field(default_factory=list)

class AnalyticsExport(BaseModel):
    """Schema for analytics data export"""
    restaurant_id: UUID
    export_type: str = Field(..., pattern="^(csv|json|excel)$")
    start_date: datetime
    end_date: datetime
    include_metrics: List[str] = Field(default_factory=list)
    filters: Dict[str, Any] = Field(default_factory=dict)

class AnalyticsExportResponse(BaseModel):
    """Response schema for analytics export"""
    export_id: UUID
    status: str = Field(..., pattern="^(pending|processing|completed|failed)$")
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
