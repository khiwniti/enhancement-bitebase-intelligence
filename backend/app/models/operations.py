"""
Operations Models
Database models for restaurant operations management
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Enum, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from enum import Enum as PyEnum
import uuid

Base = declarative_base()


class ServicePhase(PyEnum):
    """Service phase enumeration"""
    CLOSED = "closed"
    OPENING = "opening"
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    AFTERNOON_BREAK = "afternoon-break"
    DINNER = "dinner"
    LATE_NIGHT = "late-night"
    CLOSING = "closing"


class OrderStatus(PyEnum):
    """Order status enumeration"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    CANCELLED = "cancelled"


class OrderType(PyEnum):
    """Order type enumeration"""
    DINE_IN = "dine-in"
    TAKEOUT = "takeout"
    DELIVERY = "delivery"
    PICKUP = "pickup"


class TaskStatus(PyEnum):
    """Task status enumeration"""
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class TaskPriority(PyEnum):
    """Task priority enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RestaurantOperations(Base):
    """Restaurant operations configuration"""
    __tablename__ = "restaurant_operations"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(String(50), ForeignKey("restaurants.id"), nullable=False)
    current_phase = Column(Enum(ServicePhase), default=ServicePhase.CLOSED)
    is_transitioning = Column(Boolean, default=False)
    phase_started_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Operating hours configuration
    operating_hours = Column(JSON)  # Store hours for each day
    
    # Service configuration
    service_types = Column(JSON)  # dine_in, takeout, delivery, pickup
    seating_capacity = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    orders = relationship("Order", back_populates="operations")
    tasks = relationship("Task", back_populates="operations")


class Order(Base):
    """Restaurant order model"""
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_operations_id = Column(Integer, ForeignKey("restaurant_operations.id"), nullable=False)
    
    # Order identification
    order_number = Column(String(20), nullable=False, index=True)
    
    # Customer information
    customer_name = Column(String(100))
    customer_phone = Column(String(20))
    customer_email = Column(String(100))
    
    # Order details
    type = Column(Enum(OrderType), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    table_number = Column(String(10))
    
    # Order items (JSON array)
    items = Column(JSON, nullable=False)  # [{"name", "quantity", "price", "special_instructions"}]
    
    # Financial
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0)
    total = Column(Float, nullable=False)
    
    # Special instructions/notes
    notes = Column(Text)
    
    # Timing
    estimated_prep_time = Column(Integer)  # minutes
    actual_prep_time = Column(Integer)  # minutes
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))

    # Relationships
    operations = relationship("RestaurantOperations", back_populates="orders")


class Task(Base):
    """Restaurant task model"""
    __tablename__ = "tasks"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_operations_id = Column(Integer, ForeignKey("restaurant_operations.id"), nullable=False)
    
    # Task identification
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Task properties
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    category = Column(String(50))  # cleaning, maintenance, prep, etc.
    
    # Assignment
    assigned_to_user_id = Column(String(50))
    assigned_to_role = Column(String(50))  # manager, server, kitchen, etc.
    
    # Timing
    estimated_duration = Column(Integer)  # minutes
    actual_duration = Column(Integer)  # minutes
    due_date = Column(DateTime(timezone=True))
    
    # Requirements
    photo_required = Column(Boolean, default=False)
    photo_url = Column(String(500))
    location_required = Column(Boolean, default=False)
    location = Column(String(100))
    
    # Completion
    completion_notes = Column(Text)
    completed_by_user_id = Column(String(50))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))

    # Relationships
    operations = relationship("RestaurantOperations", back_populates="tasks")


class ServicePhaseTransition(Base):
    """Service phase transition log"""
    __tablename__ = "service_phase_transitions"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_operations_id = Column(Integer, ForeignKey("restaurant_operations.id"), nullable=False)
    
    # Transition details
    from_phase = Column(Enum(ServicePhase))
    to_phase = Column(Enum(ServicePhase), nullable=False)
    initiated_by_user_id = Column(String(50))
    
    # Transition data
    transition_data = Column(JSON)  # Additional data about the transition
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StaffSession(Base):
    """Staff work session tracking"""
    __tablename__ = "staff_sessions"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_operations_id = Column(Integer, ForeignKey("restaurant_operations.id"), nullable=False)
    
    # Staff information
    user_id = Column(String(50), nullable=False)
    role = Column(String(50))  # manager, server, kitchen, etc.
    
    # Session details
    session_start = Column(DateTime(timezone=True), server_default=func.now())
    session_end = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    
    # Performance tracking
    tasks_completed = Column(Integer, default=0)
    orders_processed = Column(Integer, default=0)
    
    # Device/location
    device_info = Column(JSON)
    last_seen_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class OperationalMetric(Base):
    """Operational metrics tracking"""
    __tablename__ = "operational_metrics"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_operations_id = Column(Integer, ForeignKey("restaurant_operations.id"), nullable=False)
    
    # Metric identification
    metric_name = Column(String(100), nullable=False)
    metric_type = Column(String(50))  # counter, gauge, histogram
    
    # Metric values
    value = Column(Float, nullable=False)
    tags = Column(JSON)  # Additional tags for filtering/grouping
    
    # Time period
    time_period = Column(String(20))  # hour, day, shift, etc.
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())