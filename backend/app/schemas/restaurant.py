"""
BiteBase Intelligence Restaurant Schemas
Pydantic models for API request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid


class LocationData(BaseModel):
    """Geographic location data"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    address: str = Field(..., min_length=1, max_length=500, description="Full address")
    city: str = Field(..., min_length=1, max_length=100, description="City name")
    area: Optional[str] = Field(None, max_length=100, description="Area/neighborhood")
    country: str = Field(..., min_length=1, max_length=100, description="Country name")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal/ZIP code")


class RestaurantBase(BaseModel):
    """Base restaurant data"""
    name: str = Field(..., min_length=1, max_length=255, description="Restaurant name")
    brand: Optional[str] = Field(None, max_length=255, description="Brand/chain name")
    cuisine_types: List[str] = Field(..., min_items=1, description="List of cuisine types")
    category: str = Field(..., description="Restaurant category")
    price_range: Optional[str] = Field(None, pattern=r"^\$+$", description="Price range ($, $$, $$$, $$$$)")
    
    # Contact information
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    email: Optional[str] = Field(None, max_length=255, description="Email address")
    website: Optional[str] = Field(None, max_length=500, description="Website URL")
    
    # Business details
    seating_capacity: Optional[int] = Field(None, ge=1, description="Seating capacity")
    
    @validator('category')
    def validate_category(cls, v):
        allowed_categories = ['fast-food', 'casual-dining', 'fine-dining', 'cafe', 'food-truck', 'bakery']
        if v not in allowed_categories:
            raise ValueError(f'Category must be one of: {", ".join(allowed_categories)}')
        return v
    
    @validator('cuisine_types')
    def validate_cuisine_types(cls, v):
        if not v:
            raise ValueError('At least one cuisine type is required')
        return [cuisine.strip().lower() for cuisine in v]


class RestaurantCreate(RestaurantBase):
    """Schema for creating a new restaurant"""
    location: LocationData = Field(..., description="Restaurant location data")
    opening_date: Optional[datetime] = Field(None, description="Restaurant opening date")


