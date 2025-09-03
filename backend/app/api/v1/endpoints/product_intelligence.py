"""
BiteBase Intelligence Product Intelligence API Endpoints
4P Framework - Product Intelligence: Menu engineering, cost analysis, and pricing optimization
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.restaurant import Restaurant, MenuItem
from app.services.product.menu_engineering import MenuEngineeringService
from app.services.product.food_cost_analyzer import FoodCostAnalyzer

router = APIRouter()


@router.get("/menu-engineering/{restaurant_id}")
async def analyze_menu_engineering(
    restaurant_id: str = Path(..., description="Restaurant ID for menu engineering analysis"),
    analysis_period_days: int = Query(30, ge=7, le=365, description="Analysis period in days"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Perform menu engineering analysis using the classic Star/Dog/Plow Horse/Puzzle matrix
    Classifies menu items based on popularity and profitability
    """
    try:
        # Verify restaurant access
        restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
        restaurant_result = await db.execute(restaurant_query)
        restaurant = restaurant_result.scalar_one_or_none()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Initialize menu engineering service
        menu_service = MenuEngineeringService(db)
        
        # Perform classification analysis
        analysis = await menu_service.classify_menu_items(
            restaurant_id=restaurant_id,
            analysis_period_days=analysis_period_days
        )
        
        return {
            "success": True,
            "data": analysis,
            "metadata": {
                "analyzed_by": current_user.id,
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "analysis_type": "menu_engineering_classification"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Menu engineering analysis failed: {str(e)}"
        )


@router.get("/food-costs/{restaurant_id}")
async def analyze_food_costs(
    restaurant_id: str = Path(..., description="Restaurant ID for food cost analysis"),
    menu_item_id: Optional[str] = Query(None, description="Specific menu item ID (optional)"),
    include_trends: bool = Query(True, description="Include cost trend analysis"),
    include_breakdown: bool = Query(True, description="Include ingredient breakdown"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Comprehensive food cost analysis with ingredient breakdown and trend tracking
    """
    try:
        # Verify restaurant access
        restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
        restaurant_result = await db.execute(restaurant_query)
        restaurant = restaurant_result.scalar_one_or_none()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Initialize food cost analyzer
        cost_analyzer = FoodCostAnalyzer(db)
        
        # Perform cost analysis
        analysis = await cost_analyzer.analyze_food_costs(
            restaurant_id=restaurant_id,
            menu_item_id=menu_item_id,
            include_trends=include_trends,
            include_breakdown=include_breakdown
        )
        
        return {
            "success": True,
            "data": analysis,
            "metadata": {
                "analyzed_by": current_user.id,
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "analysis_type": "food_cost_analysis",
                "scope": "single_item" if menu_item_id else "restaurant_wide"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Food cost analysis failed: {str(e)}"
        )


@router.get("/pricing-optimization/{restaurant_id}")
async def get_pricing_recommendations(
    restaurant_id: str = Path(..., description="Restaurant ID for pricing optimization"),
    target_profit_margin: float = Query(65.0, ge=50.0, le=80.0, description="Target profit margin percentage"),
    market_position: str = Query("mid", description="Market positioning strategy"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate pricing optimization recommendations based on cost analysis and market positioning
    """
    try:
        # Verify restaurant access
        restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
        restaurant_result = await db.execute(restaurant_query)
        restaurant = restaurant_result.scalar_one_or_none()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Get menu items
        items_query = select(MenuItem).where(MenuItem.restaurant_id == restaurant_id)
        items_result = await db.execute(items_query)
        menu_items = items_result.scalars().all()
        
        # Initialize services
        cost_analyzer = FoodCostAnalyzer(db)
        menu_service = MenuEngineeringService(db)
        
        # Analyze each item for pricing optimization
        pricing_recommendations = []
        
        for item in menu_items:
            # Get cost analysis
            cost_analysis = await cost_analyzer._get_or_calculate_item_costs(item)
            
            # Calculate optimal pricing
            current_margin = cost_analysis["profit_margin"]
            current_price = float(item.price)
            total_cost = cost_analysis["total_cost"]
            
            # Calculate recommended price for target margin
            recommended_price = total_cost / (1 - target_profit_margin / 100)
            price_change = recommended_price - current_price
            price_change_percentage = (price_change / current_price) * 100
            
            # Market positioning adjustments
            positioning_multiplier = {
                "budget": 0.9,    # 10% below calculated price
                "mid": 1.0,       # Calculated price
                "premium": 1.15   # 15% above calculated price
            }
            
            final_recommended_price = recommended_price * positioning_multiplier[market_position]
            final_price_change = final_recommended_price - current_price
            final_change_percentage = (final_price_change / current_price) * 100
            
            # Determine recommendation priority
            if abs(final_change_percentage) > 10:
                priority = "high"
            elif abs(final_change_percentage) > 5:
                priority = "medium"
            else:
                priority = "low"
            
            pricing_recommendations.append({
                "menu_item_id": item.id,
                "menu_item_name": item.name,
                "current_price": round(current_price, 2),
                "current_margin": round(current_margin, 2),
                "recommended_price": round(final_recommended_price, 2),
                "price_change": round(final_price_change, 2),
                "change_percentage": round(final_change_percentage, 2),
                "priority": priority,
                "rationale": f"Optimize for {target_profit_margin}% margin with {market_position} positioning",
                "expected_margin": round(target_profit_margin, 2),
                "cost_breakdown": cost_analysis
            })
        
        # Sort by priority and change magnitude
        priority_order = {"high": 1, "medium": 2, "low": 3}
        pricing_recommendations.sort(
            key=lambda x: (priority_order[x["priority"]], abs(x["change_percentage"])),
            reverse=True
        )
        
        # Generate summary
        total_items = len(pricing_recommendations)
        high_priority = len([r for r in pricing_recommendations if r["priority"] == "high"])
        medium_priority = len([r for r in pricing_recommendations if r["priority"] == "medium"])
        
        average_current_margin = sum(r["current_margin"] for r in pricing_recommendations) / total_items if total_items > 0 else 0
        
        return {
            "success": True,
            "data": {
                "restaurant_id": restaurant_id,
                "target_profit_margin": target_profit_margin,
                "market_position": market_position,
                "summary": {
                    "total_items_analyzed": total_items,
                    "high_priority_changes": high_priority,
                    "medium_priority_changes": medium_priority,
                    "low_priority_changes": total_items - high_priority - medium_priority,
                    "average_current_margin": round(average_current_margin, 2),
                    "target_margin": target_profit_margin
                },
                "recommendations": pricing_recommendations
            },
            "metadata": {
                "analyzed_by": current_user.id,
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "analysis_type": "pricing_optimization"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Pricing optimization failed: {str(e)}"
        )


@router.get("/menu-performance/{restaurant_id}")
async def get_menu_performance_metrics(
    restaurant_id: str = Path(..., description="Restaurant ID for menu performance analysis"),
    period_days: int = Query(30, ge=7, le=365, description="Analysis period in days"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive menu performance metrics combining engineering and cost analysis
    """
    try:
        # Verify restaurant access
        restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
        restaurant_result = await db.execute(restaurant_query)
        restaurant = restaurant_result.scalar_one_or_none()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Initialize services
        menu_service = MenuEngineeringService(db)
        cost_analyzer = FoodCostAnalyzer(db)
        
        # Get menu engineering analysis
        engineering_analysis = await menu_service.classify_menu_items(
            restaurant_id=restaurant_id,
            analysis_period_days=period_days
        )
        
        # Get food cost analysis
        cost_analysis = await cost_analyzer.analyze_food_costs(
            restaurant_id=restaurant_id,
            include_trends=True,
            include_breakdown=False
        )
        
        # Combine analyses for comprehensive performance view
        performance_metrics = {
            "restaurant_id": restaurant_id,
            "analysis_period_days": period_days,
            "menu_engineering": engineering_analysis,
            "cost_analysis": cost_analysis,
            "combined_insights": {
                "total_menu_items": engineering_analysis.get("summary", {}).get("total_items", 0),
                "star_items": engineering_analysis.get("summary", {}).get("counts", {}).get("star", 0),
                "dog_items": engineering_analysis.get("summary", {}).get("counts", {}).get("dog", 0),
                "menu_health_score": engineering_analysis.get("summary", {}).get("health_score", 0),
                "overall_food_cost_percentage": cost_analysis.get("overall_metrics", {}).get("overall_food_cost_percentage", 0),
                "cost_variance_from_target": cost_analysis.get("overall_metrics", {}).get("variance_from_target", 0)
            }
        }
        
        return {
            "success": True,
            "data": performance_metrics,
            "metadata": {
                "analyzed_by": current_user.id,
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "analysis_type": "comprehensive_menu_performance"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Menu performance analysis failed: {str(e)}"
        )
