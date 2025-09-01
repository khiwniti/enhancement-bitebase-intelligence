"""
BiteBase Intelligence Insights Schemas
Pydantic models for insights API request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
import uuid


class InsightTypeEnum(str, Enum):
    """Types of insights that can be generated"""
    REVENUE_ANOMALY = "revenue_anomaly"
    CUSTOMER_PATTERN_CHANGE = "customer_pattern_change"
    MENU_PERFORMANCE = "menu_performance"
    SEASONAL_TREND = "seasonal_trend"
    LOCATION_COMPARISON = "location_comparison"
    OPERATIONAL_INSIGHT = "operational_insight"


class InsightSeverityEnum(str, Enum):
    """Severity levels for insights"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class InsightStatusEnum(str, Enum):
    """Status of insights"""
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class AnomalyTypeEnum(str, Enum):
    """Types of anomalies detected"""
    STATISTICAL_OUTLIER = "statistical_outlier"
    TREND_DEVIATION = "trend_deviation"
    SEASONAL_ANOMALY = "seasonal_anomaly"
    CORRELATION_BREAK = "correlation_break"


# Base schemas
class InsightBase(BaseModel):
    """Base insight data"""
    title: str = Field(..., min_length=1, max_length=255, description="Insight title")
    description: str = Field(..., min_length=1, description="Detailed insight description")
    insight_type: InsightTypeEnum = Field(..., description="Type of insight")
    severity: InsightSeverityEnum = Field(..., description="Severity level")
    restaurant_id: Optional[uuid.UUID] = Field(None, description="Associated restaurant ID")
    
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0-1)")
    impact_score: float = Field(..., ge=0.0, le=1.0, description="Impact score (0-1)")
    urgency_score: float = Field(..., ge=0.0, le=1.0, description="Urgency score (0-1)")
    
    data_points: Dict[str, Any] = Field(..., description="Raw data that triggered the insight")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context information")
    explanation: str = Field(..., min_length=1, description="Natural language explanation")
    recommendations: Optional[List[str]] = Field(None, description="Recommended actions")
    
    data_period_start: Optional[datetime] = Field(None, description="Start of data period")
    data_period_end: Optional[datetime] = Field(None, description="End of data period")


class InsightCreate(InsightBase):
    """Schema for creating new insights"""
    algorithm_metadata: Optional[Dict[str, Any]] = Field(None, description="Algorithm-specific metadata")


class InsightUpdate(BaseModel):
    """Schema for updating insights"""
    status: Optional[InsightStatusEnum] = Field(None, description="New status")
    acknowledged_by: Optional[uuid.UUID] = Field(None, description="User who acknowledged")
    resolved_by: Optional[uuid.UUID] = Field(None, description="User who resolved")
    user_rating: Optional[int] = Field(None, ge=1, le=5, description="User rating (1-5)")
    user_feedback: Optional[str] = Field(None, max_length=2000, description="User feedback")
    false_positive: Optional[bool] = Field(None, description="Mark as false positive")


class InsightResponse(InsightBase):
    """Schema for insight API responses"""
    id: uuid.UUID = Field(..., description="Insight unique identifier")
    status: InsightStatusEnum = Field(..., description="Current status")
    
    # Interaction metrics
    views_count: int = Field(0, ge=0, description="Number of views")
    acknowledged_at: Optional[datetime] = Field(None, description="When acknowledged")
    acknowledged_by: Optional[uuid.UUID] = Field(None, description="Who acknowledged")
    resolved_at: Optional[datetime] = Field(None, description="When resolved")
    resolved_by: Optional[uuid.UUID] = Field(None, description="Who resolved")
    
    # User feedback
    user_rating: Optional[int] = Field(None, ge=1, le=5, description="User rating")
    user_feedback: Optional[str] = Field(None, description="User feedback text")
    false_positive: bool = Field(False, description="Marked as false positive")
    
    # Timestamps
    detected_at: datetime = Field(..., description="When insight was detected")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Related data
    anomalies: Optional[List["AnomalyResponse"]] = Field(None, description="Associated anomalies")
    
    class Config:
        from_attributes = True


