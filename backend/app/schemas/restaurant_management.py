"""
BiteBase Intelligence Restaurant Management Schemas
Pydantic schemas for restaurant management operations
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum

from app.models.restaurant import StaffRole, EmploymentStatus, OrderStatus, TableStatus, PaymentMethod


# Staff Management Schemas
class StaffBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    employee_id: Optional[str] = Field(None, max_length=50)
    role: StaffRole
    employment_status: EmploymentStatus = EmploymentStatus.ACTIVE
    hire_date: datetime
    termination_date: Optional[datetime] = None
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    salary: Optional[Decimal] = Field(None, ge=0)
    commission_rate: Optional[float] = Field(None, ge=0, le=100)
    weekly_hours: int = Field(40, ge=0, le=168)
    availability: Optional[Dict[str, Any]] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=255)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)


class StaffCreate(StaffBase):
    pass


class StaffUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    role: Optional[StaffRole] = None
    employment_status: Optional[EmploymentStatus] = None
    termination_date: Optional[datetime] = None
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    salary: Optional[Decimal] = Field(None, ge=0)
    commission_rate: Optional[float] = Field(None, ge=0, le=100)
    weekly_hours: Optional[int] = Field(None, ge=0, le=168)
    availability: Optional[Dict[str, Any]] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=255)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)


class StaffResponse(StaffBase):
    id: str
    restaurant_id: str
    performance_rating: Optional[float] = None
    total_sales: Decimal = Decimal('0')
    customer_ratings: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Shift Management Schemas
class ShiftBase(BaseModel):
    staff_id: str
    restaurant_id: str
    shift_date: datetime
    start_time: datetime
    end_time: Optional[datetime] = None
    scheduled_hours: float = Field(..., ge=0, le=24)
    break_duration: int = Field(30, ge=0, le=480)
    notes: Optional[str] = None


class ShiftCreate(ShiftBase):
    pass


class ShiftUpdate(BaseModel):
    end_time: Optional[datetime] = None
    actual_hours: Optional[float] = Field(None, ge=0, le=24)
    break_taken: Optional[bool] = None
    sales_generated: Optional[Decimal] = Field(None, ge=0)
    orders_handled: Optional[int] = Field(None, ge=0)
    customer_feedback_score: Optional[float] = Field(None, ge=1, le=5)
    is_confirmed: Optional[bool] = None
    is_completed: Optional[bool] = None
    notes: Optional[str] = None


class ShiftResponse(ShiftBase):
    id: str
    actual_hours: Optional[float] = None
    break_taken: bool = False
    sales_generated: Decimal = Decimal('0')
    orders_handled: int = 0
    customer_feedback_score: Optional[float] = None
    is_confirmed: bool = False
    is_completed: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Inventory Management Schemas
class InventoryItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=100)
    sku: Optional[str] = Field(None, max_length=100)
    current_quantity: float = Field(0, ge=0)
    unit_of_measure: str = Field(..., min_length=1, max_length=50)
    minimum_quantity: float = Field(0, ge=0)
    maximum_quantity: Optional[float] = Field(None, ge=0)
    unit_cost: Decimal = Field(..., ge=0)
    supplier_name: Optional[str] = Field(None, max_length=255)
    supplier_contact: Optional[str] = Field(None, max_length=255)
    supplier_product_code: Optional[str] = Field(None, max_length=100)
    expiration_date: Optional[datetime] = None
    batch_number: Optional[str] = Field(None, max_length=100)
    quality_grade: Optional[str] = Field(None, max_length=50)
    is_perishable: bool = False
    requires_refrigeration: bool = False


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    current_quantity: Optional[float] = Field(None, ge=0)
    minimum_quantity: Optional[float] = Field(None, ge=0)
    maximum_quantity: Optional[float] = Field(None, ge=0)
    unit_cost: Optional[Decimal] = Field(None, ge=0)
    supplier_name: Optional[str] = Field(None, max_length=255)
    supplier_contact: Optional[str] = Field(None, max_length=255)
    expiration_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class InventoryItemResponse(InventoryItemBase):
    id: str
    restaurant_id: str
    total_value: Optional[Decimal] = None
    is_active: bool = True
    last_restocked: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Table Management Schemas
class TableBase(BaseModel):
    table_number: str = Field(..., min_length=1, max_length=20)
    seating_capacity: int = Field(..., ge=1, le=50)
    table_type: Optional[str] = Field(None, max_length=50)
    location_area: Optional[str] = Field(None, max_length=100)
    has_power_outlet: bool = False
    is_wheelchair_accessible: bool = True
    has_view: bool = False
    is_private: bool = False


class TableCreate(TableBase):
    pass


class TableUpdate(BaseModel):
    seating_capacity: Optional[int] = Field(None, ge=1, le=50)
    table_type: Optional[str] = Field(None, max_length=50)
    location_area: Optional[str] = Field(None, max_length=100)
    status: Optional[TableStatus] = None
    has_power_outlet: Optional[bool] = None
    is_wheelchair_accessible: Optional[bool] = None
    has_view: Optional[bool] = None
    is_private: Optional[bool] = None
    is_active: Optional[bool] = None


class TableResponse(TableBase):
    id: str
    restaurant_id: str
    status: TableStatus = TableStatus.AVAILABLE
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Reservation Management Schemas
class ReservationBase(BaseModel):
    table_id: str
    restaurant_id: str
    customer_name: str = Field(..., min_length=1, max_length=255)
    customer_phone: Optional[str] = Field(None, max_length=20)
    customer_email: Optional[str] = Field(None, max_length=255)
    party_size: int = Field(..., ge=1, le=50)
    reservation_date: datetime
    reservation_time: datetime
    duration_minutes: int = Field(120, ge=30, le=480)
    special_requests: Optional[str] = None
    dietary_restrictions: Optional[List[str]] = None
    occasion: Optional[str] = Field(None, max_length=100)


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(BaseModel):
    customer_phone: Optional[str] = Field(None, max_length=20)
    customer_email: Optional[str] = Field(None, max_length=255)
    party_size: Optional[int] = Field(None, ge=1, le=50)
    reservation_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=30, le=480)
    special_requests: Optional[str] = None
    dietary_restrictions: Optional[List[str]] = None
    status: Optional[str] = None
    is_confirmed: Optional[bool] = None


class ReservationResponse(ReservationBase):
    id: str
    status: str = "confirmed"
    is_confirmed: bool = True
    confirmation_sent: bool = False
    reminder_sent: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Order Management Schemas
class OrderItemBase(BaseModel):
    menu_item_id: Optional[str] = None
    item_name: str = Field(..., min_length=1, max_length=255)
    quantity: int = Field(..., ge=1)
    unit_price: Decimal = Field(..., ge=0)
    modifications: Optional[Dict[str, Any]] = None
    special_instructions: Optional[str] = None


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: str
    order_id: str
    total_price: Decimal
    kitchen_status: str = "pending"
    kitchen_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    restaurant_id: str
    table_id: Optional[str] = None
    server_id: Optional[str] = None
    order_type: str = Field(..., min_length=1, max_length=50)
    customer_count: int = Field(1, ge=1)
    customer_name: Optional[str] = Field(None, max_length=255)
    customer_phone: Optional[str] = Field(None, max_length=20)
    customer_email: Optional[str] = Field(None, max_length=255)
    delivery_address: Optional[str] = None
    special_instructions: Optional[str] = None
    dietary_notes: Optional[str] = None


class OrderCreate(OrderBase):
    order_items: List[OrderItemCreate] = Field(..., min_items=1)


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    kitchen_time: Optional[datetime] = None
    ready_time: Optional[datetime] = None
    served_time: Optional[datetime] = None
    completed_time: Optional[datetime] = None
    payment_method: Optional[PaymentMethod] = None
    payment_status: Optional[str] = None
    payment_reference: Optional[str] = None
    tip_amount: Optional[Decimal] = Field(None, ge=0)
    discount_amount: Optional[Decimal] = Field(None, ge=0)


class OrderResponse(OrderBase):
    id: str
    order_number: str
    status: OrderStatus = OrderStatus.PENDING
    order_time: datetime
    kitchen_time: Optional[datetime] = None
    ready_time: Optional[datetime] = None
    served_time: Optional[datetime] = None
    completed_time: Optional[datetime] = None
    subtotal: Decimal = Decimal('0')
    tax_amount: Decimal = Decimal('0')
    tip_amount: Decimal = Decimal('0')
    discount_amount: Decimal = Decimal('0')
    total_amount: Decimal = Decimal('0')
    payment_method: Optional[PaymentMethod] = None
    payment_status: str = "pending"
    payment_reference: Optional[str] = None
    order_items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
