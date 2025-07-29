"""
BiteBase Intelligence POS Integration Models
Advanced POS connector management with real-time sync and multi-location support
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
import enum

from app.core.database import Base


class POSProvider(enum.Enum):
    """Supported POS providers"""
    SQUARE = "square"
    TOAST = "toast"
    CLOVER = "clover"
    LIGHTSPEED = "lightspeed"
    REVEL = "revel"
    SHOPIFY = "shopify"
    MICROS = "micros"
    ALOHA = "aloha"
    TOUCHBISTRO = "touchbistro"
    UPSERVE = "upserve"


class POSConnectionStatus(enum.Enum):
    """POS connection status"""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    SYNCING = "syncing"
    ERROR = "error"
    PENDING = "pending"
    EXPIRED = "expired"


class SyncStatus(enum.Enum):
    """Data synchronization status"""
    SUCCESS = "success"
    FAILED = "failed"
    IN_PROGRESS = "in_progress"
    PARTIAL = "partial"
    SKIPPED = "skipped"


class DataType(enum.Enum):
    """Types of data that can be synchronized"""
    SALES = "sales"
    MENU_ITEMS = "menu_items"
    INVENTORY = "inventory"
    CUSTOMERS = "customers"
    ORDERS = "orders"
    PAYMENTS = "payments"
    STAFF = "staff"
    DISCOUNTS = "discounts"
    TAXES = "taxes"
    MODIFIERS = "modifiers"


class POSIntegration(Base):
    """POS system integration configuration"""
    __tablename__ = "pos_integrations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    location_id = Column(String(36), nullable=True)  # For multi-location support
    
    # Provider information
    provider = Column(Enum(POSProvider), nullable=False)
    provider_name = Column(String(100), nullable=False)
    provider_version = Column(String(50), nullable=True)
    
    # Connection details
    status = Column(Enum(POSConnectionStatus), nullable=False, default=POSConnectionStatus.DISCONNECTED)
    connection_config = Column(JSON, nullable=False)  # API keys, endpoints, etc.
    
    # Authentication
    api_key = Column(Text, nullable=True)
    api_secret = Column(Text, nullable=True)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    
    # Sync configuration
    auto_sync_enabled = Column(Boolean, nullable=False, default=True)
    sync_interval_minutes = Column(Integer, nullable=False, default=15)
    enabled_data_types = Column(JSON, nullable=False)  # List of DataType values
    
    # Connection metadata
    last_connected_at = Column(DateTime, nullable=True)
    last_sync_at = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
    error_count = Column(Integer, nullable=False, default=0)
    
    # Performance metrics
    total_syncs = Column(Integer, nullable=False, default=0)
    successful_syncs = Column(Integer, nullable=False, default=0)
    average_sync_duration = Column(Float, nullable=True)  # in seconds
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="pos_integrations")
    sync_logs = relationship("POSSyncLog", back_populates="integration", cascade="all, delete-orphan")
    data_mappings = relationship("POSDataMapping", back_populates="integration", cascade="all, delete-orphan")


class POSSyncLog(Base):
    """Log of POS synchronization attempts"""
    __tablename__ = "pos_sync_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    integration_id = Column(String(36), ForeignKey("pos_integrations.id"), nullable=False)
    
    # Sync details
    sync_type = Column(String(50), nullable=False)  # manual, scheduled, real_time
    data_types = Column(JSON, nullable=False)  # List of DataType values synced
    status = Column(Enum(SyncStatus), nullable=False)
    
    # Timing
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    
    # Results
    records_processed = Column(Integer, nullable=False, default=0)
    records_created = Column(Integer, nullable=False, default=0)
    records_updated = Column(Integer, nullable=False, default=0)
    records_failed = Column(Integer, nullable=False, default=0)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, nullable=True)
    retry_count = Column(Integer, nullable=False, default=0)
    
    # Metadata
    sync_metadata = Column(JSON, nullable=True)  # Additional sync information
    
    # Relationships
    integration = relationship("POSIntegration", back_populates="sync_logs")


class POSDataMapping(Base):
    """Mapping between POS data fields and BiteBase fields"""
    __tablename__ = "pos_data_mappings"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    integration_id = Column(String(36), ForeignKey("pos_integrations.id"), nullable=False)
    
    # Mapping details
    data_type = Column(Enum(DataType), nullable=False)
    pos_field_name = Column(String(200), nullable=False)
    bitebase_field_name = Column(String(200), nullable=False)
    
    # Transformation rules
    transformation_rules = Column(JSON, nullable=True)  # Data transformation logic
    is_required = Column(Boolean, nullable=False, default=False)
    default_value = Column(String(500), nullable=True)
    
    # Validation
    validation_rules = Column(JSON, nullable=True)  # Field validation rules
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    integration = relationship("POSIntegration", back_populates="data_mappings")


class POSWebhook(Base):
    """Webhook configurations for real-time POS data updates"""
    __tablename__ = "pos_webhooks"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    integration_id = Column(String(36), ForeignKey("pos_integrations.id"), nullable=False)
    
    # Webhook details
    webhook_url = Column(String(500), nullable=False)
    webhook_secret = Column(String(200), nullable=True)
    event_types = Column(JSON, nullable=False)  # List of events to listen for
    
    # Status
    is_active = Column(Boolean, nullable=False, default=True)
    last_received_at = Column(DateTime, nullable=True)
    total_events_received = Column(Integer, nullable=False, default=0)
    
    # Error tracking
    consecutive_failures = Column(Integer, nullable=False, default=0)
    last_error = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    integration = relationship("POSIntegration")


class POSLocation(Base):
    """Multi-location support for POS integrations"""
    __tablename__ = "pos_locations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Location details
    name = Column(String(200), nullable=False)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(50), nullable=True)
    
    # Geographic coordinates
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Location metadata
    timezone = Column(String(50), nullable=True)
    phone_number = Column(String(20), nullable=True)
    email = Column(String(200), nullable=True)
    
    # Status
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("Restaurant")


class POSConnectorHealth(Base):
    """Health monitoring for POS connectors"""
    __tablename__ = "pos_connector_health"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    integration_id = Column(String(36), ForeignKey("pos_integrations.id"), nullable=False)
    
    # Health metrics
    check_timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_healthy = Column(Boolean, nullable=False)
    response_time_ms = Column(Integer, nullable=True)
    
    # Detailed status
    connection_status = Column(String(50), nullable=False)
    api_status = Column(String(50), nullable=False)
    data_freshness_minutes = Column(Integer, nullable=True)
    
    # Error information
    error_message = Column(Text, nullable=True)
    error_code = Column(String(50), nullable=True)
    
    # Performance metrics
    cpu_usage_percent = Column(Float, nullable=True)
    memory_usage_mb = Column(Float, nullable=True)
    
    # Relationships
    integration = relationship("POSIntegration")
