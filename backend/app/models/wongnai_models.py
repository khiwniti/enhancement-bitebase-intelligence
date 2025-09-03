"""
Wongnai Data Models
Database models for storing Wongnai business and menu data locally
"""
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.database import Base

class WongnaiRestaurant(Base):
    """Model for storing Wongnai restaurant data"""
    __tablename__ = "wongnai_restaurants"
    
    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    cuisine_type = Column(String(100))
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    price_level = Column(Integer, default=1)  # 1-4 scale
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text)
    phone = Column(String(20))
    opening_hours = Column(JSON)  # Store opening hours as JSON
    delivery_available = Column(Boolean, default=False)
    image_url = Column(String(500))
    wongnai_url = Column(String(500))
    tags = Column(JSON)  # Store tags as JSON array
    distance = Column(Float, default=0)  # Distance from search point
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_menu_sync = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    menu_items = relationship("WongnaiMenuItem", back_populates="restaurant", cascade="all, delete-orphan")
    menu_analysis = relationship("WongnaiMenuAnalysis", back_populates="restaurant", uselist=False)

class WongnaiMenuItem(Base):
    """Model for storing individual menu items from Wongnai"""
    __tablename__ = "wongnai_menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("wongnai_restaurants.id"), nullable=False)
    dish_id = Column(String(100))  # Original dish ID from Wongnai
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(100))
    image_url = Column(String(500))
    available = Column(Boolean, default=True)
    popular = Column(Boolean, default=False)
    spicy_level = Column(Integer, default=0)  # 0-5 scale
    
    # Nutritional and dietary information
    ingredients = Column(JSON)  # Store as JSON array
    allergens = Column(JSON)   # Store as JSON array
    dietary_info = Column(JSON)  # vegetarian, vegan, halal, etc.
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("WongnaiRestaurant", back_populates="menu_items")

class WongnaiMenuAnalysis(Base):
    """Model for storing analyzed menu insights for each restaurant"""
    __tablename__ = "wongnai_menu_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("wongnai_restaurants.id"), nullable=False)
    
    # Basic metrics
    total_dishes = Column(Integer, default=0)
    categories = Column(JSON)  # List of menu categories
    price_range_min = Column(Float, default=0.0)
    price_range_max = Column(Float, default=0.0)
    price_range_average = Column(Float, default=0.0)
    
    # Cuisine analysis
    cuisine_categories = Column(JSON)  # Category distribution
    dietary_options = Column(JSON)     # Available dietary options
    spicy_dishes_count = Column(Integer, default=0)
    spicy_percentage = Column(Float, default=0.0)
    
    # Advanced insights
    signature_dishes = Column(JSON)     # Popular/recommended dishes
    value_dishes = Column(JSON)         # Best value dishes
    premium_dishes = Column(JSON)       # High-end dishes
    
    # Competition insights
    unique_dishes = Column(JSON)        # Dishes not commonly found elsewhere
    competitive_advantages = Column(JSON)  # What makes this restaurant special
    
    # AI-generated insights
    cuisine_description = Column(Text)   # AI-generated description of cuisine style
    target_audience = Column(JSON)       # Predicted target customer segments
    recommendations = Column(JSON)       # Personalized dish recommendations
    
    # Metadata
    analysis_date = Column(DateTime, default=datetime.utcnow)
    analysis_version = Column(String(20), default="1.0")
    
    # Relationships
    restaurant = relationship("WongnaiRestaurant", back_populates="menu_analysis")

class WongnaiSearchCache(Base):
    """Cache for Wongnai search results to improve performance"""
    __tablename__ = "wongnai_search_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    search_key = Column(String(200), unique=True, index=True, nullable=False)  # lat_lng_radius_cuisine hash
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius = Column(Float, nullable=False)
    cuisine_type = Column(String(100))
    
    # Cached results
    restaurant_ids = Column(JSON)  # List of restaurant IDs found in search
    total_results = Column(Integer, default=0)
    
    # Cache metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    hit_count = Column(Integer, default=0)
    
class WongnaiSyncLog(Base):
    """Log for tracking Wongnai data synchronization"""
    __tablename__ = "wongnai_sync_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    sync_type = Column(String(50), nullable=False)  # 'restaurants', 'menus', 'full'
    status = Column(String(20), nullable=False)     # 'started', 'completed', 'failed'
    
    # Sync details
    total_items = Column(Integer, default=0)
    processed_items = Column(Integer, default=0)
    failed_items = Column(Integer, default=0)
    error_message = Column(Text)
    
    # Location context (if applicable)
    latitude = Column(Float)
    longitude = Column(Float)
    radius = Column(Float)
    
    # Timing
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    duration_seconds = Column(Float)
    
    # Results
    sync_results = Column(JSON)  # Detailed results and statistics