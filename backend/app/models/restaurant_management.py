"""
BiteBase Intelligence Restaurant Management Models
Extended models for professional restaurant operations
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
import enum

from app.core.database import Base
from .restaurant import OrderStatus, TableStatus, PaymentMethod, TransactionType


class StockMovement(Base):
    """Inventory stock movement tracking"""
    __tablename__ = "stock_movements"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inventory_item_id = Column(String(36), ForeignKey("inventory_items.id"), nullable=False)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Movement details
    movement_type = Column(String(50), nullable=False)  # purchase, usage, waste, adjustment, return
    quantity_change = Column(Float, nullable=False)  # Positive for additions, negative for usage
    unit_cost = Column(Numeric(10, 2), nullable=True)
    total_cost = Column(Numeric(12, 2), nullable=True)
    
    # Reference information
    reference_type = Column(String(50), nullable=True)  # order, waste_report, purchase_order, etc.
    reference_id = Column(String(36), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Metadata
    movement_date = Column(DateTime, default=datetime.utcnow)
    recorded_by = Column(String(36), nullable=True)  # Staff ID
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    inventory_item = relationship("InventoryItem", back_populates="stock_movements")
    restaurant = relationship("Restaurant")


class Table(Base):
    """Restaurant table management"""
    __tablename__ = "tables"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Table details
    table_number = Column(String(20), nullable=False)
    seating_capacity = Column(Integer, nullable=False)
    table_type = Column(String(50), nullable=True)  # booth, standard, bar, outdoor, etc.
    location_area = Column(String(100), nullable=True)  # dining room, patio, bar area, etc.
    
    # Status and availability
    status = Column(Enum(TableStatus), default=TableStatus.AVAILABLE)
    is_active = Column(Boolean, default=True)
    
    # Features
    has_power_outlet = Column(Boolean, default=False)
    is_wheelchair_accessible = Column(Boolean, default=True)
    has_view = Column(Boolean, default=False)
    is_private = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="tables")
    reservations = relationship("Reservation", back_populates="table", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="table")


class Reservation(Base):
    """Table reservation management"""
    __tablename__ = "reservations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    table_id = Column(String(36), ForeignKey("tables.id"), nullable=False)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Customer information
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(20), nullable=True)
    customer_email = Column(String(255), nullable=True)
    party_size = Column(Integer, nullable=False)
    
    # Reservation details
    reservation_date = Column(DateTime, nullable=False)
    reservation_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=120)
    
    # Special requests
    special_requests = Column(Text, nullable=True)
    dietary_restrictions = Column(JSON, nullable=True)
    occasion = Column(String(100), nullable=True)  # birthday, anniversary, etc.
    
    # Status
    status = Column(String(50), default="confirmed")  # confirmed, seated, completed, cancelled, no_show
    is_confirmed = Column(Boolean, default=True)
    confirmation_sent = Column(Boolean, default=False)
    reminder_sent = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    table = relationship("Table", back_populates="reservations")
    restaurant = relationship("Restaurant")


class Order(Base):
    """Restaurant order management"""
    __tablename__ = "orders"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    table_id = Column(String(36), ForeignKey("tables.id"), nullable=True)
    server_id = Column(String(36), ForeignKey("staff.id"), nullable=True)
    
    # Order details
    order_number = Column(String(50), nullable=False, unique=True)
    order_type = Column(String(50), nullable=False)  # dine_in, takeout, delivery, online
    customer_count = Column(Integer, default=1)
    
    # Customer information (for takeout/delivery)
    customer_name = Column(String(255), nullable=True)
    customer_phone = Column(String(20), nullable=True)
    customer_email = Column(String(255), nullable=True)
    delivery_address = Column(Text, nullable=True)
    
    # Order status and timing
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    order_time = Column(DateTime, default=datetime.utcnow)
    kitchen_time = Column(DateTime, nullable=True)
    ready_time = Column(DateTime, nullable=True)
    served_time = Column(DateTime, nullable=True)
    completed_time = Column(DateTime, nullable=True)
    
    # Financial details
    subtotal = Column(Numeric(10, 2), nullable=False, default=0)
    tax_amount = Column(Numeric(10, 2), nullable=False, default=0)
    tip_amount = Column(Numeric(10, 2), nullable=False, default=0)
    discount_amount = Column(Numeric(10, 2), nullable=False, default=0)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0)
    
    # Payment
    payment_method = Column(Enum(PaymentMethod), nullable=True)
    payment_status = Column(String(50), default="pending")  # pending, paid, refunded, failed
    payment_reference = Column(String(255), nullable=True)
    
    # Special instructions
    special_instructions = Column(Text, nullable=True)
    dietary_notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="orders")
    table = relationship("Table", back_populates="orders")
    server = relationship("Staff", back_populates="orders_served", foreign_keys=[server_id])
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """Individual items within an order"""
    __tablename__ = "order_items"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(String(36), ForeignKey("menu_items.id"), nullable=True)
    
    # Item details
    item_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    # Customizations
    modifications = Column(JSON, nullable=True)  # Extra cheese, no onions, etc.
    special_instructions = Column(Text, nullable=True)
    
    # Kitchen status
    kitchen_status = Column(String(50), default="pending")  # pending, preparing, ready, served
    kitchen_notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    menu_item = relationship("MenuItem")


class Transaction(Base):
    """Financial transaction records"""
    __tablename__ = "transactions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=True)
    
    # Transaction details
    transaction_type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="USD")
    
    # Payment details
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    payment_reference = Column(String(255), nullable=True)
    payment_processor = Column(String(100), nullable=True)  # stripe, square, etc.
    
    # Status
    status = Column(String(50), default="completed")  # pending, completed, failed, refunded
    processed_at = Column(DateTime, default=datetime.utcnow)
    
    # Additional information
    description = Column(Text, nullable=True)
    transaction_metadata = Column(JSON, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="transactions")
    order = relationship("Order", back_populates="transactions")


class FinancialRecord(Base):
    """Daily financial summary and reporting"""
    __tablename__ = "financial_records"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Date and period
    record_date = Column(DateTime, nullable=False)
    period_type = Column(String(20), default="daily")  # daily, weekly, monthly
    
    # Revenue metrics
    gross_revenue = Column(Numeric(12, 2), default=0)
    net_revenue = Column(Numeric(12, 2), default=0)
    tax_collected = Column(Numeric(10, 2), default=0)
    tips_collected = Column(Numeric(10, 2), default=0)
    discounts_given = Column(Numeric(10, 2), default=0)
    refunds_issued = Column(Numeric(10, 2), default=0)
    
    # Cost metrics
    food_costs = Column(Numeric(10, 2), default=0)
    labor_costs = Column(Numeric(10, 2), default=0)
    overhead_costs = Column(Numeric(10, 2), default=0)
    total_costs = Column(Numeric(12, 2), default=0)
    
    # Operational metrics
    total_orders = Column(Integer, default=0)
    total_customers = Column(Integer, default=0)
    average_order_value = Column(Numeric(10, 2), default=0)
    table_turnover_rate = Column(Float, default=0)
    
    # Payment method breakdown
    cash_sales = Column(Numeric(10, 2), default=0)
    card_sales = Column(Numeric(10, 2), default=0)
    digital_wallet_sales = Column(Numeric(10, 2), default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="financial_records")
