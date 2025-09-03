"""
Market Research Models for BiteBase Intelligence
Models for storing market research data and competitor analysis
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from app.core.database import Base


class CuisineType(str, enum.Enum):
    """Cuisine type enumeration"""
    THAI = "thai"
    ITALIAN = "italian"
    JAPANESE = "japanese"
    CHINESE = "chinese"
    INDIAN = "indian"
    MEXICAN = "mexican"
    FRENCH = "french"
    AMERICAN = "american"
    MEDITERRANEAN = "mediterranean"
    KOREAN = "korean"
    VIETNAMESE = "vietnamese"
    FUSION = "fusion"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    SEAFOOD = "seafood"
    STEAKHOUSE = "steakhouse"
    CAFE = "cafe"
    BAKERY = "bakery"
    FAST_FOOD = "fast_food"
    FINE_DINING = "fine_dining"


class BusinessType(str, enum.Enum):
    """Business type enumeration"""
    RESTAURANT = "restaurant"
    CAFE = "cafe"
    BAR = "bar"
    FAST_FOOD = "fast_food"
    FOOD_TRUCK = "food_truck"
    CATERING = "catering"
    BAKERY = "bakery"
    FOOD_COURT = "food_court"


class PriceRange(str, enum.Enum):
    """Price range enumeration"""
    LOW = "$"
    MEDIUM = "$$"
    HIGH = "$$$"
    PREMIUM = "$$$$"


class Restaurant(Base):
    """Restaurant model for storing competitor and market data"""
    __tablename__ = "restaurants"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    
    # Location data
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Business information
    cuisine_type = Column(Enum(CuisineType), nullable=False)
    business_type = Column(Enum(BusinessType), nullable=False)
    price_range = Column(Enum(PriceRange), nullable=False)
    
    # Ratings and reviews
    rating = Column(Float, nullable=True)
    review_count = Column(Integer, default=0)
    
    # Business metrics
    estimated_revenue = Column(Float, nullable=True)
    seating_capacity = Column(Integer, nullable=True)
    staff_count = Column(Integer, nullable=True)
    
    # Operating information
    phone = Column(String(20), nullable=True)
    website = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    
    # Business hours (JSON format)
    operating_hours = Column(JSON, nullable=True)
    
    # Features and amenities
    features = Column(JSON, nullable=True)  # ["wifi", "parking", "delivery", etc.]
    
    # Social media
    social_media = Column(JSON, nullable=True)
    
    # External IDs
    geoapify_id = Column(String(100), nullable=True)
    google_place_id = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    market_analyses = relationship("MarketAnalysis", back_populates="location_restaurants")
    
    def __repr__(self):
        return f"<Restaurant(id={self.id}, name={self.name}, cuisine={self.cuisine_type})>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "country": self.country,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "district": self.district,
            "cuisine_type": self.cuisine_type.value if self.cuisine_type else None,
            "business_type": self.business_type.value if self.business_type else None,
            "price_range": self.price_range.value if self.price_range else None,
            "rating": self.rating,
            "review_count": self.review_count,
            "estimated_revenue": self.estimated_revenue,
            "seating_capacity": self.seating_capacity,
            "phone": self.phone,
            "website": self.website,
            "operating_hours": self.operating_hours,
            "features": self.features,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class MarketAnalysis(Base):
    """Market analysis model for storing research results"""
    __tablename__ = "market_analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Analysis parameters
    location = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius = Column(Float, default=5.0)  # km
    cuisine_type = Column(Enum(CuisineType), nullable=False)
    business_type = Column(Enum(BusinessType), nullable=False)
    budget_range = Column(String(20), nullable=False)
    target_audience = Column(String(50), nullable=False)
    
    # Analysis results
    total_competitors = Column(Integer, default=0)
    competition_density = Column(Float, default=0.0)
    average_rating = Column(Float, default=0.0)
    average_price_range = Column(String(10), nullable=True)
    market_potential = Column(Float, default=0.0)
    foot_traffic_score = Column(Integer, default=0)
    accessibility_score = Column(Integer, default=0)
    
    # Detailed analysis (JSON)
    competitor_analysis = Column(JSON, nullable=True)
    market_insights = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    location_restaurants = relationship("Restaurant", back_populates="market_analyses")
    
    def __repr__(self):
        return f"<MarketAnalysis(id={self.id}, location={self.location}, cuisine={self.cuisine_type})>"


class Location(Base):
    """Location model for storing popular analysis locations"""
    __tablename__ = "locations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    
    # Geographic data
    formatted_address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Location type and characteristics
    location_type = Column(String(50), nullable=False)  # Business District, Residential, etc.
    population_density = Column(Integer, nullable=True)
    average_income = Column(Float, nullable=True)
    
    # Market metrics
    market_potential = Column(Float, default=0.0)
    competition_level = Column(String(20), default="Medium")
    foot_traffic = Column(Integer, default=75)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Location(id={self.id}, name={self.name}, city={self.city})>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "formatted_address": self.formatted_address,
            "city": self.city,
            "country": self.country,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "type": self.location_type,
            "market_potential": self.market_potential,
            "competition_level": self.competition_level,
            "foot_traffic": self.foot_traffic,
        }