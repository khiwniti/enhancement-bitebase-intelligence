"""
BiteBase Intelligence Search API Endpoints
Advanced search and discovery functionality
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, text
# from geoalchemy2.functions import ST_DWithin, ST_GeogFromText, ST_Distance  # Disabled for SQLite
from typing import List, Optional, Dict, Any
import uuid
import math

from app.core.database import get_db
from app.models.restaurant import Restaurant, MenuItem
from app.schemas.restaurant import RestaurantListResponse, RestaurantResponse
from app.services.restaurant.restaurant_service import RestaurantService

router = APIRouter()

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return 6371 * c  # Earth's radius in km


@router.get("/restaurants", response_model=RestaurantListResponse)
async def search_restaurants(
    # Text search
    q: Optional[str] = Query(None, description="Search query for restaurant name, brand, or cuisine"),
    
    # Location filters
    city: Optional[str] = Query(None, description="Filter by city"),
    area: Optional[str] = Query(None, description="Filter by area/neighborhood"),
    country: Optional[str] = Query(None, description="Filter by country"),
    
    # Category filters
    cuisine: Optional[List[str]] = Query(None, description="Filter by cuisine types"),
    category: Optional[str] = Query(None, description="Filter by restaurant category"),
    brand: Optional[str] = Query(None, description="Filter by brand/chain"),
    price_range: Optional[str] = Query(None, description="Filter by price range ($, $$, $$$, $$$$)"),
    
    # Rating filters
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum average rating"),
    min_reviews: Optional[int] = Query(None, ge=0, description="Minimum number of reviews"),
    
    # Geographic search
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="Search center latitude"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="Search center longitude"),
    radius_km: Optional[float] = Query(None, ge=0.1, le=100, description="Search radius in kilometers"),
    
    # Business filters
    is_active: bool = Query(True, description="Filter by active status"),
    has_menu: Optional[bool] = Query(None, description="Filter restaurants with menu data"),
    
    # Sorting and pagination
    sort_by: str = Query("name", description="Sort field (name, rating, distance, created_at)"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$", description="Sort order"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of results"),
    
    db: AsyncSession = Depends(get_db)
):
    """
    Advanced restaurant search with multiple filters and sorting options
    """
    try:
        # Start with base query
        query = select(Restaurant).where(Restaurant.is_active == is_active)
        
        # Text search across multiple fields
        if q:
            search_term = f"%{q.lower()}%"
            query = query.where(
                or_(
                    Restaurant.name.ilike(search_term),
                    Restaurant.brand.ilike(search_term),
                    Restaurant.cuisine_types.any(func.lower(func.any(Restaurant.cuisine_types)).like(search_term)),
                    Restaurant.address.ilike(search_term)
                )
            )
        
        # Location filters
        if city:
            query = query.where(Restaurant.city.ilike(f"%{city}%"))
        
        if area:
            query = query.where(Restaurant.area.ilike(f"%{area}%"))
        
        if country:
            query = query.where(Restaurant.country.ilike(f"%{country}%"))
        
        # Category filters
        if cuisine:
            # Filter by any of the specified cuisines
            cuisine_conditions = [Restaurant.cuisine_types.any(c) for c in cuisine]
            query = query.where(or_(*cuisine_conditions))
        
        if category:
            query = query.where(Restaurant.category == category)
        
        if brand:
            query = query.where(Restaurant.brand.ilike(f"%{brand}%"))
        
        if price_range:
            query = query.where(Restaurant.price_range == price_range)
        
        # Rating filters
        if min_rating:
            query = query.where(Restaurant.average_rating >= min_rating)
        
        if min_reviews:
            query = query.where(Restaurant.total_reviews >= min_reviews)
        
        # Geographic search - will be handled after query execution for SQLite
        geographic_filter = latitude is not None and longitude is not None and radius_km
        
        # Menu filter
        if has_menu is not None:
            if has_menu:
                # Restaurants that have menu items
                query = query.where(
                    Restaurant.id.in_(
                        select(MenuItem.restaurant_id).distinct()
                    )
                )
            else:
                # Restaurants without menu items
                query = query.where(
                    Restaurant.id.notin_(
                        select(MenuItem.restaurant_id).distinct()
                    )
                )
        
        # Execute query first (without pagination for geographic filtering)
        result = await db.execute(query)
        restaurants = result.scalars().all()
        
        # Apply geographic filtering and distance calculation
        restaurants_with_distance = []
        for restaurant in restaurants:
            restaurant_data = RestaurantResponse.from_orm(restaurant)
            
            # Calculate distance if coordinates provided
            if latitude is not None and longitude is not None:
                distance_km = calculate_distance(
                    latitude, longitude,
                    restaurant.latitude, restaurant.longitude
                )
                restaurant_data.distance_km = round(distance_km, 2)
                
                # Apply radius filter
                if radius_km and distance_km > radius_km:
                    continue
            
            restaurants_with_distance.append(restaurant_data)
        
        # Get total count after filtering
        total = len(restaurants_with_distance)
        
        # Apply sorting after distance calculation
        if sort_by == "distance" and latitude is not None and longitude is not None:
            restaurants_with_distance.sort(
                key=lambda x: getattr(x, 'distance_km', float('inf')),
                reverse=(sort_order == "desc")
            )
        elif sort_by == "rating":
            restaurants_with_distance.sort(
                key=lambda x: x.average_rating or 0,
                reverse=(sort_order == "desc")
            )
        elif sort_by == "created_at":
            restaurants_with_distance.sort(
                key=lambda x: x.created_at,
                reverse=(sort_order == "desc")
            )
        else:  # Default to name
            restaurants_with_distance.sort(
                key=lambda x: x.name,
                reverse=(sort_order == "desc")
            )
        
        # Apply pagination after filtering and sorting
        restaurants_with_distance = restaurants_with_distance[skip:skip + limit]
        
        return RestaurantListResponse(
            restaurants=restaurants_with_distance,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=2, description="Search query for suggestions"),
    type: str = Query("all", pattern="^(all|restaurants|brands|cuisines|cities)$", description="Suggestion type"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of suggestions"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get search suggestions for autocomplete functionality
    """
    try:
        suggestions = []
        search_term = f"%{q.lower()}%"
        
        if type in ["all", "restaurants"]:
            # Restaurant name suggestions
            restaurant_query = select(Restaurant.name).where(
                and_(
                    Restaurant.is_active == True,
                    Restaurant.name.ilike(search_term)
                )
            ).distinct().limit(limit)
            
            restaurant_result = await db.execute(restaurant_query)
            restaurant_names = restaurant_result.scalars().all()
            
            suggestions.extend([
                {"type": "restaurant", "value": name, "label": name}
                for name in restaurant_names
            ])
        
        if type in ["all", "brands"]:
            # Brand suggestions
            brand_query = select(Restaurant.brand).where(
                and_(
                    Restaurant.is_active == True,
                    Restaurant.brand.ilike(search_term),
                    Restaurant.brand.isnot(None)
                )
            ).distinct().limit(limit)
            
            brand_result = await db.execute(brand_query)
            brands = brand_result.scalars().all()
            
            suggestions.extend([
                {"type": "brand", "value": brand, "label": f"{brand} (Brand)"}
                for brand in brands
            ])
        
        if type in ["all", "cuisines"]:
            # Cuisine suggestions
            cuisine_query = select(
                func.unnest(Restaurant.cuisine_types).label('cuisine')
            ).where(
                Restaurant.is_active == True
            ).distinct()
            
            cuisine_result = await db.execute(cuisine_query)
            all_cuisines = cuisine_result.scalars().all()
            
            # Filter cuisines that match the search term
            matching_cuisines = [
                cuisine for cuisine in all_cuisines
                if q.lower() in cuisine.lower()
            ][:limit]
            
            suggestions.extend([
                {"type": "cuisine", "value": cuisine, "label": f"{cuisine.title()} Cuisine"}
                for cuisine in matching_cuisines
            ])
        
        if type in ["all", "cities"]:
            # City suggestions
            city_query = select(Restaurant.city).where(
                and_(
                    Restaurant.is_active == True,
                    Restaurant.city.ilike(search_term)
                )
            ).distinct().limit(limit)
            
            city_result = await db.execute(city_query)
            cities = city_result.scalars().all()
            
            suggestions.extend([
                {"type": "city", "value": city, "label": f"{city} (City)"}
                for city in cities
            ])
        
        # Sort suggestions by relevance (exact matches first)
        suggestions.sort(key=lambda x: (
            0 if q.lower() == x["value"].lower() else
            1 if x["value"].lower().startswith(q.lower()) else 2
        ))
        
        return {
            "query": q,
            "suggestions": suggestions[:limit],
            "total": len(suggestions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")


@router.get("/filters")
async def get_search_filters(
    # Optional location context for relevant filters
    latitude: Optional[float] = Query(None, ge=-90, le=90),
    longitude: Optional[float] = Query(None, ge=-180, le=180),
    radius_km: Optional[float] = Query(None, ge=0.1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get available filter options for search interface
    """
    try:
        filters = {}
        
        # Base query for active restaurants
        base_query = select(Restaurant).where(Restaurant.is_active == True)
        
        # For SQLite, we'll need to filter by location after query execution
        location_filter_needed = latitude is not None and longitude is not None and radius_km is not None
        
        # Get all restaurants first, then filter by location if needed
        result = await db.execute(base_query)
        restaurants = result.scalars().all()
        
        # Apply location filtering if needed
        if location_filter_needed:
            filtered_restaurants = []
            for restaurant in restaurants:
                distance_km = calculate_distance(
                    latitude, longitude,
                    restaurant.latitude, restaurant.longitude
                )
                if distance_km <= radius_km:
                    filtered_restaurants.append(restaurant)
            restaurants = filtered_restaurants
        
        # Extract cuisines from filtered restaurants
        cuisine_counts = {}
        for restaurant in restaurants:
            for cuisine in restaurant.cuisine_types or []:
                cuisine_counts[cuisine] = cuisine_counts.get(cuisine, 0) + 1
        
        cuisines = [
            {"value": cuisine, "label": cuisine.title(), "count": count}
            for cuisine, count in sorted(cuisine_counts.items(), key=lambda x: x[1], reverse=True)
        ]
        filters["cuisines"] = cuisines
        
        # Extract categories from filtered restaurants
        category_counts = {}
        for restaurant in restaurants:
            if restaurant.category:
                category_counts[restaurant.category] = category_counts.get(restaurant.category, 0) + 1
        
        categories = [
            {"value": category, "label": category.replace('-', ' ').title(), "count": count}
            for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
        ]
        filters["categories"] = categories
        
        # Extract brands from filtered restaurants (top 20)
        brand_counts = {}
        for restaurant in restaurants:
            if restaurant.brand:
                brand_counts[restaurant.brand] = brand_counts.get(restaurant.brand, 0) + 1
        
        brands = [
            {"value": brand, "label": brand, "count": count}
            for brand, count in sorted(brand_counts.items(), key=lambda x: x[1], reverse=True)[:20]
        ]
        filters["brands"] = brands
        
        # Get available cities
        city_query = select(
            Restaurant.city,
            func.count().label('count')
        ).select_from(base_query.subquery()).group_by(Restaurant.city).order_by('count DESC').limit(50)
        
        city_result = await db.execute(city_query)
        cities = [
            {"value": row.city, "label": row.city, "count": row.count}
            for row in city_result.all()
        ]
        filters["cities"] = cities
        
        # Get price ranges
        price_query = select(
            Restaurant.price_range,
            func.count().label('count')
        ).select_from(base_query.subquery()).where(
            Restaurant.price_range.isnot(None)
        ).group_by(Restaurant.price_range).order_by(Restaurant.price_range)
        
        price_result = await db.execute(price_query)
        price_ranges = [
            {"value": row.price_range, "label": row.price_range, "count": row.count}
            for row in price_result.all()
        ]
        filters["price_ranges"] = price_ranges
        
        # Get rating distribution
        rating_query = select(
            func.floor(Restaurant.average_rating).label('rating_floor'),
            func.count().label('count')
        ).select_from(base_query.subquery()).where(
            Restaurant.average_rating.isnot(None)
        ).group_by('rating_floor').order_by('rating_floor DESC')
        
        rating_result = await db.execute(rating_query)
        ratings = [
            {
                "value": int(row.rating_floor),
                "label": f"{int(row.rating_floor)}+ stars",
                "count": row.count
            }
            for row in rating_result.all()
        ]
        filters["ratings"] = ratings
        
        return {
            "filters": filters,
            "location_context": {
                "latitude": latitude,
                "longitude": longitude,
                "radius_km": radius_km
            } if latitude and longitude else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get filters: {str(e)}")


@router.get("/popular")
async def get_popular_searches(
    location: Optional[str] = Query(None, description="Location context for popular searches"),
    limit: int = Query(20, ge=1, le=100, description="Number of popular searches to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get popular search terms and trending restaurants
    """
    try:
        popular_data = {}
        
        # Popular cuisines (by restaurant count)
        cuisine_query = select(
            func.unnest(Restaurant.cuisine_types).label('cuisine'),
            func.count().label('restaurant_count')
        ).where(Restaurant.is_active == True).group_by('cuisine').order_by('restaurant_count DESC').limit(limit)
        
        cuisine_result = await db.execute(cuisine_query)
        popular_cuisines = [
            {"term": row.cuisine, "type": "cuisine", "count": row.restaurant_count}
            for row in cuisine_result.all()
        ]
        popular_data["cuisines"] = popular_cuisines
        
        # Popular brands (by location count)
        brand_query = select(
            Restaurant.brand,
            func.count().label('location_count')
        ).where(
            and_(
                Restaurant.is_active == True,
                Restaurant.brand.isnot(None)
            )
        ).group_by(Restaurant.brand).order_by('location_count DESC').limit(limit)
        
        brand_result = await db.execute(brand_query)
        popular_brands = [
            {"term": row.brand, "type": "brand", "count": row.location_count}
            for row in brand_result.all()
        ]
        popular_data["brands"] = popular_brands
        
        # Trending restaurants (high rating, recent)
        trending_query = select(Restaurant).where(
            and_(
                Restaurant.is_active == True,
                Restaurant.average_rating >= 4.0,
                Restaurant.total_reviews >= 10
            )
        ).order_by(
            Restaurant.average_rating.desc(),
            Restaurant.total_reviews.desc()
        ).limit(limit)
        
        trending_result = await db.execute(trending_query)
        trending_restaurants = [
            {
                "id": str(restaurant.id),
                "name": restaurant.name,
                "brand": restaurant.brand,
                "cuisine_types": restaurant.cuisine_types,
                "average_rating": restaurant.average_rating,
                "total_reviews": restaurant.total_reviews,
                "city": restaurant.city
            }
            for restaurant in trending_result.scalars().all()
        ]
        popular_data["trending_restaurants"] = trending_restaurants
        
        return {
            "popular_searches": popular_data,
            "location": location,
            "generated_at": func.now()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get popular searches: {str(e)}")