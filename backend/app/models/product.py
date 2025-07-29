"""
Product Intelligence Models for BiteBase Intelligence
SQLAlchemy models for menu engineering, cost analysis, and pricing optimization
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Numeric, Index, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class IngredientCost(Base):
    """Ingredient cost tracking for food cost analysis"""
    __tablename__ = "ingredient_costs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ingredient_name = Column(String(255), nullable=False, index=True)
    cost_per_unit = Column(Numeric(10, 4), nullable=False)
    unit_type = Column(String(50), nullable=False)  # kg, lbs, liters, pieces, etc.
    supplier_id = Column(String(36), nullable=True)
    supplier_name = Column(String(255), nullable=True)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Cost tracking
    previous_cost = Column(Numeric(10, 4), nullable=True)
    cost_change_percentage = Column(Numeric(5, 2), nullable=True)
    last_price_update = Column(DateTime, nullable=True)
    
    # Quality and sourcing
    quality_grade = Column(String(20), nullable=True)  # A, B, C grade
    is_organic = Column(Boolean, default=False)
    is_local = Column(Boolean, default=False)
    seasonality_factor = Column(Numeric(3, 2), nullable=True)  # 0.5-2.0 multiplier
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="ingredient_costs")
    menu_item_ingredients = relationship("MenuItemIngredient", back_populates="ingredient_cost")
    seasonal_trends = relationship("SeasonalTrend", back_populates="ingredient_cost")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_ingredient_costs_restaurant_name', 'restaurant_id', 'ingredient_name'),
        Index('idx_ingredient_costs_updated', 'updated_at'),
    )


class MenuItemIngredient(Base):
    """Junction table for menu items and their ingredient costs"""
    __tablename__ = "menu_item_ingredients"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    menu_item_id = Column(String(36), ForeignKey("menu_items.id"), nullable=False)
    ingredient_cost_id = Column(String(36), ForeignKey("ingredient_costs.id"), nullable=False)
    
    # Quantity and usage
    quantity_used = Column(Numeric(8, 4), nullable=False)  # Amount used per serving
    unit_type = Column(String(50), nullable=False)
    waste_percentage = Column(Numeric(5, 2), default=0.05)  # 5% default waste
    
    # Cost calculations
    cost_per_serving = Column(Numeric(8, 4), nullable=False)
    is_primary_ingredient = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    menu_item = relationship("MenuItem", back_populates="ingredients")
    ingredient_cost = relationship("IngredientCost", back_populates="menu_item_ingredients")
    
    # Indexes
    __table_args__ = (
        Index('idx_menu_item_ingredients_item', 'menu_item_id'),
        Index('idx_menu_item_ingredients_cost', 'ingredient_cost_id'),
    )


class MenuItemCost(Base):
    """Comprehensive cost analysis for menu items"""
    __tablename__ = "menu_item_costs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    menu_item_id = Column(String(36), ForeignKey("menu_items.id"), nullable=False, unique=True)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Cost breakdown
    ingredient_cost = Column(Numeric(10, 2), nullable=False, default=0)
    labor_cost = Column(Numeric(10, 2), nullable=False, default=0)
    overhead_cost = Column(Numeric(10, 2), nullable=False, default=0)
    packaging_cost = Column(Numeric(10, 2), nullable=False, default=0)
    total_cost = Column(Numeric(10, 2), nullable=False)
    
    # Pricing and margins
    selling_price = Column(Numeric(10, 2), nullable=False)
    profit_margin = Column(Numeric(5, 2), nullable=False)  # Percentage
    profit_amount = Column(Numeric(10, 2), nullable=False)
    
    # Menu engineering classification
    classification = Column(String(20), nullable=True)  # star, dog, plow_horse, puzzle
    popularity_score = Column(Numeric(5, 2), nullable=True)  # 0-100
    profitability_score = Column(Numeric(5, 2), nullable=True)  # 0-100
    
    # Performance metrics
    food_cost_percentage = Column(Numeric(5, 2), nullable=True)  # Target: 28-35%
    contribution_margin = Column(Numeric(10, 2), nullable=True)
    break_even_quantity = Column(Integer, nullable=True)
    
    # Analysis metadata
    last_analysis_date = Column(DateTime, nullable=False)
    analysis_period_days = Column(Integer, default=30)
    confidence_level = Column(Numeric(3, 2), nullable=True)  # 0-1
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    menu_item = relationship("MenuItem", back_populates="cost_analysis")
    restaurant = relationship("Restaurant", back_populates="menu_item_costs")
    pricing_history = relationship("PricingHistory", back_populates="menu_item_cost")
    
    # Indexes
    __table_args__ = (
        Index('idx_menu_item_costs_restaurant', 'restaurant_id'),
        Index('idx_menu_item_costs_classification', 'classification'),
        Index('idx_menu_item_costs_analysis_date', 'last_analysis_date'),
    )


class PricingHistory(Base):
    """Track pricing changes and their impact"""
    __tablename__ = "pricing_history"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    menu_item_cost_id = Column(String(36), ForeignKey("menu_item_costs.id"), nullable=False)
    menu_item_id = Column(String(36), ForeignKey("menu_items.id"), nullable=False)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Pricing change details
    old_price = Column(Numeric(10, 2), nullable=False)
    new_price = Column(Numeric(10, 2), nullable=False)
    price_change_amount = Column(Numeric(10, 2), nullable=False)
    price_change_percentage = Column(Numeric(5, 2), nullable=False)
    
    # Change context
    reason = Column(String(255), nullable=True)
    change_type = Column(String(50), nullable=False)  # manual, automated, seasonal, cost_driven
    effective_date = Column(DateTime, nullable=False)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Impact tracking
    sales_before_change = Column(Integer, nullable=True)
    sales_after_change = Column(Integer, nullable=True)
    revenue_impact = Column(Numeric(12, 2), nullable=True)
    demand_elasticity = Column(Numeric(5, 4), nullable=True)  # Price elasticity coefficient
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    menu_item_cost = relationship("MenuItemCost", back_populates="pricing_history")
    menu_item = relationship("MenuItem", back_populates="pricing_history")
    restaurant = relationship("Restaurant", back_populates="pricing_history")
    created_by_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_pricing_history_item_date', 'menu_item_id', 'effective_date'),
        Index('idx_pricing_history_restaurant', 'restaurant_id'),
        Index('idx_pricing_history_effective_date', 'effective_date'),
    )


class SeasonalTrend(Base):
    """Track seasonal trends for menu items and ingredients"""
    __tablename__ = "seasonal_trends"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    menu_item_id = Column(String(36), ForeignKey("menu_items.id"), nullable=True)
    ingredient_cost_id = Column(String(36), ForeignKey("ingredient_costs.id"), nullable=True)
    
    # Seasonal data
    season = Column(String(20), nullable=False)  # spring, summer, fall, winter
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    
    # Trend metrics
    demand_multiplier = Column(Numeric(4, 3), nullable=False, default=1.0)  # 0.1-5.0
    cost_multiplier = Column(Numeric(4, 3), nullable=False, default=1.0)
    availability_score = Column(Numeric(3, 2), nullable=False, default=1.0)  # 0-1
    
    # Performance data
    sales_volume = Column(Integer, nullable=True)
    revenue_generated = Column(Numeric(12, 2), nullable=True)
    profit_margin_impact = Column(Numeric(5, 2), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="seasonal_trends")
    menu_item = relationship("MenuItem", back_populates="seasonal_trends")
    ingredient_cost = relationship("IngredientCost", back_populates="seasonal_trends")
    
    # Indexes
    __table_args__ = (
        Index('idx_seasonal_trends_restaurant_season', 'restaurant_id', 'season'),
        Index('idx_seasonal_trends_month_year', 'month', 'year'),
        Index('idx_seasonal_trends_item', 'menu_item_id'),
    )
