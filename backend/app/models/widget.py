"""
BiteBase Intelligence Widget Models
Widget-specific models and configurations
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.core.database import Base


class WidgetTemplate(Base):
    """Widget templates for quick widget creation"""
    __tablename__ = "widget_templates"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Widget configuration
    widget_type = Column(String(50), nullable=False, index=True)  # chart, text, image, metric, table
    chart_type = Column(String(50), nullable=True, index=True)    # Specific chart type if applicable
    
    # Template configuration
    default_config = Column(JSON, nullable=False)     # Default widget configuration
    default_position = Column(JSON, nullable=False)   # Default position and size
    preview_image = Column(String(500), nullable=True) # Preview image URL
    
    # Categorization
    category = Column(String(100), nullable=False, index=True)  # basic, advanced, custom
    tags = Column(JSON, nullable=True)
    
    # Usage and popularity
    usage_count = Column(Integer, default=0)
    rating = Column(Float, nullable=True)
    
    # Performance characteristics
    performance_weight = Column(Float, default=1.0)   # Performance impact score
    is_advanced = Column(Boolean, default=False)      # Requires advanced features
    
    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Metadata
    created_by = Column(String(36), nullable=False)   # Template creator
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WidgetDataSource(Base):
    """Widget data source configurations"""
    __tablename__ = "widget_data_sources"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Data source configuration
    source_type = Column(String(50), nullable=False)  # api, database, file, static
    connection_config = Column(JSON, nullable=False)  # Connection parameters
    query_config = Column(JSON, nullable=True)        # Query/filter configuration
    
    # Data schema
    schema_config = Column(JSON, nullable=True)       # Expected data structure
    sample_data = Column(JSON, nullable=True)         # Sample data for preview
    
    # Refresh configuration
    refresh_interval = Column(Integer, nullable=True) # Auto-refresh interval in seconds
    cache_duration = Column(Integer, nullable=True)   # Cache duration in seconds
    
    # Status and health
    is_active = Column(Boolean, default=True)
    last_health_check = Column(DateTime, nullable=True)
    health_status = Column(String(20), default='unknown')  # healthy, warning, error, unknown
    error_message = Column(Text, nullable=True)
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    last_used_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_by = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WidgetInteraction(Base):
    """Widget interaction tracking"""
    __tablename__ = "widget_interactions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    widget_id = Column(String(36), ForeignKey("dashboard_widgets.id"), nullable=False, index=True)
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False, index=True)
    
    # Interaction details
    interaction_type = Column(String(50), nullable=False)  # click, hover, resize, move, configure
    interaction_data = Column(JSON, nullable=True)         # Additional interaction data
    
    # User context
    user_id = Column(String(36), nullable=True, index=True)
    session_id = Column(String(36), nullable=True, index=True)
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)
    
    # Performance data
    response_time = Column(Float, nullable=True)           # Response time in milliseconds
    error_occurred = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    widget = relationship("DashboardWidget")
    dashboard = relationship("Dashboard")


class WidgetCache(Base):
    """Widget data caching"""
    __tablename__ = "widget_cache"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    widget_id = Column(String(36), ForeignKey("dashboard_widgets.id"), nullable=False, index=True)
    
    # Cache key and data
    cache_key = Column(String(255), nullable=False, unique=True, index=True)
    cached_data = Column(JSON, nullable=False)
    data_size = Column(Integer, nullable=True)             # Size in bytes
    
    # Cache metadata
    cache_version = Column(String(50), nullable=True)      # Data version/hash
    compression_type = Column(String(20), nullable=True)   # Compression method used
    
    # Expiration
    expires_at = Column(DateTime, nullable=False, index=True)
    last_accessed_at = Column(DateTime, nullable=True)
    access_count = Column(Integer, default=0)
    
    # Performance metrics
    generation_time = Column(Float, nullable=True)         # Time to generate cache
    hit_count = Column(Integer, default=0)
    miss_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    widget = relationship("DashboardWidget")


class WidgetAlert(Base):
    """Widget-based alerts and notifications"""
    __tablename__ = "widget_alerts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    widget_id = Column(String(36), ForeignKey("dashboard_widgets.id"), nullable=False, index=True)
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False, index=True)
    
    # Alert configuration
    alert_name = Column(String(255), nullable=False)
    alert_type = Column(String(50), nullable=False)        # threshold, anomaly, data_quality
    condition_config = Column(JSON, nullable=False)        # Alert conditions
    
    # Alert status
    is_active = Column(Boolean, default=True)
    current_status = Column(String(20), default='normal')  # normal, warning, critical
    last_triggered_at = Column(DateTime, nullable=True)
    trigger_count = Column(Integer, default=0)
    
    # Notification configuration
    notification_config = Column(JSON, nullable=True)      # How to notify users
    notification_channels = Column(JSON, nullable=True)    # Email, SMS, webhook, etc.
    
    # Alert data
    current_value = Column(Float, nullable=True)
    threshold_value = Column(Float, nullable=True)
    alert_message = Column(Text, nullable=True)
    
    # Metadata
    created_by = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    widget = relationship("DashboardWidget")
    dashboard = relationship("Dashboard")


class WidgetComment(Base):
    """Comments and annotations on widgets"""
    __tablename__ = "widget_comments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    widget_id = Column(String(36), ForeignKey("dashboard_widgets.id"), nullable=False, index=True)
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False, index=True)
    
    # Comment content
    comment_text = Column(Text, nullable=False)
    comment_type = Column(String(20), default='comment')   # comment, annotation, suggestion
    
    # Position (for annotations)
    position_x = Column(Float, nullable=True)              # X coordinate for annotation
    position_y = Column(Float, nullable=True)              # Y coordinate for annotation
    
    # Threading
    parent_comment_id = Column(String(36), ForeignKey("widget_comments.id"), nullable=True)
    thread_depth = Column(Integer, default=0)
    
    # Status
    is_resolved = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    
    # User information
    author_id = Column(String(36), nullable=False)
    author_name = Column(String(255), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    widget = relationship("DashboardWidget")
    dashboard = relationship("Dashboard")
    parent_comment = relationship("WidgetComment", remote_side=[id])
    replies = relationship("WidgetComment", back_populates="parent_comment")