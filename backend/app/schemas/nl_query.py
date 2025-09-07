"""
BiteBase Intelligence Natural Language Query Schemas
Pydantic models for NL query API request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import uuid


# Core NL Query Schemas
class NLQueryRequest(BaseModel):
    """Natural language query request"""
    query: str = Field(..., min_length=3, max_length=1000, description="Natural language query")
    dashboard_id: Optional[uuid.UUID] = Field(None, description="Dashboard context ID")
    user_context: Optional[Dict[str, Any]] = Field(None, description="Additional user context")
    include_suggestions: bool = Field(True, description="Include query suggestions")
    auto_execute: bool = Field(False, description="Auto-execute if confidence is high")
    language: Optional[str] = Field("auto", description="Preferred response language (auto, th, en)")


class EntityExtraction(BaseModel):
    """Extracted entities from query"""
    entity_type: str = Field(..., description="Type of entity (time, location, metric, etc.)")
    entity_value: str = Field(..., description="Extracted value")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Extraction confidence")
    start_pos: int = Field(..., ge=0, description="Start position in query")
    end_pos: int = Field(..., ge=0, description="End position in query")


class QueryIntent(BaseModel):
    """Query intent classification"""
    intent_type: str = Field(..., description="Classified intent type")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Intent confidence")
    sub_intents: Optional[List[str]] = Field(None, description="Sub-intent classifications")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Intent parameters")


class ProcessedQuery(BaseModel):
    """Processed query with intent and entities"""
    original_query: str = Field(..., description="Original user query")
    normalized_query: str = Field(..., description="Normalized query text")
    intent: QueryIntent = Field(..., description="Query intent classification")
    entities: List[EntityExtraction] = Field(..., description="Extracted entities")
    context: Dict[str, Any] = Field(default_factory=dict, description="Query context")


class ConfidenceScore(BaseModel):
    """Confidence scoring breakdown"""
    overall_confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence score")
    intent_confidence: float = Field(..., ge=0.0, le=1.0, description="Intent classification confidence")
    entity_confidence: float = Field(..., ge=0.0, le=1.0, description="Entity extraction confidence")
    sql_confidence: float = Field(..., ge=0.0, le=1.0, description="SQL generation confidence")
    data_availability: float = Field(..., ge=0.0, le=1.0, description="Data availability score")
    historical_success: float = Field(..., ge=0.0, le=1.0, description="Historical success rate")


class ChartSuggestion(BaseModel):
    """Chart type suggestion"""
    chart_type: str = Field(..., description="Suggested chart type")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Suggestion confidence")
    reasoning: str = Field(..., description="Why this chart type was suggested")
    config: Dict[str, Any] = Field(default_factory=dict, description="Suggested chart configuration")


class QueryResult(BaseModel):
    """Query execution result"""
    data: List[Dict[str, Any]] = Field(..., description="Query result data")
    columns: List[str] = Field(..., description="Result column names")
    row_count: int = Field(..., ge=0, description="Number of rows returned")
    execution_time_ms: int = Field(..., ge=0, description="Query execution time")
    chart_suggestions: List[ChartSuggestion] = Field(..., description="Suggested chart types")


class NLQueryResponse(BaseModel):
    """Natural language query response"""
    query_id: uuid.UUID = Field(..., description="Unique query identifier")
    processed_query: ProcessedQuery = Field(..., description="Processed query information")
    generated_sql: str = Field(..., description="Generated SQL query")
    confidence: ConfidenceScore = Field(..., description="Confidence scoring")
    result: Optional[QueryResult] = Field(None, description="Query results if executed")
    suggestions: List[str] = Field(default_factory=list, description="Query improvement suggestions")
    errors: List[str] = Field(default_factory=list, description="Processing errors")
    processing_time_ms: int = Field(..., ge=0, description="Total processing time")
    success: bool = Field(..., description="Whether processing was successful")


class QuerySuggestionResponse(BaseModel):
    """Query suggestion response"""
    suggestions: List[str] = Field(..., description="Query suggestions")
    categories: Dict[str, List[str]] = Field(..., description="Suggestions by category")
    examples: List[str] = Field(..., description="Example queries")


class QueryFeedback(BaseModel):
    """User feedback on query results"""
    query_id: uuid.UUID = Field(..., description="Query identifier")
    rating: int = Field(..., ge=1, le=5, description="User rating (1-5)")
    feedback_text: Optional[str] = Field(None, max_length=1000, description="User feedback text")
    was_helpful: bool = Field(..., description="Whether the result was helpful")
    suggested_correction: Optional[str] = Field(None, description="User's suggested correction")


class QueryHistoryResponse(BaseModel):
    """Query history response"""
    queries: List[Dict[str, Any]] = Field(..., description="Historical queries")
    total: int = Field(..., ge=0, description="Total number of queries")
    success_rate: float = Field(..., ge=0.0, le=1.0, description="Overall success rate")
    avg_confidence: float = Field(..., ge=0.0, le=1.0, description="Average confidence score")
    popular_patterns: List[str] = Field(..., description="Most popular query patterns")


# Restaurant-specific schemas
class RestaurantQueryContext(BaseModel):
    """Restaurant-specific query context"""
    restaurant_ids: Optional[List[uuid.UUID]] = Field(None, description="Accessible restaurant IDs")
    user_role: str = Field(..., description="User role (admin, manager, analyst)")
    available_date_range: Dict[str, str] = Field(..., description="Available data date range")
    default_location: Optional[str] = Field(None, description="Default location filter")
    preferred_metrics: List[str] = Field(default_factory=list, description="User's preferred metrics")


class RestaurantEntity(BaseModel):
    """Restaurant-specific entity"""
    entity_type: str = Field(..., pattern="^(restaurant|location|menu_item|time_period|metric|comparison)$")
    entity_value: str = Field(..., description="Entity value")
    normalized_value: str = Field(..., description="Normalized entity value")
    restaurant_id: Optional[uuid.UUID] = Field(None, description="Associated restaurant ID")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Entity confidence")


class RestaurantQueryIntent(BaseModel):
    """Restaurant-specific query intent"""
    intent_category: str = Field(..., pattern="^(revenue_analysis|menu_performance|customer_metrics|location_comparison|trend_analysis)$")
    specific_intent: str = Field(..., description="Specific intent within category")
    required_entities: List[str] = Field(..., description="Required entities for this intent")
    optional_entities: List[str] = Field(default_factory=list, description="Optional entities")
    sql_template: str = Field(..., description="SQL template for this intent")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Intent confidence")


# Error and validation schemas
class QueryValidationError(BaseModel):
    """Query validation error"""
    error_type: str = Field(..., description="Type of validation error")
    error_message: str = Field(..., description="Human-readable error message")
    suggested_fix: Optional[str] = Field(None, description="Suggested fix for the error")
    error_position: Optional[int] = Field(None, description="Position in query where error occurred")


class QueryCorrectionSuggestion(BaseModel):
    """Query correction suggestion"""
    original_query: str = Field(..., description="Original query with issues")
    corrected_query: str = Field(..., description="Suggested corrected query")
    correction_reason: str = Field(..., description="Reason for the correction")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Correction confidence")


# Analytics and monitoring schemas
class QueryPerformanceMetrics(BaseModel):
    """Query performance metrics"""
    avg_processing_time: float = Field(..., description="Average processing time in ms")
    avg_execution_time: float = Field(..., description="Average SQL execution time in ms")
    success_rate: float = Field(..., ge=0.0, le=1.0, description="Query success rate")
    avg_confidence: float = Field(..., ge=0.0, le=1.0, description="Average confidence score")
    total_queries: int = Field(..., ge=0, description="Total number of queries processed")
    cache_hit_rate: float = Field(..., ge=0.0, le=1.0, description="Cache hit rate")


class PopularQueryPattern(BaseModel):
    """Popular query pattern"""
    pattern: str = Field(..., description="Query pattern")
    usage_count: int = Field(..., ge=0, description="Number of times used")
    success_rate: float = Field(..., ge=0.0, le=1.0, description="Success rate for this pattern")
    avg_confidence: float = Field(..., ge=0.0, le=1.0, description="Average confidence")
    example_queries: List[str] = Field(..., description="Example queries matching this pattern")