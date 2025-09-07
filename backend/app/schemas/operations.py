"""
Operations Schemas
Pydantic schemas for restaurant operations API
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum


class ServicePhase(str, Enum):
    """Service phase enumeration"""
    CLOSED = "closed"
    OPENING = "opening"
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    AFTERNOON_BREAK = "afternoon-break"
    DINNER = "dinner"
    LATE_NIGHT = "late-night"
    CLOSING = "closing"


class OrderStatus(str, Enum):
    """Order status enumeration"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    CANCELLED = "cancelled"


class OrderType(str, Enum):
    """Order type enumeration"""
    DINE_IN = "dine-in"
    TAKEOUT = "takeout"
    DELIVERY = "delivery"
    PICKUP = "pickup"


class TaskStatus(str, Enum):
    """Task status enumeration"""
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class TaskPriority(str, Enum):
    """Task priority enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# Base schemas
class BaseOperationSchema(BaseModel):
    """Base schema for operations"""
    
    class Config:
        from_attributes = True
        use_enum_values = True


# Service Phase Management
class ServicePhaseUpdate(BaseModel):
    """Schema for updating service phase"""
    phase: ServicePhase
    user_id: Optional[str] = None
    notes: Optional[str] = None


class ServicePhaseResponse(BaseOperationSchema):
    """Schema for service phase response"""
    current_phase: ServicePhase
    is_transitioning: bool
    phase_started_at: datetime
    next_suggested_phase: Optional[ServicePhase] = None
    phase_duration_minutes: Optional[int] = None


class OperatingHours(BaseModel):
    """Schema for operating hours"""
    open: str = Field(..., description="Opening time in HH:MM format")
    close: str = Field(..., description="Closing time in HH:MM format")
    closed: bool = False


class ServiceConfiguration(BaseModel):
    """Schema for service configuration"""
    dine_in: bool = True
    takeout: bool = True
    delivery: bool = False
    pickup: bool = True
    seating_capacity: int = 0


class RestaurantOperationsCreate(BaseModel):
    """Schema for creating restaurant operations"""
    restaurant_id: str
    operating_hours: Dict[str, OperatingHours]
    service_types: ServiceConfiguration
    seating_capacity: int = 0


class RestaurantOperationsResponse(BaseOperationSchema):
    """Schema for restaurant operations response"""
    id: int
    restaurant_id: str
    current_phase: ServicePhase
    is_transitioning: bool
    phase_started_at: datetime
    operating_hours: Dict[str, Any]
    service_types: Dict[str, Any]
    seating_capacity: int
    created_at: datetime
    updated_at: Optional[datetime]


# Order Management
class OrderItem(BaseModel):
    """Schema for order items"""
    name: str
    quantity: int
    price: float
    special_instructions: Optional[str] = None


class OrderCreate(BaseModel):
    """Schema for creating orders"""
    order_number: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    type: OrderType
    table_number: Optional[str] = None
    items: List[OrderItem]
    subtotal: float
    tax: float = 0
    total: float
    notes: Optional[str] = None
    estimated_prep_time: Optional[int] = None


class OrderUpdate(BaseModel):
    """Schema for updating orders"""
    status: Optional[OrderStatus] = None
    notes: Optional[str] = None
    actual_prep_time: Optional[int] = None


class OrderResponse(BaseOperationSchema):
    """Schema for order response"""
    id: str
    order_number: str
    customer_name: Optional[str]
    customer_phone: Optional[str]
    type: OrderType
    status: OrderStatus
    table_number: Optional[str]
    items: List[Dict[str, Any]]
    subtotal: float
    tax: float
    total: float
    notes: Optional[str]
    estimated_prep_time: Optional[int]
    actual_prep_time: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]


class OrderListResponse(BaseModel):
    """Schema for order list response"""
    orders: List[OrderResponse]
    total_count: int
    active_orders: int
    urgent_orders: int


# Task Management
class TaskCreate(BaseModel):
    """Schema for creating tasks"""
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    category: Optional[str] = None
    assigned_to_user_id: Optional[str] = None
    assigned_to_role: Optional[str] = None
    estimated_duration: Optional[int] = None
    due_date: Optional[datetime] = None
    photo_required: bool = False
    location_required: bool = False
    location: Optional[str] = None


class TaskUpdate(BaseModel):
    """Schema for updating tasks"""
    status: Optional[TaskStatus] = None
    completion_notes: Optional[str] = None
    photo_url: Optional[str] = None
    actual_duration: Optional[int] = None


class TaskResponse(BaseOperationSchema):
    """Schema for task response"""
    id: str
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    category: Optional[str]
    assigned_to_user_id: Optional[str]
    assigned_to_role: Optional[str]
    estimated_duration: Optional[int]
    actual_duration: Optional[int]
    due_date: Optional[datetime]
    photo_required: bool
    photo_url: Optional[str]
    location_required: bool
    location: Optional[str]
    completion_notes: Optional[str]
    completed_by_user_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]


class TaskListResponse(BaseModel):
    """Schema for task list response"""
    tasks: List[TaskResponse]
    total_count: int
    pending_count: int
    in_progress_count: int
    completed_count: int
    overdue_count: int


# Staff Session Management
class StaffSessionCreate(BaseModel):
    """Schema for creating staff sessions"""
    user_id: str
    role: Optional[str] = None
    device_info: Optional[Dict[str, Any]] = None


class StaffSessionUpdate(BaseModel):
    """Schema for updating staff sessions"""
    is_active: Optional[bool] = None
    tasks_completed: Optional[int] = None
    orders_processed: Optional[int] = None


class StaffSessionResponse(BaseOperationSchema):
    """Schema for staff session response"""
    id: str
    user_id: str
    role: Optional[str]
    session_start: datetime
    session_end: Optional[datetime]
    is_active: bool
    tasks_completed: int
    orders_processed: int
    device_info: Optional[Dict[str, Any]]
    last_seen_at: datetime
    created_at: datetime


# Analytics and Metrics
class OperationalMetricCreate(BaseModel):
    """Schema for creating operational metrics"""
    metric_name: str
    metric_type: str = "counter"
    value: float
    tags: Optional[Dict[str, Any]] = None
    time_period: str = "hour"
    period_start: datetime
    period_end: Optional[datetime] = None


class OperationalMetricResponse(BaseOperationSchema):
    """Schema for operational metric response"""
    id: int
    metric_name: str
    metric_type: str
    value: float
    tags: Optional[Dict[str, Any]]
    time_period: str
    period_start: datetime
    period_end: Optional[datetime]
    created_at: datetime


class OperationalDashboard(BaseModel):
    """Schema for operational dashboard data"""
    current_phase: ServicePhase
    is_transitioning: bool
    active_orders: int
    urgent_orders: int
    pending_tasks: int
    staff_on_duty: int
    avg_order_time: float
    phase_duration_minutes: int
    recent_orders: List[OrderResponse]
    urgent_tasks: List[TaskResponse]
    performance_metrics: Dict[str, float]


class LiveUpdatesResponse(BaseModel):
    """Schema for live updates via WebSocket"""
    type: str  # "order_update", "task_update", "phase_change", "staff_update"
    data: Dict[str, Any]
    timestamp: datetime
    restaurant_id: str


# Filter and Search schemas
class OrderFilters(BaseModel):
    """Schema for order filtering"""
    status: Optional[List[OrderStatus]] = None
    type: Optional[List[OrderType]] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    customer_name: Optional[str] = None
    table_number: Optional[str] = None


class TaskFilters(BaseModel):
    """Schema for task filtering"""
    status: Optional[List[TaskStatus]] = None
    priority: Optional[List[TaskPriority]] = None
    category: Optional[str] = None
    assigned_to_user_id: Optional[str] = None
    assigned_to_role: Optional[str] = None
    due_before: Optional[datetime] = None
    overdue_only: Optional[bool] = False


# Response wrappers
class APIResponse(BaseModel):
    """Generic API response wrapper"""
    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None
    errors: Optional[List[str]] = None


class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    items: List[Any]
    total: int
    page: int
    per_page: int
    pages: int
    has_next: bool
    has_prev: bool