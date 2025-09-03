"""
BiteBase Intelligence Restaurant API Endpoints
Restaurant data management and retrieval
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
# from geoalchemy2.functions import ST_DWithin, ST_GeogFromText, ST_Distance  # Disabled for SQLite
from typing import List, Optional
import uuid
import math

from app.core.database import get_db
from app.models.restaurant import Restaurant, MenuItem, RestaurantReview
from app.schemas.restaurant import (
    RestaurantResponse, RestaurantCreate, RestaurantUpdate,
    RestaurantSearchParams, RestaurantListResponse, LocationData
)
from app.services.restaurant.restaurant_service import RestaurantService

router = APIRouter()


def restaurant_to_response(restaurant: Restaurant, distance_km: Optional[float] = None) -> RestaurantResponse:
    """Convert Restaurant model to RestaurantResponse schema"""
    import json
    
    # Parse cuisine_types if it's a JSON string
    cuisine_types = restaurant.cuisine_types
    if isinstance(cuisine_types, str):
        try:
            cuisine_types = json.loads(cuisine_types)
        except:
            cuisine_types = [cuisine_types]
    
    location_data = LocationData(
        latitude=restaurant.latitude,
        longitude=restaurant.longitude,
        address=restaurant.address,
        city=restaurant.city,
        area=restaurant.area,
        country=restaurant.country,
        postal_code=restaurant.postal_code
    )
    
    return RestaurantResponse(
        id=restaurant.id,
        name=restaurant.name,
        brand=restaurant.brand,
        location=location_data,
        cuisine_types=cuisine_types,
        category=restaurant.category,
        price_range=restaurant.price_range,
        phone=restaurant.phone,
        email=restaurant.email,
        website=restaurant.website,
        seating_capacity=restaurant.seating_capacity,
        is_active=restaurant.is_active,
        average_rating=restaurant.average_rating,
        total_reviews=restaurant.total_reviews or 0,
        estimated_revenue=restaurant.estimated_revenue,
        employee_count=restaurant.employee_count,
        data_source=restaurant.data_source,
        data_quality_score=restaurant.data_quality_score or 0.0,
        created_at=restaurant.created_at,
        updated_at=restaurant.updated_at,
        distance_km=distance_km
    )


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return 6371 * c  # Earth's radius in km


@router.get("/", response_model=RestaurantListResponse)
async def get_restaurants(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    city: Optional[str] = Query(None, description="Filter by city"),
    area: Optional[str] = Query(None, description="Filter by area/district"),
    cuisine: Optional[str] = Query(None, description="Filter by cuisine type"),
    category: Optional[str] = Query(None, description="Filter by restaurant category"),
    brand: Optional[str] = Query(None, description="Filter by brand/chain"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum average rating"),
    is_active: bool = Query(True, description="Filter by active status"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get restaurants with optional filtering and pagination
    """
    try:
        # Build query with filters
        query = select(Restaurant).where(Restaurant.is_active == is_active)
        
        if city:
            query = query.where(Restaurant.city.ilike(f"%{city}%"))
        
        if area:
            query = query.where(Restaurant.area.ilike(f"%{area}%"))
        
        if cuisine:
            query = query.where(Restaurant.cuisine_types.like(f'%"{cuisine}"%'))
        
        if category:
            query = query.where(Restaurant.category == category)
        
        if brand:
            query = query.where(Restaurant.brand.ilike(f"%{brand}%"))
        
        if min_rating:
            query = query.where(Restaurant.average_rating >= min_rating)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute query
        result = await db.execute(query)
        restaurants = result.scalars().all()
        
        return RestaurantListResponse(
            restaurants=[restaurant_to_response(r) for r in restaurants],
            total=total,
            skip=skip,
            limit=limit,
            has_more=skip + limit < total
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving restaurants: {str(e)}")


@router.get("/nearby/", response_model=RestaurantListResponse)
async def get_nearby_restaurants(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude coordinate"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude coordinate"),
    radius_km: float = Query(5.0, ge=0.1, le=50, description="Search radius in kilometers"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of results"),
    cuisine: Optional[str] = Query(None, description="Filter by cuisine type"),
    category: Optional[str] = Query(None, description="Filter by restaurant category"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum average rating"),
    db: AsyncSession = Depends(get_db)
):
    """
    Find restaurants within a specified radius of a location
    """
    try:
        # Build base query for active restaurants
        query = select(Restaurant).where(Restaurant.is_active == True)
        
        # Apply additional filters
        if cuisine:
            query = query.where(Restaurant.cuisine_types.like(f'%"{cuisine}"%'))
        
        if category:
            query = query.where(Restaurant.category == category)
        
        if min_rating:
            query = query.where(Restaurant.average_rating >= min_rating)
        
        # Execute query
        result = await db.execute(query)
        all_restaurants = result.scalars().all()
        
        # Filter by distance and calculate distances
        restaurants_with_distance = []
        for restaurant in all_restaurants:
            distance_km = calculate_distance(
                latitude, longitude,
                restaurant.latitude, restaurant.longitude
            )
            if distance_km <= radius_km:
                restaurants_with_distance.append((restaurant, distance_km))
        
        # Sort by distance and limit results
        restaurants_with_distance.sort(key=lambda x: x[1])
        restaurants_with_distance = restaurants_with_distance[:limit]
        
        # Extract restaurants and add distance information
        restaurants_list = []
        for restaurant, distance_km in restaurants_with_distance:
            restaurant_data = restaurant_to_response(restaurant, distance_km=round(distance_km, 2))
            restaurants_list.append(restaurant_data)
        
        return RestaurantListResponse(
            restaurants=restaurants_list,
            total=len(restaurants_list),
            skip=0,
            limit=limit,
            has_more=False  # Since we're limiting results, no pagination for nearby search
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding nearby restaurants: {str(e)}")


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(
    restaurant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific restaurant by ID
    """
    try:
        query = select(Restaurant).where(Restaurant.id == restaurant_id)
        result = await db.execute(query)
        restaurant = result.scalar_one_or_none()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        return restaurant_to_response(restaurant)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving restaurant: {str(e)}")




@router.post("/", response_model=RestaurantResponse)
async def create_restaurant(
    restaurant_data: RestaurantCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new restaurant
    """
    try:
        restaurant_service = RestaurantService(db)
        restaurant = await restaurant_service.create_restaurant(restaurant_data)
        return restaurant_to_response(restaurant)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating restaurant: {str(e)}")


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: uuid.UUID,
    restaurant_data: RestaurantUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing restaurant
    """
    try:
        restaurant_service = RestaurantService(db)
        restaurant = await restaurant_service.update_restaurant(restaurant_id, restaurant_data)
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        return restaurant_to_response(restaurant)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating restaurant: {str(e)}")


@router.delete("/{restaurant_id}")
async def delete_restaurant(
    restaurant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a restaurant (soft delete by setting is_active=False)
    """
    try:
        restaurant_service = RestaurantService(db)
        success = await restaurant_service.delete_restaurant(restaurant_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        return {"message": "Restaurant deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting restaurant: {str(e)}")


@router.get("/{restaurant_id}/menu", response_model=List[dict])
async def get_restaurant_menu(
    restaurant_id: uuid.UUID,
    category: Optional[str] = Query(None, description="Filter by menu category"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get menu items for a specific restaurant
    """
    try:
        # Verify restaurant exists
        restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
        restaurant_result = await db.execute(restaurant_query)
        restaurant = restaurant_result.scalar_one_or_none()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Get menu items
        menu_query = select(MenuItem).where(MenuItem.restaurant_id == restaurant_id)
        
        if category:
            menu_query = menu_query.where(MenuItem.category.ilike(f"%{category}%"))
        
        menu_query = menu_query.order_by(MenuItem.category, MenuItem.name)
        
        result = await db.execute(menu_query)
        menu_items = result.scalars().all()
        
        return [
            {
                "id": str(item.id),
                "name": item.name,
                "description": item.description,
                "category": item.category,
                "price": item.price,
                "currency": item.currency,
                "is_available": item.is_available,
                "is_vegetarian": item.is_vegetarian,
                "is_vegan": item.is_vegan,
                "is_gluten_free": item.is_gluten_free,
                "calories": item.calories,
                "popularity_score": item.popularity_score
            }
            for item in menu_items
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving menu: {str(e)}")


@router.get("/{restaurant_id}/reviews", response_model=List[dict])
async def get_restaurant_reviews(
    restaurant_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    min_rating: Optional[float] = Query(None, ge=1, le=5),
    source_platform: Optional[str] = Query(None, description="Filter by review source"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get reviews for a specific restaurant
    """
    try:
        # Verify restaurant exists
        restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
        restaurant_result = await db.execute(restaurant_query)
        restaurant = restaurant_result.scalar_one_or_none()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Get reviews
        reviews_query = select(RestaurantReview).where(RestaurantReview.restaurant_id == restaurant_id)
        
        if min_rating:
            reviews_query = reviews_query.where(RestaurantReview.rating >= min_rating)
        
        if source_platform:
            reviews_query = reviews_query.where(RestaurantReview.source_platform.ilike(f"%{source_platform}%"))
        
        reviews_query = reviews_query.order_by(RestaurantReview.review_date.desc()).offset(skip).limit(limit)
        
        result = await db.execute(reviews_query)
        reviews = result.scalars().all()
        
        return [
            {
                "id": str(review.id),
                "rating": review.rating,
                "review_text": review.review_text,
                "reviewer_name": review.reviewer_name,
                "source_platform": review.source_platform,
                "review_date": review.review_date.isoformat(),
                "sentiment_score": review.sentiment_score,
                "sentiment_label": review.sentiment_label,
                "is_verified": review.is_verified,
                "helpful_votes": review.helpful_votes
            }
            for review in reviews
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving reviews: {str(e)}")