"""
BiteBase Intelligence Widget Schemas
Pydantic models for widget API request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import uuid


# Widget Template Schemas
class WidgetTemplateBase(BaseModel):
    """Base widget template data"""
    name: str = Field(..., min_length=1, max_length=255, description="Template name")
    description: Optional[str] = Field(None, max_length=1000, description="Template description")
    widget_type: str = Field(..., pattern="^(chart|text|image|metric|table|custom)$", description="Widget type")
    chart_type: Optional[str] = Field(None, description="Chart type if widget_type is chart")
    category: str = Field(..., pattern="^(basic|advanced|custom)$", description="Template category")
    tags: Optional[List[str]] = Field(None, description="Template tags")
    performance_weight: float = Field(1.0, ge=0.1, le=10.0, description="Performance impact score")
    is_advanced: bool = Field(False, description="Requires advanced features")


class WidgetTemplateCreate(WidgetTemplateBase):
    """Schema for creating widget templates"""
    default_config: Dict[str, Any] = Field(..., description="Default widget configuration")
    default_position: Dict[str, int] = Field(..., description="Default position and size")
    preview_image: Optional[str] = Field(None, max_length=500, description="Preview image URL")
    created_by: uuid.UUID = Field(..., description="Template creator ID")


class WidgetTemplateUpdate(BaseModel):
    """Schema for updating widget templates"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    default_config: Optional[Dict[str, Any]] = None
    default_position: Optional[Dict[str, int]] = None
    preview_image: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, pattern="^(basic|advanced|custom)$")
    tags: Optional[List[str]] = None
    performance_weight: Optional[float] = Field(None, ge=0.1, le=10.0)
    is_advanced: Optional[bool] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class WidgetTemplateResponse(WidgetTemplateBase):
    """Schema for widget template responses"""
    id: uuid.UUID = Field(..., description="Template unique identifier")
    default_config: Dict[str, Any] = Field(..., description="Default widget configuration")
    default_position: Dict[str, int] = Field(..., description="Default position and size")
    preview_image: Optional[str] = Field(None, description="Preview image URL")
    usage_count: int = Field(0, description="Number of times used")
    rating: Optional[float] = Field(None, ge=0, le=5, description="Average rating")
    is_active: bool = Field(..., description="Template active status")
    is_featured: bool = Field(..., description="Featured template status")
    created_by: uuid.UUID = Field(..., description="Template creator ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True


# Widget Data Source Schemas
class DataSourceConnectionConfig(BaseModel):
    """Data source connection configuration"""
    url: Optional[str] = Field(None, description="API endpoint or database URL")
    method: Optional[str] = Field("GET", pattern="^(GET|POST|PUT|DELETE)$", description="HTTP method")
    headers: Optional[Dict[str, str]] = Field(None, description="Request headers")
    auth_type: Optional[str] = Field(None, pattern="^(none|basic|bearer|api_key)$", description="Authentication type")
    auth_config: Optional[Dict[str, str]] = Field(None, description="Authentication configuration")
    timeout: Optional[int] = Field(30, ge=1, le=300, description="Request timeout in seconds")


class DataSourceQueryConfig(BaseModel):
    """Data source query configuration"""
    query: Optional[str] = Field(None, description="SQL query or API parameters")
    filters: Optional[Dict[str, Any]] = Field(None, description="Data filters")
    aggregations: Optional[Dict[str, str]] = Field(None, description="Data aggregations")
    sorting: Optional[Dict[str, str]] = Field(None, description="Data sorting")
    pagination: Optional[Dict[str, int]] = Field(None, description="Pagination settings")


class WidgetDataSourceBase(BaseModel):
    """Base widget data source data"""
    name: str = Field(..., min_length=1, max_length=255, description="Data source name")
    description: Optional[str] = Field(None, max_length=1000, description="Data source description")
    source_type: str = Field(..., pattern="^(api|database|file|static)$", description="Data source type")
    refresh_interval: Optional[int] = Field(None, ge=5, le=86400, description="Refresh interval in seconds")
    cache_duration: Optional[int] = Field(None, ge=60, le=86400, description="Cache duration in seconds")


class WidgetDataSourceCreate(WidgetDataSourceBase):
    """Schema for creating widget data sources"""
    connection_config: DataSourceConnectionConfig = Field(..., description="Connection configuration")
    query_config: Optional[DataSourceQueryConfig] = Field(None, description="Query configuration")
    schema_config: Optional[Dict[str, Any]] = Field(None, description="Expected data schema")
    sample_data: Optional[Dict[str, Any]] = Field(None, description="Sample data for preview")
    created_by: uuid.UUID = Field(..., description="Data source creator ID")


class WidgetDataSourceUpdate(BaseModel):
    """Schema for updating widget data sources"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    connection_config: Optional[DataSourceConnectionConfig] = None
    query_config: Optional[DataSourceQueryConfig] = None
    schema_config: Optional[Dict[str, Any]] = None
    sample_data: Optional[Dict[str, Any]] = None
    refresh_interval: Optional[int] = Field(None, ge=5, le=86400)
    cache_duration: Optional[int] = Field(None, ge=60, le=86400)
    is_active: Optional[bool] = None


class WidgetDataSourceResponse(WidgetDataSourceBase):
    """Schema for widget data source responses"""
    id: uuid.UUID = Field(..., description="Data source unique identifier")
    connection_config: DataSourceConnectionConfig = Field(..., description="Connection configuration")
    query_config: Optional[DataSourceQueryConfig] = Field(None, description="Query configuration")
    schema_config: Optional[Dict[str, Any]] = Field(None, description="Expected data schema")
    sample_data: Optional[Dict[str, Any]] = Field(None, description="Sample data for preview")
    is_active: bool = Field(..., description="Data source active status")
    last_health_check: Optional[datetime] = Field(None, description="Last health check timestamp")
    health_status: str = Field(..., description="Health status")
    error_message: Optional[str] = Field(None, description="Error message if unhealthy")
    usage_count: int = Field(0, description="Number of times used")
    last_used_at: Optional[datetime] = Field(None, description="Last used timestamp")
    created_by: uuid.UUID = Field(..., description="Data source creator ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True


# Widget Interaction Schemas
class WidgetInteractionCreate(BaseModel):
    """Schema for creating widget interactions"""
    widget_id: uuid.UUID = Field(..., description="Widget ID")
    dashboard_id: uuid.UUID = Field(..., description="Dashboard ID")
    interaction_type: str = Field(..., pattern="^(click|hover|resize|move|configure)$", description="Interaction type")
    interaction_data: Optional[Dict[str, Any]] = Field(None, description="Additional interaction data")
    user_id: Optional[uuid.UUID] = Field(None, description="User ID")
    session_id: Optional[uuid.UUID] = Field(None, description="Session ID")
    user_agent: Optional[str] = Field(None, max_length=500, description="User agent string")
    ip_address: Optional[str] = Field(None, max_length=45, description="IP address")
    response_time: Optional[float] = Field(None, ge=0, description="Response time in milliseconds")
    error_occurred: bool = Field(False, description="Whether an error occurred")
    error_message: Optional[str] = Field(None, description="Error message if applicable")


class WidgetInteractionResponse(BaseModel):
    """Schema for widget interaction responses"""
    id: uuid.UUID = Field(..., description="Interaction unique identifier")
    widget_id: uuid.UUID = Field(..., description="Widget ID")
    dashboard_id: uuid.UUID = Field(..., description="Dashboard ID")
    interaction_type: str = Field(..., description="Interaction type")
    interaction_data: Optional[Dict[str, Any]] = Field(None, description="Additional interaction data")
    user_id: Optional[uuid.UUID] = Field(None, description="User ID")
    session_id: Optional[uuid.UUID] = Field(None, description="Session ID")
    response_time: Optional[float] = Field(None, description="Response time in milliseconds")
    error_occurred: bool = Field(..., description="Whether an error occurred")
    error_message: Optional[str] = Field(None, description="Error message if applicable")
    created_at: datetime = Field(..., description="Interaction timestamp")
    
    class Config:
        from_attributes = True


# Widget Cache Schemas
class WidgetCacheResponse(BaseModel):
    """Schema for widget cache responses"""
    id: uuid.UUID = Field(..., description="Cache entry unique identifier")
    widget_id: uuid.UUID = Field(..., description="Widget ID")
    cache_key: str = Field(..., description="Cache key")
    data_size: Optional[int] = Field(None, description="Data size in bytes")
    cache_version: Optional[str] = Field(None, description="Cache version")
    compression_type: Optional[str] = Field(None, description="Compression type")
    expires_at: datetime = Field(..., description="Cache expiration timestamp")
    last_accessed_at: Optional[datetime] = Field(None, description="Last access timestamp")
    access_count: int = Field(0, description="Number of times accessed")
    generation_time: Optional[float] = Field(None, description="Time to generate cache")
    hit_count: int = Field(0, description="Cache hit count")
    miss_count: int = Field(0, description="Cache miss count")
    created_at: datetime = Field(..., description="Cache creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True


# Widget Alert Schemas
class AlertConditionConfig(BaseModel):
    """Alert condition configuration"""
    metric: str = Field(..., description="Metric to monitor")
    operator: str = Field(..., pattern="^(gt|gte|lt|lte|eq|neq)$", description="Comparison operator")
    threshold: float = Field(..., description="Threshold value")
    duration: Optional[int] = Field(None, ge=60, description="Duration in seconds before triggering")


class NotificationConfig(BaseModel):
    """Notification configuration"""
    email: Optional[bool] = Field(False, description="Send email notifications")
    sms: Optional[bool] = Field(False, description="Send SMS notifications")
    webhook: Optional[str] = Field(None, description="Webhook URL for notifications")
    in_app: bool = Field(True, description="Show in-app notifications")


class WidgetAlertBase(BaseModel):
    """Base widget alert data"""
    alert_name: str = Field(..., min_length=1, max_length=255, description="Alert name")
    alert_type: str = Field(..., pattern="^(threshold|anomaly|data_quality)$", description="Alert type")
    is_active: bool = Field(True, description="Alert active status")


class WidgetAlertCreate(WidgetAlertBase):
    """Schema for creating widget alerts"""
    widget_id: uuid.UUID = Field(..., description="Widget ID")
    dashboard_id: uuid.UUID = Field(..., description="Dashboard ID")
    condition_config: AlertConditionConfig = Field(..., description="Alert conditions")
    notification_config: Optional[NotificationConfig] = Field(None, description="Notification settings")
    notification_channels: Optional[List[str]] = Field(None, description="Notification channels")
    created_by: uuid.UUID = Field(..., description="Alert creator ID")


class WidgetAlertUpdate(BaseModel):
    """Schema for updating widget alerts"""
    alert_name: Optional[str] = Field(None, min_length=1, max_length=255)
    condition_config: Optional[AlertConditionConfig] = None
    notification_config: Optional[NotificationConfig] = None
    notification_channels: Optional[List[str]] = None
    is_active: Optional[bool] = None


class WidgetAlertResponse(WidgetAlertBase):
    """Schema for widget alert responses"""
    id: uuid.UUID = Field(..., description="Alert unique identifier")
    widget_id: uuid.UUID = Field(..., description="Widget ID")
    dashboard_id: uuid.UUID = Field(..., description="Dashboard ID")
    condition_config: AlertConditionConfig = Field(..., description="Alert conditions")
    notification_config: Optional[NotificationConfig] = Field(None, description="Notification settings")
    notification_channels: Optional[List[str]] = Field(None, description="Notification channels")
    current_status: str = Field(..., description="Current alert status")
    last_triggered_at: Optional[datetime] = Field(None, description="Last trigger timestamp")
    trigger_count: int = Field(0, description="Number of times triggered")
    current_value: Optional[float] = Field(None, description="Current metric value")
    threshold_value: Optional[float] = Field(None, description="Threshold value")
    alert_message: Optional[str] = Field(None, description="Alert message")
    created_by: uuid.UUID = Field(..., description="Alert creator ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True


# Widget Comment Schemas
class WidgetCommentBase(BaseModel):
    """Base widget comment data"""
    comment_text: str = Field(..., min_length=1, max_length=5000, description="Comment text")
    comment_type: str = Field("comment", pattern="^(comment|annotation|suggestion)$", description="Comment type")
    position_x: Optional[float] = Field(None, description="X coordinate for annotation")
    position_y: Optional[float] = Field(None, description="Y coordinate for annotation")


class WidgetCommentCreate(WidgetCommentBase):
    """Schema for creating widget comments"""
    widget_id: uuid.UUID = Field(..., description="Widget ID")
    dashboard_id: uuid.UUID = Field(..., description="Dashboard ID")
    parent_comment_id: Optional[uuid.UUID] = Field(None, description="Parent comment ID for replies")
    author_id: uuid.UUID = Field(..., description="Comment author ID")
    author_name: str = Field(..., min_length=1, max_length=255, description="Comment author name")


class WidgetCommentUpdate(BaseModel):
    """Schema for updating widget comments"""
    comment_text: Optional[str] = Field(None, min_length=1, max_length=5000)
    is_resolved: Optional[bool] = None
    is_pinned: Optional[bool] = None


class WidgetCommentResponse(WidgetCommentBase):
    """Schema for widget comment responses"""
    id: uuid.UUID = Field(..., description="Comment unique identifier")
    widget_id: uuid.UUID = Field(..., description="Widget ID")
    dashboard_id: uuid.UUID = Field(..., description="Dashboard ID")
    parent_comment_id: Optional[uuid.UUID] = Field(None, description="Parent comment ID")
    thread_depth: int = Field(0, description="Thread depth level")
    is_resolved: bool = Field(False, description="Comment resolved status")
    is_pinned: bool = Field(False, description="Comment pinned status")
    author_id: uuid.UUID = Field(..., description="Comment author ID")
    author_name: str = Field(..., description="Comment author name")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    resolved_at: Optional[datetime] = Field(None, description="Resolution timestamp")
    replies: List['WidgetCommentResponse'] = Field([], description="Comment replies")
    
    class Config:
        from_attributes = True


# Update forward reference
WidgetCommentResponse.model_rebuild()


# List Response Schemas
class WidgetTemplateListResponse(BaseModel):
    """Response schema for widget template list endpoints"""
    templates: List[WidgetTemplateResponse] = Field(..., description="List of widget templates")
    total: int = Field(..., ge=0, description="Total number of matching templates")
    skip: int = Field(..., ge=0, description="Number of records skipped")
    limit: int = Field(..., ge=1, description="Maximum number of results requested")
    has_more: bool = Field(..., description="Whether more results are available")


class WidgetDataSourceListResponse(BaseModel):
    """Response schema for widget data source list endpoints"""
    data_sources: List[WidgetDataSourceResponse] = Field(..., description="List of data sources")
    total: int = Field(..., ge=0, description="Total number of matching data sources")
    skip: int = Field(..., ge=0, description="Number of records skipped")
    limit: int = Field(..., ge=1, description="Maximum number of results requested")
    has_more: bool = Field(..., description="Whether more results are available")


class WidgetInteractionListResponse(BaseModel):
    """Response schema for widget interaction list endpoints"""
    interactions: List[WidgetInteractionResponse] = Field(..., description="List of interactions")
    total: int = Field(..., ge=0, description="Total number of matching interactions")
    skip: int = Field(..., ge=0, description="Number of records skipped")
    limit: int = Field(..., ge=1, description="Maximum number of results requested")
    has_more: bool = Field(..., description="Whether more results are available")