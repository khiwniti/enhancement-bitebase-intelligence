"""
Analytics models for BiteBase Intelligence
"""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Column, String, DateTime, JSON, Float, Integer, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.database import Base


class AnalyticsEvent(Base):
    """Analytics event model for tracking user interactions and system events"""
    __tablename__ = "analytics_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(100), nullable=False, index=True)
    event_name = Column(String(200), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    restaurant_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    # Event data
    properties = Column(JSON, nullable=True)
    event_metadata = Column(JSON, nullable=True)
    
    # Tracking information
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    referrer = Column(String(500), nullable=True)
    
    # Metrics
    value = Column(Float, nullable=True)
    duration = Column(Integer, nullable=True)  # in milliseconds
    
    # Status
    processed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'event_type': self.event_type,
            'event_name': self.event_name,
            'user_id': str(self.user_id) if self.user_id else None,
            'session_id': self.session_id,
            'restaurant_id': str(self.restaurant_id) if self.restaurant_id else None,
            'properties': self.properties,
            'event_metadata': self.event_metadata,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'referrer': self.referrer,
            'value': self.value,
            'duration': self.duration,
            'processed': self.processed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class AnalyticsMetric(Base):
    """Aggregated analytics metrics"""
    __tablename__ = "analytics_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_name = Column(String(100), nullable=False, index=True)
    metric_type = Column(String(50), nullable=False)  # count, sum, avg, etc.
    
    # Dimensions
    restaurant_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    date = Column(DateTime, nullable=False, index=True)
    period = Column(String(20), nullable=False)  # hour, day, week, month
    
    # Values
    value = Column(Float, nullable=False)
    count = Column(Integer, default=0, nullable=False)
    
    # Metadata
    dimensions = Column(JSON, nullable=True)
    tags = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'metric_name': self.metric_name,
            'metric_type': self.metric_type,
            'restaurant_id': str(self.restaurant_id) if self.restaurant_id else None,
            'user_id': str(self.user_id) if self.user_id else None,
            'date': self.date.isoformat() if self.date else None,
            'period': self.period,
            'value': self.value,
            'count': self.count,
            'dimensions': self.dimensions,
            'tags': self.tags,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
