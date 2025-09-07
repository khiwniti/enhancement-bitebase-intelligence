"""
BiteBase Intelligence Restaurant Models
Core data models for restaurant intelligence platform
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
import enum

from app.core.database import Base


# Enums for restaurant management
class StaffRole(enum.Enum):
    OWNER = "owner"
    MANAGER = "manager"
    CHEF = "chef"
    SOUS_CHEF = "sous_chef"
    COOK = "cook"
    SERVER = "server"
    BARTENDER = "bartender"
    HOST = "host"
    CASHIER = "cashier"
    CLEANER = "cleaner"
    DELIVERY = "delivery"


class EmploymentStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TERMINATED = "terminated"
    ON_LEAVE = "on_leave"


class OrderStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TableStatus(enum.Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    CLEANING = "cleaning"
    OUT_OF_ORDER = "out_of_order"


class PaymentMethod(enum.Enum):
    CASH = "cash"
    CARD = "card"
    DIGITAL_WALLET = "digital_wallet"
    BANK_TRANSFER = "bank_transfer"
    GIFT_CARD = "gift_card"


class TransactionType(enum.Enum):
    SALE = "sale"
    REFUND = "refund"
    DISCOUNT = "discount"
    TAX = "tax"
    TIP = "tip"


class Restaurant(Base):
    """Core restaurant model with geospatial data"""
    __tablename__ = "restaurants"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    name_th = Column(String(255), nullable=True, index=True)  # Thai restaurant name
    brand = Column(String(255), nullable=True, index=True)
    brand_th = Column(String(255), nullable=True, index=True)  # Thai brand name
    
    # Location data
    address = Column(Text, nullable=False)
    address_th = Column(Text, nullable=True)  # Thai address
    city = Column(String(100), nullable=False, index=True)
    city_th = Column(String(100), nullable=True, index=True)  # Thai city name
    area = Column(String(100), nullable=True, index=True)
    area_th = Column(String(100), nullable=True, index=True)  # Thai area name
    country = Column(String(100), nullable=False, index=True)
    postal_code = Column(String(20), nullable=True)
    
    # Geospatial data (simplified for SQLite)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    
    # Restaurant details (using JSON for SQLite compatibility)
    cuisine_types = Column(JSON, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # fast-food, casual-dining, fine-dining, cafe
    price_range = Column(String(10), nullable=True)  # $, $$, $$$, $$$$
    
    # Contact information
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    
    # Operating status
    is_active = Column(Boolean, default=True, index=True)
    opening_date = Column(DateTime, nullable=True)
    closing_date = Column(DateTime, nullable=True)
    
    # Ratings and reviews
    average_rating = Column(Float, nullable=True)
    total_reviews = Column(Integer, default=0)
    
    # Business metrics
    estimated_revenue = Column(Float, nullable=True)
    employee_count = Column(Integer, nullable=True)
    seating_capacity = Column(Integer, nullable=True)
    
    # Metadata
    data_source = Column(String(100), nullable=True)
    data_quality_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")
    reviews = relationship("RestaurantReview", back_populates="restaurant", cascade="all, delete-orphan")
    analytics = relationship("RestaurantAnalytics", back_populates="restaurant", cascade="all, delete-orphan")
    staff = relationship("Staff", back_populates="restaurant", cascade="all, delete-orphan")
    inventory_items = relationship("InventoryItem", back_populates="restaurant", cascade="all, delete-orphan")
    tables = relationship("Table", back_populates="restaurant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="restaurant", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="restaurant", cascade="all, delete-orphan")
    financial_records = relationship("FinancialRecord", back_populates="restaurant", cascade="all, delete-orphan")

    # Campaign Management relationships
    campaigns = relationship("Campaign", back_populates="restaurant", cascade="all, delete-orphan")

    # POS Integration relationships
    pos_integrations = relationship("POSIntegration", back_populates="restaurant", cascade="all, delete-orphan")

    # 4P Framework relationships
    # Product Intelligence
    ingredient_costs = relationship("IngredientCost", back_populates="restaurant", cascade="all, delete-orphan")
    menu_item_costs = relationship("MenuItemCost", back_populates="restaurant", cascade="all, delete-orphan")
    pricing_history = relationship("PricingHistory", back_populates="restaurant", cascade="all, delete-orphan")
    seasonal_trends = relationship("SeasonalTrend", back_populates="restaurant", cascade="all, delete-orphan")

    # Place Intelligence
    customer_locations = relationship("CustomerLocation", back_populates="restaurant", cascade="all, delete-orphan")
    delivery_hotspots = relationship("DeliveryHotspot", back_populates="restaurant", cascade="all, delete-orphan")
    traffic_patterns = relationship("TrafficPattern", back_populates="restaurant", cascade="all, delete-orphan")

    # Price Intelligence
    forecast_models = relationship("ForecastModel", back_populates="restaurant", cascade="all, delete-orphan")
    revenue_forecasts = relationship("RevenueForecast", back_populates="restaurant", cascade="all, delete-orphan")
    customer_spending_patterns = relationship("CustomerSpendingPattern", back_populates="restaurant", cascade="all, delete-orphan")
    price_elasticity_data = relationship("PriceElasticity", back_populates="restaurant", cascade="all, delete-orphan")
    revenue_optimizations = relationship("RevenueOptimization", back_populates="restaurant", cascade="all, delete-orphan")

    # Promotion Intelligence
    customer_segments = relationship("CustomerSegment", back_populates="restaurant", cascade="all, delete-orphan")
    customer_segment_assignments = relationship("CustomerSegmentAssignment", back_populates="restaurant", cascade="all, delete-orphan")

    # Insights Intelligence
    insights = relationship("Insight", back_populates="restaurant", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="restaurant", cascade="all, delete-orphan")
    automated_campaigns = relationship("AutomatedCampaign", back_populates="restaurant", cascade="all, delete-orphan")
    loyalty_programs = relationship("LoyaltyProgram", back_populates="restaurant", cascade="all, delete-orphan")
    loyalty_transactions = relationship("LoyaltyTransaction", back_populates="restaurant", cascade="all, delete-orphan")


class MenuItem(Base):
    """Restaurant menu items with pricing data"""
    __tablename__ = "menu_items"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    name = Column(String(255), nullable=False, index=True)
    name_th = Column(String(255), nullable=True, index=True)  # Thai menu item name
    description = Column(Text, nullable=True)
    description_th = Column(Text, nullable=True)  # Thai description
    category = Column(String(100), nullable=False, index=True)
    category_th = Column(String(100), nullable=True, index=True)  # Thai category name
    
    # Pricing
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    
    # Availability
    is_available = Column(Boolean, default=True)
    availability_schedule = Column(JSON, nullable=True)  # Time-based availability
    
    # Nutritional information
    calories = Column(Integer, nullable=True)
    nutritional_info = Column(JSON, nullable=True)
    
    # Dietary information
    is_vegetarian = Column(Boolean, default=False)
    is_vegan = Column(Boolean, default=False)
    is_gluten_free = Column(Boolean, default=False)
    allergens = Column(JSON, nullable=True)
    
    # Popularity metrics
    popularity_score = Column(Float, default=0.0)
    order_frequency = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="menu_items")

    # Product Intelligence relationships
    ingredients = relationship("MenuItemIngredient", back_populates="menu_item", cascade="all, delete-orphan")
    cost_analysis = relationship("MenuItemCost", back_populates="menu_item", uselist=False, cascade="all, delete-orphan")
    pricing_history = relationship("PricingHistory", back_populates="menu_item", cascade="all, delete-orphan")
    seasonal_trends = relationship("SeasonalTrend", back_populates="menu_item", cascade="all, delete-orphan")
    price_elasticity_data = relationship("PriceElasticity", back_populates="menu_item", cascade="all, delete-orphan")


class RestaurantReview(Base):
    """Restaurant reviews and ratings"""
    __tablename__ = "restaurant_reviews"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Review data
    rating = Column(Float, nullable=False)  # 1-5 scale
    review_text = Column(Text, nullable=True)
    review_text_th = Column(Text, nullable=True)  # Thai review text
    reviewer_name = Column(String(255), nullable=True)
    
    # Source information
    source_platform = Column(String(50), nullable=False)  # google, yelp, facebook, etc.
    source_id = Column(String(255), nullable=True)  # External review ID
    source_url = Column(String(500), nullable=True)
    
    # Sentiment analysis
    sentiment_score = Column(Float, nullable=True)  # -1 to 1
    sentiment_label = Column(String(20), nullable=True)  # positive, negative, neutral
    
    # Review metadata
    review_date = Column(DateTime, nullable=False)
    is_verified = Column(Boolean, default=False)
    helpful_votes = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="reviews")


class RestaurantAnalytics(Base):
    """Restaurant performance analytics and metrics"""
    __tablename__ = "restaurant_analytics"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Time period
    date = Column(DateTime, nullable=False, index=True)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly
    
    # Performance metrics
    estimated_revenue = Column(Float, nullable=True)
    estimated_customers = Column(Integer, nullable=True)
    average_order_value = Column(Float, nullable=True)
    
    # Online presence metrics
    website_visits = Column(Integer, nullable=True)
    social_media_mentions = Column(Integer, nullable=True)
    online_orders = Column(Integer, nullable=True)
    
    # Review metrics
    new_reviews = Column(Integer, default=0)
    average_rating_period = Column(Float, nullable=True)
    sentiment_score_period = Column(Float, nullable=True)
    
    # Competitive metrics
    market_share_estimate = Column(Float, nullable=True)
    competitive_position = Column(Integer, nullable=True)  # Ranking in local market
    
    # Location intelligence
    foot_traffic_estimate = Column(Integer, nullable=True)
    demographic_match_score = Column(Float, nullable=True)
    location_score = Column(Float, nullable=True)  # Overall location performance score
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="analytics")


class LocationAnalysis(Base):
    """Location intelligence and site analysis"""
    __tablename__ = "location_analyses"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Location data (simplified for SQLite)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    address = Column(Text, nullable=False)
    analysis_radius_km = Column(Float, default=1.0)
    
    # Analysis results
    location_score = Column(Float, nullable=False)  # 1-100 overall score
    demographic_score = Column(Float, nullable=False)
    competition_score = Column(Float, nullable=False)
    accessibility_score = Column(Float, nullable=False)
    market_potential_score = Column(Float, nullable=False)
    
    # Demographic data
    population_density = Column(Float, nullable=True)
    median_income = Column(Float, nullable=True)
    age_distribution = Column(JSON, nullable=True)
    household_composition = Column(JSON, nullable=True)
    
    # Competition analysis
    competitor_count = Column(Integer, default=0)
    competitor_density = Column(Float, nullable=True)
    market_saturation = Column(Float, nullable=True)
    competitive_threats = Column(JSON, nullable=True)
    
    # Market opportunity
    estimated_market_size = Column(Float, nullable=True)
    growth_potential = Column(Float, nullable=True)
    recommended_cuisine_types = Column(JSON, nullable=True)
    
    # Risk assessment
    risk_factors = Column(JSON, nullable=True)
    success_probability = Column(Float, nullable=True)
    
    # Analysis metadata
    analysis_date = Column(DateTime, default=datetime.utcnow)
    analyst_id = Column(String(36), nullable=True)  # User who requested analysis
    confidence_level = Column(Float, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Professional Restaurant Management Models

class Staff(Base):
    """Restaurant staff management"""
    __tablename__ = "staff"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)

    # Personal information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True, unique=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)

    # Employment details
    employee_id = Column(String(50), nullable=True, unique=True)
    role = Column(Enum(StaffRole), nullable=False)
    employment_status = Column(Enum(EmploymentStatus), default=EmploymentStatus.ACTIVE)
    hire_date = Column(DateTime, nullable=False)
    termination_date = Column(DateTime, nullable=True)

    # Compensation
    hourly_rate = Column(Numeric(10, 2), nullable=True)
    salary = Column(Numeric(10, 2), nullable=True)
    commission_rate = Column(Float, nullable=True)  # Percentage

    # Schedule and availability
    weekly_hours = Column(Integer, default=40)
    availability = Column(JSON, nullable=True)  # Weekly availability schedule

    # Performance metrics
    performance_rating = Column(Float, nullable=True)  # 1-5 scale
    total_sales = Column(Numeric(12, 2), default=0)
    customer_ratings = Column(Float, nullable=True)

    # Emergency contact
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="staff")
    shifts = relationship("Shift", back_populates="staff_member", cascade="all, delete-orphan")
    orders_served = relationship("Order", back_populates="server", foreign_keys="Order.server_id")


class Shift(Base):
    """Staff shift scheduling"""
    __tablename__ = "shifts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    staff_id = Column(String(36), ForeignKey("staff.id"), nullable=False)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)

    # Shift details
    shift_date = Column(DateTime, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    scheduled_hours = Column(Float, nullable=False)
    actual_hours = Column(Float, nullable=True)

    # Break information
    break_duration = Column(Integer, default=30)  # Minutes
    break_taken = Column(Boolean, default=False)

    # Performance during shift
    sales_generated = Column(Numeric(10, 2), default=0)
    orders_handled = Column(Integer, default=0)
    customer_feedback_score = Column(Float, nullable=True)

    # Status
    is_confirmed = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    staff_member = relationship("Staff", back_populates="shifts")
    restaurant = relationship("Restaurant")


class InventoryItem(Base):
    """Restaurant inventory management"""
    __tablename__ = "inventory_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)

    # Item details
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)  # ingredients, beverages, supplies, etc.
    sku = Column(String(100), nullable=True, unique=True)

    # Quantity and units
    current_quantity = Column(Float, nullable=False, default=0)
    unit_of_measure = Column(String(50), nullable=False)  # kg, liters, pieces, etc.
    minimum_quantity = Column(Float, nullable=False, default=0)  # Reorder threshold
    maximum_quantity = Column(Float, nullable=True)

    # Pricing
    unit_cost = Column(Numeric(10, 2), nullable=False)
    total_value = Column(Numeric(12, 2), nullable=True)  # current_quantity * unit_cost

    # Supplier information
    supplier_name = Column(String(255), nullable=True)
    supplier_contact = Column(String(255), nullable=True)
    supplier_product_code = Column(String(100), nullable=True)

    # Expiration and quality
    expiration_date = Column(DateTime, nullable=True)
    batch_number = Column(String(100), nullable=True)
    quality_grade = Column(String(50), nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    is_perishable = Column(Boolean, default=False)
    requires_refrigeration = Column(Boolean, default=False)

    # Metadata
    last_restocked = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="inventory_items")
    stock_movements = relationship("StockMovement", back_populates="inventory_item", cascade="all, delete-orphan")