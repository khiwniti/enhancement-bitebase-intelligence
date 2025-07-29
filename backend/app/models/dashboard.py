"""
BiteBase Intelligence Dashboard Models
Enhanced dashboard models for the BI platform
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.core.database import Base


class Dashboard(Base):
    """Enhanced dashboard model with layout and configuration"""
    __tablename__ = "dashboards"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # User ownership
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)  # User who created the dashboard
    author = Column(String(255), nullable=False)  # Author name for display
    
    # Dashboard configuration
    layout_config = Column(JSON, nullable=False)  # Grid layout configuration
    theme_config = Column(JSON, nullable=False)   # Theme and styling configuration
    settings_config = Column(JSON, nullable=False)  # Dashboard settings
    
    # Status and visibility
    is_public = Column(Boolean, default=False, index=True)
    is_active = Column(Boolean, default=True, index=True)
    
    # Metadata
    tags = Column(JSON, nullable=True)  # Array of tags for categorization
    version = Column(Integer, default=1)
    
    # Performance tracking
    view_count = Column(Integer, default=0)
    last_viewed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="dashboards")
    widgets = relationship("DashboardWidget", back_populates="dashboard", cascade="all, delete-orphan")
    shares = relationship("DashboardShare", back_populates="dashboard", cascade="all, delete-orphan")


class DashboardWidget(Base):
    """Dashboard widget model with chart configuration"""
    __tablename__ = "dashboard_widgets"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False, index=True)
    
    # Widget identification
    type = Column(String(50), nullable=False)  # chart, text, image, metric, table, custom
    chart_type = Column(String(50), nullable=True)  # Specific chart type if type='chart'
    
    # Widget content
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Position and layout
    position_config = Column(JSON, nullable=False)  # Grid position (x, y, w, h)
    
    # Widget configuration
    widget_config = Column(JSON, nullable=False)  # Widget-specific configuration
    chart_props = Column(JSON, nullable=True)     # Chart properties if applicable
    
    # Data configuration
    data_source = Column(String(255), nullable=True)  # Data source identifier
    data_config = Column(JSON, nullable=True)         # Data query/filter configuration
    refresh_interval = Column(Integer, nullable=True)  # Auto-refresh interval in seconds
    
    # Visual configuration
    style_config = Column(JSON, nullable=True)  # Custom styling
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Versioning
    version = Column(Integer, default=1)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    dashboard = relationship("Dashboard", back_populates="widgets")


class DashboardShare(Base):
    """Dashboard sharing and permissions model"""
    __tablename__ = "dashboard_shares"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False, index=True)
    
    # Share configuration
    share_id = Column(String(36), unique=True, nullable=False, index=True)  # Public share identifier
    share_url = Column(String(500), nullable=False)  # Full share URL
    
    # Permissions
    is_public = Column(Boolean, default=False)
    allow_edit = Column(Boolean, default=False)
    allow_comment = Column(Boolean, default=False)
    allow_export = Column(Boolean, default=True)
    
    # Security
    password_hash = Column(String(255), nullable=True)  # Optional password protection
    expires_at = Column(DateTime, nullable=True)        # Optional expiration
    
    # Usage tracking
    view_count = Column(Integer, default=0)
    last_accessed_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_by = Column(String(36), nullable=False)  # User who created the share
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    dashboard = relationship("Dashboard", back_populates="shares")


class DashboardTemplate(Base):
    """Dashboard templates for quick creation"""
    __tablename__ = "dashboard_templates"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Template configuration
    template_config = Column(JSON, nullable=False)  # Complete dashboard configuration
    preview_image = Column(String(500), nullable=True)  # Preview image URL
    
    # Categorization
    category = Column(String(100), nullable=False, index=True)  # analytics, sales, marketing, etc.
    tags = Column(JSON, nullable=True)
    
    # Usage and popularity
    usage_count = Column(Integer, default=0)
    rating = Column(Float, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Metadata
    created_by = Column(String(36), nullable=False)  # Template creator
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DashboardExport(Base):
    """Dashboard export history and status"""
    __tablename__ = "dashboard_exports"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False, index=True)
    
    # Export configuration
    export_format = Column(String(20), nullable=False)  # pdf, png, svg, json
    export_options = Column(JSON, nullable=True)        # Export-specific options
    
    # File information
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)      # Server file path
    file_size = Column(Integer, nullable=True)          # File size in bytes
    download_url = Column(String(500), nullable=True)   # Temporary download URL
    
    # Status tracking
    status = Column(String(20), default='pending')      # pending, processing, completed, failed
    progress = Column(Float, default=0.0)               # Progress percentage
    error_message = Column(Text, nullable=True)         # Error details if failed
    
    # Expiration
    expires_at = Column(DateTime, nullable=True)        # When the export expires
    
    # Metadata
    requested_by = Column(String(36), nullable=False)   # User who requested export
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    dashboard = relationship("Dashboard")


class DashboardAnalytics(Base):
    """Dashboard usage analytics and metrics"""
    __tablename__ = "dashboard_analytics"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False, index=True)
    
    # Time period
    date = Column(DateTime, nullable=False, index=True)
    period_type = Column(String(20), nullable=False)  # hourly, daily, weekly, monthly
    
    # Usage metrics
    view_count = Column(Integer, default=0)
    unique_viewers = Column(Integer, default=0)
    avg_session_duration = Column(Float, nullable=True)  # Average time spent viewing
    
    # Interaction metrics
    widget_interactions = Column(Integer, default=0)
    export_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)
    
    # Performance metrics
    avg_load_time = Column(Float, nullable=True)        # Average dashboard load time
    error_count = Column(Integer, default=0)            # Number of errors encountered
    
    # User engagement
    bounce_rate = Column(Float, nullable=True)          # Percentage of single-page sessions
    return_visitor_rate = Column(Float, nullable=True)  # Percentage of returning visitors
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    dashboard = relationship("Dashboard")