"""
BiteBase Intelligence Natural Language Query Models
Models for NL query processing and history
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.core.database import Base


class NLQueryHistory(Base):
    """Natural language query history and analytics"""
    __tablename__ = "nl_query_history"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False, index=True)
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=True, index=True)
    
    # Query data
    original_query = Column(Text, nullable=False)
    processed_query = Column(JSON, nullable=False)  # Intent, entities, context
    generated_sql = Column(Text, nullable=False)
    
    # Processing metrics
    confidence_score = Column(Float, nullable=False)
    execution_time_ms = Column(Integer, nullable=False)
    processing_time_ms = Column(Integer, nullable=False)
    
    # Results
    result_count = Column(Integer, nullable=True)
    chart_type = Column(String(50), nullable=True)
    chart_config = Column(JSON, nullable=True)
    
    # Success tracking
    success = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)
    
    # User feedback
    user_feedback = Column(Text, nullable=True)
    user_rating = Column(Integer, nullable=True)  # 1-5 rating
    was_helpful = Column(Boolean, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    dashboard = relationship("Dashboard", foreign_keys=[dashboard_id])


class QueryPattern(Base):
    """Query patterns for learning and optimization"""
    __tablename__ = "query_patterns"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Pattern data
    pattern_type = Column(String(50), nullable=False, index=True)  # intent type
    pattern_text = Column(Text, nullable=False)
    normalized_pattern = Column(Text, nullable=False, index=True)
    
    # Pattern metadata
    entities = Column(JSON, nullable=False)  # Common entities in this pattern
    sql_template = Column(Text, nullable=False)
    chart_suggestions = Column(JSON, nullable=False)  # Suggested chart types
    
    # Performance metrics
    success_rate = Column(Float, nullable=False, default=0.0)
    usage_count = Column(Integer, default=0)
    avg_confidence = Column(Float, nullable=False, default=0.0)
    avg_execution_time = Column(Float, nullable=False, default=0.0)
    
    # Learning data
    last_used = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class QuerySuggestion(Base):
    """Query suggestions and auto-complete data"""
    __tablename__ = "query_suggestions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Suggestion data
    suggestion_text = Column(String(500), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # revenue, menu, customer, location
    description = Column(Text, nullable=True)
    
    # Usage metrics
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class NLQueryCache(Base):
    """Cache for frequently used NL queries"""
    __tablename__ = "nl_query_cache"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Cache key (hash of normalized query + context)
    cache_key = Column(String(255), unique=True, nullable=False, index=True)
    
    # Cached data
    query_hash = Column(String(64), nullable=False, index=True)
    processed_query = Column(JSON, nullable=False)
    generated_sql = Column(Text, nullable=False)
    chart_suggestion = Column(JSON, nullable=False)
    
    # Cache metadata
    hit_count = Column(Integer, default=0)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)