class AnomalyBase(BaseModel):
    """Base anomaly data"""
    anomaly_type: AnomalyTypeEnum = Field(..., description="Type of anomaly")
    metric_name: str = Field(..., min_length=1, max_length=100, description="Metric name")
    metric_value: float = Field(..., description="Actual metric value")
    expected_value: Optional[float] = Field(None, description="Expected metric value")
    deviation_score: float = Field(..., description="Deviation from normal")
    
    z_score: Optional[float] = Field(None, description="Z-score if applicable")
    isolation_score: Optional[float] = Field(None, description="Isolation forest score")
    statistical_significance: Optional[float] = Field(None, description="Statistical significance")
    
    data_timestamp: datetime = Field(..., description="Timestamp of anomalous data")
    detection_algorithm: str = Field(..., min_length=1, max_length=50, description="Detection algorithm used")
    
    contributing_factors: Optional[Dict[str, Any]] = Field(None, description="Contributing factors")
    related_metrics: Optional[Dict[str, Any]] = Field(None, description="Related metrics")


class AnomalyCreate(AnomalyBase):
    """Schema for creating anomalies"""
    insight_id: uuid.UUID = Field(..., description="Associated insight ID")
    restaurant_id: Optional[uuid.UUID] = Field(None, description="Associated restaurant ID")
    algorithm_params: Optional[Dict[str, Any]] = Field(None, description="Algorithm parameters")


class AnomalyResponse(AnomalyBase):
    """Schema for anomaly API responses"""
    id: uuid.UUID = Field(..., description="Anomaly unique identifier")
    insight_id: uuid.UUID = Field(..., description="Associated insight ID")
    restaurant_id: Optional[uuid.UUID] = Field(None, description="Associated restaurant ID")
    
    detected_at: datetime = Field(..., description="When anomaly was detected")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True


class InsightPatternBase(BaseModel):
    """Base insight pattern data"""
    pattern_name: str = Field(..., min_length=1, max_length=255, description="Pattern name")
    pattern_type: str = Field(..., min_length=1, max_length=50, description="Pattern type")
    description: str = Field(..., min_length=1, description="Pattern description")
    
    conditions: Dict[str, Any] = Field(..., description="Pattern conditions")
    thresholds: Dict[str, Any] = Field(..., description="Threshold values")
    
    confidence_threshold: float = Field(0.7, ge=0.0, le=1.0, description="Confidence threshold")
    is_active: bool = Field(True, description="Whether pattern is active")


class InsightPatternCreate(InsightPatternBase):
    """Schema for creating insight patterns"""
    training_data: Optional[Dict[str, Any]] = Field(None, description="Training data")


class InsightPatternResponse(InsightPatternBase):
    """Schema for insight pattern responses"""
    id: uuid.UUID = Field(..., description="Pattern unique identifier")
    
    # Performance metrics
    accuracy_score: float = Field(0.0, ge=0.0, le=1.0, description="Accuracy score")
    precision_score: float = Field(0.0, ge=0.0, le=1.0, description="Precision score")
    recall_score: float = Field(0.0, ge=0.0, le=1.0, description="Recall score")
    false_positive_rate: float = Field(0.0, ge=0.0, le=1.0, description="False positive rate")
    
    # Usage statistics
    times_triggered: int = Field(0, ge=0, description="Times pattern was triggered")
    times_confirmed: int = Field(0, ge=0, description="Times pattern was confirmed")
    times_dismissed: int = Field(0, ge=0, description="Times pattern was dismissed")
    
    last_updated: datetime = Field(..., description="Last update timestamp")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last modification timestamp")
    
    class Config:
        from_attributes = True


class InsightFeedbackBase(BaseModel):
    """Base insight feedback data"""
    rating: int = Field(..., ge=1, le=5, description="Overall rating (1-5)")
    feedback_text: Optional[str] = Field(None, max_length=2000, description="Feedback text")
    
    accuracy_rating: Optional[int] = Field(None, ge=1, le=5, description="Accuracy rating")
    usefulness_rating: Optional[int] = Field(None, ge=1, le=5, description="Usefulness rating")
    timeliness_rating: Optional[int] = Field(None, ge=1, le=5, description="Timeliness rating")
    
    action_taken: Optional[str] = Field(None, max_length=100, description="Action taken")
    action_result: Optional[str] = Field(None, max_length=1000, description="Result of action")
    
    is_false_positive: bool = Field(False, description="Mark as false positive")
    is_duplicate: bool = Field(False, description="Mark as duplicate")
    suggested_improvements: Optional[List[str]] = Field(None, description="Suggested improvements")


class InsightFeedbackCreate(InsightFeedbackBase):
    """Schema for creating insight feedback"""
    insight_id: uuid.UUID = Field(..., description="Associated insight ID")
    user_id: uuid.UUID = Field(..., description="User providing feedback")


class InsightFeedbackResponse(InsightFeedbackBase):
    """Schema for insight feedback responses"""
    id: uuid.UUID = Field(..., description="Feedback unique identifier")
    insight_id: uuid.UUID = Field(..., description="Associated insight ID")
    user_id: uuid.UUID = Field(..., description="User who provided feedback")
    
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True