class RestaurantUpdate(BaseModel):
    """Schema for updating restaurant data"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    brand: Optional[str] = Field(None, max_length=255)
    cuisine_types: Optional[List[str]] = Field(None, min_items=1)
    category: Optional[str] = None
    price_range: Optional[str] = Field(None, pattern=r"^\$+$")
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=500)
    seating_capacity: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None
    
    @validator('category')
    def validate_category(cls, v):
        if v is not None:
            allowed_categories = ['fast-food', 'casual-dining', 'fine-dining', 'cafe', 'food-truck', 'bakery']
            if v not in allowed_categories:
                raise ValueError(f'Category must be one of: {", ".join(allowed_categories)}')
        return v


class RestaurantResponse(RestaurantBase):
    """Schema for restaurant API responses"""
    id: uuid.UUID = Field(..., description="Restaurant unique identifier")
    location: LocationData = Field(..., description="Restaurant location data")
    
    # Status and metrics
    is_active: bool = Field(..., description="Restaurant active status")
    average_rating: Optional[float] = Field(None, ge=0, le=5, description="Average customer rating")
    total_reviews: int = Field(0, ge=0, description="Total number of reviews")
    
    # Business metrics
    estimated_revenue: Optional[float] = Field(None, ge=0, description="Estimated annual revenue")
    employee_count: Optional[int] = Field(None, ge=0, description="Number of employees")
    
    # Metadata
    data_source: Optional[str] = Field(None, description="Source of restaurant data")
    data_quality_score: float = Field(0.0, ge=0, le=1, description="Data quality score")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Optional distance field (for nearby searches)
    distance_km: Optional[float] = Field(None, ge=0, description="Distance in kilometers")
    
    class Config:
        from_attributes = True


class RestaurantSearchParams(BaseModel):
    """Parameters for restaurant search"""
    query: Optional[str] = Field(None, max_length=255, description="Search query")
    city: Optional[str] = Field(None, max_length=100, description="Filter by city")
    cuisine: Optional[str] = Field(None, max_length=100, description="Filter by cuisine")
    category: Optional[str] = Field(None, description="Filter by category")
    brand: Optional[str] = Field(None, max_length=255, description="Filter by brand")
    min_rating: Optional[float] = Field(None, ge=0, le=5, description="Minimum rating")
    max_distance_km: Optional[float] = Field(None, ge=0, le=100, description="Maximum distance")
    price_range: Optional[str] = Field(None, pattern=r"^\$+$", description="Price range filter")
    
    # Location-based search
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Search center latitude")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Search center longitude")
    
    # Pagination
    skip: int = Field(0, ge=0, description="Number of records to skip")
    limit: int = Field(50, ge=1, le=500, description="Maximum number of results")
    
    # Sorting
    sort_by: Optional[str] = Field("name", description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class RestaurantListResponse(BaseModel):
    """Response schema for restaurant list endpoints"""
    restaurants: List[RestaurantResponse] = Field(..., description="List of restaurants")
    total: int = Field(..., ge=0, description="Total number of matching restaurants")
    skip: int = Field(..., ge=0, description="Number of records skipped")
    limit: int = Field(..., ge=1, description="Maximum number of results requested")
    has_more: bool = Field(..., description="Whether more results are available")
    
    @validator('has_more', always=True)
    def calculate_has_more(cls, v, values):
        if 'total' in values and 'skip' in values and 'limit' in values:
            return values['skip'] + values['limit'] < values['total']
        return False


class MenuItemBase(BaseModel):
    """Base menu item data"""
    name: str = Field(..., min_length=1, max_length=255, description="Menu item name")
    description: Optional[str] = Field(None, max_length=1000, description="Item description")
    category: str = Field(..., min_length=1, max_length=100, description="Menu category")
    price: float = Field(..., ge=0, description="Item price")
    currency: str = Field("USD", min_length=3, max_length=3, description="Currency code")
    
    # Availability
    is_available: bool = Field(True, description="Item availability status")
    
    # Dietary information
    is_vegetarian: bool = Field(False, description="Vegetarian option")
    is_vegan: bool = Field(False, description="Vegan option")
    is_gluten_free: bool = Field(False, description="Gluten-free option")
    allergens: Optional[List[str]] = Field(None, description="List of allergens")
    
    # Nutritional information
    calories: Optional[int] = Field(None, ge=0, description="Calorie content")
    nutritional_info: Optional[Dict[str, Any]] = Field(None, description="Detailed nutritional information")


class MenuItemCreate(MenuItemBase):
    """Schema for creating menu items"""
    restaurant_id: uuid.UUID = Field(..., description="Restaurant ID")


class MenuItemResponse(MenuItemBase):
    """Schema for menu item responses"""
    id: uuid.UUID = Field(..., description="Menu item unique identifier")
    restaurant_id: uuid.UUID = Field(..., description="Restaurant ID")
    popularity_score: float = Field(0.0, ge=0, le=1, description="Item popularity score")
    order_frequency: int = Field(0, ge=0, description="Order frequency")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True


class RestaurantReviewBase(BaseModel):
    """Base restaurant review data"""
    rating: float = Field(..., ge=1, le=5, description="Review rating (1-5)")
    review_text: Optional[str] = Field(None, max_length=5000, description="Review text")
    reviewer_name: Optional[str] = Field(None, max_length=255, description="Reviewer name")
    source_platform: str = Field(..., min_length=1, max_length=50, description="Review source platform")
    review_date: datetime = Field(..., description="Review date")


class RestaurantReviewResponse(RestaurantReviewBase):
    """Schema for review responses"""
    id: uuid.UUID = Field(..., description="Review unique identifier")
    restaurant_id: uuid.UUID = Field(..., description="Restaurant ID")
    sentiment_score: Optional[float] = Field(None, ge=-1, le=1, description="Sentiment analysis score")
    sentiment_label: Optional[str] = Field(None, description="Sentiment label")
    is_verified: bool = Field(False, description="Verified review status")
    helpful_votes: int = Field(0, ge=0, description="Number of helpful votes")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    class Config:
        from_attributes = True