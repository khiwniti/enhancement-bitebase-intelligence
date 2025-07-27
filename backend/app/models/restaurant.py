"""
BiteBase Intelligence Restaurant Models
Core data models for restaurant intelligence platform
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.core.database import Base


class Restaurant(Base):
    """Core restaurant model with geospatial data"""
    __tablename__ = "restaurants"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(255), nullable=True, index=True)
    
    # Location data
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False, index=True)
    area = Column(String(100), nullable=True, index=True)
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


class MenuItem(Base):
    """Restaurant menu items with pricing data"""
    __tablename__ = "menu_items"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    
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


class RestaurantReview(Base):
    """Restaurant reviews and ratings"""
    __tablename__ = "restaurant_reviews"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Review data
    rating = Column(Float, nullable=False)  # 1-5 scale
    review_text = Column(Text, nullable=True)
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