class InsightSearchParams(BaseModel):
    """Parameters for insight search and filtering"""
    insight_type: Optional[InsightTypeEnum] = Field(None, description="Filter by insight type")
    severity: Optional[InsightSeverityEnum] = Field(None, description="Filter by severity")
    status: Optional[InsightStatusEnum] = Field(None, description="Filter by status")
    restaurant_id: Optional[uuid.UUID] = Field(None, description="Filter by restaurant")
    
    min_confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Minimum confidence score")
    min_impact: Optional[float] = Field(None, ge=0.0, le=1.0, description="Minimum impact score")
    
    date_from: Optional[datetime] = Field(None, description="Filter from date")
    date_to: Optional[datetime] = Field(None, description="Filter to date")
    
    # Pagination
    skip: int = Field(0, ge=0, description="Number of records to skip")
    limit: int = Field(50, ge=1, le=500, description="Maximum number of results")
    
    # Sorting
    sort_by: Optional[str] = Field("detected_at", description="Sort field")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$", description="Sort order")


class InsightListResponse(BaseModel):
    """Response schema for insight list endpoints"""
    insights: List[InsightResponse] = Field(..., description="List of insights")
    total: int = Field(..., ge=0, description="Total number of matching insights")
    skip: int = Field(..., ge=0, description="Number of records skipped")
    limit: int = Field(..., ge=1, description="Maximum number of results requested")
    has_more: bool = Field(..., description="Whether more results are available")
    
    @validator('has_more', always=True)
    def calculate_has_more(cls, v, values):
        if 'total' in values and 'skip' in values and 'limit' in values:
            return values['skip'] + values['limit'] < values['total']
        return False


class InsightMetricsResponse(BaseModel):
    """Response schema for insight metrics"""
    date: datetime = Field(..., description="Metrics date")
    period_type: str = Field(..., description="Period type (hourly, daily, weekly)")
    
    # Generation metrics
    insights_generated: int = Field(0, ge=0, description="Total insights generated")
    insights_by_type: Dict[str, int] = Field({}, description="Insights by type")
    insights_by_severity: Dict[str, int] = Field({}, description="Insights by severity")
    
    # Performance metrics
    avg_processing_time_ms: Optional[float] = Field(None, description="Average processing time")
    avg_confidence_score: Optional[float] = Field(None, description="Average confidence score")
    false_positive_rate: Optional[float] = Field(None, description="False positive rate")
    
    # User engagement
    insights_viewed: int = Field(0, ge=0, description="Insights viewed")
    insights_acknowledged: int = Field(0, ge=0, description="Insights acknowledged")
    insights_resolved: int = Field(0, ge=0, description="Insights resolved")
    insights_dismissed: int = Field(0, ge=0, description="Insights dismissed")
    
    # Feedback metrics
    avg_user_rating: Optional[float] = Field(None, description="Average user rating")
    total_feedback_count: int = Field(0, ge=0, description="Total feedback received")
    
    # System metrics
    data_points_processed: int = Field(0, ge=0, description="Data points processed")
    anomalies_detected: int = Field(0, ge=0, description="Anomalies detected")
    notifications_sent: int = Field(0, ge=0, description="Notifications sent")


class RealtimeInsightUpdate(BaseModel):
    """Schema for real-time insight updates via WebSocket"""
    event_type: str = Field(..., description="Type of update event")
    insight: Optional[InsightResponse] = Field(None, description="Updated insight data")
    anomaly: Optional[AnomalyResponse] = Field(None, description="New anomaly data")
    metrics: Optional[InsightMetricsResponse] = Field(None, description="Updated metrics")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Update timestamp")


class InsightGenerationRequest(BaseModel):
    """Request schema for manual insight generation"""
    restaurant_ids: Optional[List[uuid.UUID]] = Field(None, description="Specific restaurants to analyze")
    insight_types: Optional[List[InsightTypeEnum]] = Field(None, description="Types of insights to generate")
    date_range: Optional[Dict[str, datetime]] = Field(None, description="Date range for analysis")
    force_regenerate: bool = Field(False, description="Force regeneration of existing insights")


class InsightGenerationResponse(BaseModel):
    """Response schema for insight generation"""
    job_id: uuid.UUID = Field(..., description="Generation job ID")
    status: str = Field(..., description="Job status")
    insights_generated: int = Field(0, ge=0, description="Number of insights generated")
    processing_time_ms: int = Field(..., ge=0, description="Processing time in milliseconds")
    errors: List[str] = Field([], description="Any errors encountered")


# Update forward references
InsightResponse.model_rebuild()