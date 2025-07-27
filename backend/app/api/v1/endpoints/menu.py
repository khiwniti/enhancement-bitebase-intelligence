"""
BiteBase Intelligence Menu API Endpoints
Menu intelligence and pricing analytics
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Optional, Dict, Any
import uuid

from app.core.database import get_db
from app.models.restaurant import Restaurant, MenuItem
from app.services.menu.menu_intelligence_service import MenuIntelligenceService

router = APIRouter()


@router.get("/analysis")
async def analyze_menu_competitiveness(
    restaurant_id: uuid.UUID = Query(..., description="Restaurant ID for menu analysis"),
    radius_km: float = Query(5.0, ge=0.1, le=20, description="Analysis radius in kilometers"),
    include_pricing: bool = Query(True, description="Include pricing analysis"),
    include_trends: bool = Query(True, description="Include menu trend analysis"),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze menu competitiveness and pricing optimization
    """
    try:
        menu_service = MenuIntelligenceService(db)
        
        analysis = await menu_service.analyze_menu_competitiveness(
            restaurant_id=restaurant_id,
            radius_km=radius_km,
            include_pricing=include_pricing,
            include_trends=include_trends
        )
        
        return {
            "restaurant_id": str(restaurant_id),
            "analysis_radius_km": radius_km,
            "analysis": analysis,
            "timestamp": func.now()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Menu analysis failed: {str(e)}")


@router.get("/pricing-optimization")
async def get_pricing_optimization(
    restaurant_id: uuid.UUID = Query(..., description="Restaurant ID"),
    menu_item_id: Optional[uuid.UUID] = Query(None, description="Specific menu item ID"),
    category: Optional[str] = Query(None, description="Menu category filter"),
    optimization_goal: str = Query("revenue", pattern="^(revenue|profit|volume)$", description="Optimization objective"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get AI-powered pricing optimization recommendations
    """
    try:
        menu_service = MenuIntelligenceService(db)
        
        if menu_item_id:
            # Single item optimization
            optimization = await menu_service.optimize_item_pricing(
                menu_item_id=menu_item_id,
                optimization_goal=optimization_goal
            )
        else:
            # Full menu or category optimization
            optimization = await menu_service.optimize_menu_pricing(
                restaurant_id=restaurant_id,
                category=category,
                optimization_goal=optimization_goal
            )
        
        return {
            "restaurant_id": str(restaurant_id),
            "optimization_goal": optimization_goal,
            "recommendations": optimization
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pricing optimization failed: {str(e)}")


@router.get("/trends")
async def get_menu_trends(
    location: Optional[str] = Query(None, description="Location filter (city, area)"),
    cuisine_type: Optional[str] = Query(None, description="Cuisine type filter"),
    time_period: str = Query("month", pattern="^(week|month|quarter|year)$", description="Trend analysis period"),
    trend_type: str = Query("popularity", pattern="^(popularity|pricing|new_items)$", description="Type of trend analysis"),
    limit: int = Query(20, ge=1, le=100, description="Number of trending items to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get menu trends and popular items analysis
    """
    try:
        menu_service = MenuIntelligenceService(db)
        
        trends = await menu_service.analyze_menu_trends(
            location=location,
            cuisine_type=cuisine_type,
            time_period=time_period,
            trend_type=trend_type,
            limit=limit
        )
        
        return {
            "filters": {
                "location": location,
                "cuisine_type": cuisine_type,
                "time_period": time_period,
                "trend_type": trend_type
            },
            "trends": trends
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Menu trends analysis failed: {str(e)}")


@router.get("/gaps")
async def identify_menu_gaps(
    latitude: float = Query(..., ge=-90, le=90, description="Location latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Location longitude"),
    radius_km: float = Query(3.0, ge=0.1, le=10, description="Analysis radius"),
    target_cuisine: Optional[str] = Query(None, description="Target cuisine type"),
    price_range: Optional[str] = Query(None, description="Target price range"),
    db: AsyncSession = Depends(get_db)
):
    """
    Identify menu gaps and opportunities in a market area
    """
    try:
        menu_service = MenuIntelligenceService(db)
        
        gaps = await menu_service.identify_menu_gaps(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            target_cuisine=target_cuisine,
            price_range=price_range
        )
        
        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "radius_km": radius_km
            },
            "filters": {
                "target_cuisine": target_cuisine,
                "price_range": price_range
            },
            "menu_gaps": gaps
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Menu gap analysis failed: {str(e)}")


@router.get("/popular-items")
async def get_popular_menu_items(
    location: Optional[str] = Query(None, description="Location filter"),
    cuisine_type: Optional[str] = Query(None, description="Cuisine filter"),
    category: Optional[str] = Query(None, description="Menu category filter"),
    price_min: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    price_max: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    limit: int = Query(50, ge=1, le=200, description="Number of items to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get popular menu items based on various filters
    """
    try:
        # Build query for popular menu items
        query = select(MenuItem).join(Restaurant)
        
        # Apply filters
        filters = [Restaurant.is_active == True]
        
        if location:
            filters.append(
                or_(
                    Restaurant.city.ilike(f"%{location}%"),
                    Restaurant.area.ilike(f"%{location}%")
                )
            )
        
        if cuisine_type:
            filters.append(Restaurant.cuisine_types.any(cuisine_type))
        
        if category:
            filters.append(MenuItem.category.ilike(f"%{category}%"))
        
        if price_min is not None:
            filters.append(MenuItem.price >= price_min)
        
        if price_max is not None:
            filters.append(MenuItem.price <= price_max)
        
        query = query.where(and_(*filters))
        
        # Order by popularity score and limit results
        query = query.order_by(MenuItem.popularity_score.desc(), MenuItem.order_frequency.desc()).limit(limit)
        
        # Execute query
        result = await db.execute(query)
        menu_items = result.scalars().all()
        
        # Format response
        popular_items = []
        for item in menu_items:
            # Get restaurant info
            restaurant_query = select(Restaurant).where(Restaurant.id == item.restaurant_id)
            restaurant_result = await db.execute(restaurant_query)
            restaurant = restaurant_result.scalar_one_or_none()
            
            popular_items.append({
                "id": str(item.id),
                "name": item.name,
                "description": item.description,
                "category": item.category,
                "price": item.price,
                "currency": item.currency,
                "popularity_score": item.popularity_score,
                "order_frequency": item.order_frequency,
                "restaurant": {
                    "id": str(restaurant.id),
                    "name": restaurant.name,
                    "brand": restaurant.brand,
                    "cuisine_types": restaurant.cuisine_types,
                    "city": restaurant.city
                } if restaurant else None,
                "dietary_info": {
                    "is_vegetarian": item.is_vegetarian,
                    "is_vegan": item.is_vegan,
                    "is_gluten_free": item.is_gluten_free
                }
            })
        
        return {
            "filters": {
                "location": location,
                "cuisine_type": cuisine_type,
                "category": category,
                "price_range": f"${price_min}-${price_max}" if price_min and price_max else None
            },
            "popular_items": popular_items,
            "total_items": len(popular_items)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Popular items analysis failed: {str(e)}")


@router.get("/price-comparison")
async def compare_menu_prices(
    item_name: str = Query(..., description="Menu item name to compare"),
    location: Optional[str] = Query(None, description="Location for comparison"),
    cuisine_type: Optional[str] = Query(None, description="Cuisine type filter"),
    radius_km: Optional[float] = Query(None, ge=0.1, le=20, description="Search radius if coordinates provided"),
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="Location latitude"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="Location longitude"),
    db: AsyncSession = Depends(get_db)
):
    """
    Compare prices for a specific menu item across restaurants
    """
    try:
        menu_service = MenuIntelligenceService(db)
        
        price_comparison = await menu_service.compare_item_prices(
            item_name=item_name,
            location=location,
            cuisine_type=cuisine_type,
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km
        )
        
        return {
            "item_name": item_name,
            "search_criteria": {
                "location": location,
                "cuisine_type": cuisine_type,
                "coordinates": {"latitude": latitude, "longitude": longitude} if latitude and longitude else None,
                "radius_km": radius_km
            },
            "price_comparison": price_comparison
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price comparison failed: {str(e)}")


@router.post("/items")
async def create_menu_item(
    restaurant_id: uuid.UUID,
    item_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new menu item
    """
    try:
        # Verify restaurant exists
        restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
        restaurant_result = await db.execute(restaurant_query)
        restaurant = restaurant_result.scalar_one_or_none()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Create menu item
        menu_item = MenuItem(
            restaurant_id=restaurant_id,
            name=item_data.get("name"),
            description=item_data.get("description"),
            category=item_data.get("category"),
            price=item_data.get("price"),
            currency=item_data.get("currency", "USD"),
            is_available=item_data.get("is_available", True),
            is_vegetarian=item_data.get("is_vegetarian", False),
            is_vegan=item_data.get("is_vegan", False),
            is_gluten_free=item_data.get("is_gluten_free", False),
            allergens=item_data.get("allergens"),
            calories=item_data.get("calories"),
            nutritional_info=item_data.get("nutritional_info")
        )
        
        db.add(menu_item)
        await db.commit()
        await db.refresh(menu_item)
        
        return {
            "id": str(menu_item.id),
            "restaurant_id": str(restaurant_id),
            "name": menu_item.name,
            "category": menu_item.category,
            "price": menu_item.price,
            "message": "Menu item created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create menu item: {str(e)}")


@router.get("/categories")
async def get_menu_categories(
    location: Optional[str] = Query(None, description="Location filter"),
    cuisine_type: Optional[str] = Query(None, description="Cuisine type filter"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get popular menu categories and their statistics
    """
    try:
        # Build query for menu categories
        query = select(
            MenuItem.category,
            func.count(MenuItem.id).label('item_count'),
            func.avg(MenuItem.price).label('avg_price'),
            func.avg(MenuItem.popularity_score).label('avg_popularity')
        ).join(Restaurant)
        
        # Apply filters
        filters = [Restaurant.is_active == True]
        
        if location:
            filters.append(
                or_(
                    Restaurant.city.ilike(f"%{location}%"),
                    Restaurant.area.ilike(f"%{location}%")
                )
            )
        
        if cuisine_type:
            filters.append(Restaurant.cuisine_types.any(cuisine_type))
        
        query = query.where(and_(*filters)).group_by(MenuItem.category).order_by('item_count DESC')
        
        # Execute query
        result = await db.execute(query)
        categories = result.all()
        
        # Format response
        category_stats = []
        for category in categories:
            category_stats.append({
                "category": category.category,
                "item_count": category.item_count,
                "average_price": round(category.avg_price or 0, 2),
                "average_popularity": round(category.avg_popularity or 0, 2),
                "market_share": round(category.item_count / sum(c.item_count for c in categories) * 100, 1)
            })
        
        return {
            "filters": {
                "location": location,
                "cuisine_type": cuisine_type
            },
            "categories": category_stats,
            "total_categories": len(category_stats)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Menu categories analysis failed: {str(e)}")