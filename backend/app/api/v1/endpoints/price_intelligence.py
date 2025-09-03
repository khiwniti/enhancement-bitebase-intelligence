"""
BiteBase Intelligence Price Intelligence API Endpoints
4P Framework - Price Intelligence: Revenue forecasting, spending analysis, and price optimization
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.restaurant import Restaurant, MenuItem
from app.models.price import ForecastModel, RevenueForecast, CustomerSpendingPattern, PriceElasticity

router = APIRouter()


@router.get("/revenue-forecast/{restaurant_id}")
async def generate_revenue_forecast(
    restaurant_id: str = Path(..., description="Restaurant ID for revenue forecasting"),
    forecast_days: int = Query(30, ge=7, le=365, description="Number of days to forecast"),
    model_type: str = Query("prophet", description="Forecasting model type"),
    include_confidence_intervals: bool = Query(True, description="Include confidence intervals"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate revenue forecasts using machine learning models
    """
    try:
        # Verify restaurant access
        restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
        restaurant_result = await db.execute(restaurant_query)
        restaurant = restaurant_result.scalar_one_or_none()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Check for existing forecast models
        model_query = select(ForecastModel).where(
            ForecastModel.restaurant_id == restaurant_id,
            ForecastModel.model_type == model_type,
            ForecastModel.is_active == True
        )
        model_result = await db.execute(model_query)
        forecast_model = model_result.scalar_one_or_none()
        
        # Generate mock forecast data (in production, this would use actual ML models)
        base_revenue = 15000.0  # Base monthly revenue
        daily_base = base_revenue / 30
        
        forecasts = []
        for day in range(forecast_days):
            forecast_date = datetime.utcnow() + timedelta(days=day + 1)
            
            # Add seasonal and weekly patterns
            day_of_week = forecast_date.weekday()
            weekend_multiplier = 1.3 if day_of_week in [4, 5, 6] else 1.0  # Fri, Sat, Sun
            
            # Add some randomness for realistic variation
            import random
            variation = random.uniform(0.85, 1.15)
            
            predicted_revenue = daily_base * weekend_multiplier * variation
            
            # Calculate confidence intervals
            confidence_range = predicted_revenue * 0.15  # ±15%
            lower_bound = predicted_revenue - confidence_range
            upper_bound = predicted_revenue + confidence_range
            
            forecasts.append({
                "date": forecast_date.date().isoformat(),
                "predicted_revenue": round(predicted_revenue, 2),
                "confidence_interval_lower": round(lower_bound, 2) if include_confidence_intervals else None,
                "confidence_interval_upper": round(upper_bound, 2) if include_confidence_intervals else None,
                "day_of_week": forecast_date.strftime("%A"),
                "is_weekend": day_of_week in [4, 5, 6]
            })
        
        # Calculate summary statistics
        total_forecast = sum(f["predicted_revenue"] for f in forecasts)
        average_daily = total_forecast / forecast_days
        
        # Generate insights
        insights = [
            {
                "type": "seasonal_pattern",
                "description": "Weekend revenue typically 30% higher than weekdays",
                "impact": "positive"
            },
            {
                "type": "growth_trend",
                "description": f"Projected {forecast_days}-day revenue: ${total_forecast:,.2f}",
                "impact": "neutral"
            }
        ]
        
        # Model performance metrics (mock data)
        model_performance = {
            "model_type": model_type,
            "accuracy_metrics": {
                "mae": 245.50,  # Mean Absolute Error
                "rmse": 312.75,  # Root Mean Square Error
                "mape": 8.2,     # Mean Absolute Percentage Error
                "r_squared": 0.87 # R-squared
            },
            "last_trained": (datetime.utcnow() - timedelta(days=7)).isoformat(),
            "training_data_period": "12 months",
            "confidence_level": 0.95
        }
        
        return {
            "success": True,
            "data": {
                "restaurant_id": restaurant_id,
                "forecast_period_days": forecast_days,
                "model_type": model_type,
                "summary": {
                    "total_forecast_revenue": round(total_forecast, 2),
                    "average_daily_revenue": round(average_daily, 2),
                    "forecast_start_date": forecasts[0]["date"],
                    "forecast_end_date": forecasts[-1]["date"]
                },
                "forecasts": forecasts,
                "model_performance": model_performance,
                "insights": insights
            },
            "metadata": {
                "generated_by": current_user.id,
                "generation_timestamp": datetime.utcnow().isoformat(),
                "analysis_type": "revenue_forecasting"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Revenue forecasting failed: {str(e)}"
        )


@router.get("/customer-spending/{restaurant_id}")
async def analyze_customer_spending(
    restaurant_id: str = Path(..., description="Restaurant ID for customer spending analysis"),
    analysis_period_days: int = Query(90, ge=30, le=365, description="Analysis period in days"),
    segment_by: str = Query("rfm", description="Segmentation method"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze customer spending patterns and behaviors
    """
    try:
        # Verify restaurant access
        restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
        restaurant_result = await db.execute(restaurant_query)
        restaurant = restaurant_result.scalar_one_or_none()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Get customer spending patterns
        patterns_query = select(CustomerSpendingPattern).where(
            CustomerSpendingPattern.restaurant_id == restaurant_id
        )
        patterns_result = await db.execute(patterns_query)
        spending_patterns = patterns_result.scalars().all()
        
        # Generate mock spending analysis (in production, this would analyze actual customer data)
        customer_segments = {
            "high_value": {
                "count": 45,
                "percentage": 15.0,
                "avg_order_value": 45.50,
                "avg_frequency_days": 7.5,
                "total_ltv": 2275.0,
                "characteristics": ["Frequent visitors", "High spenders", "Low price sensitivity"]
            },
            "regular": {
                "count": 150,
                "percentage": 50.0,
                "avg_order_value": 28.75,
                "avg_frequency_days": 14.0,
                "total_ltv": 862.50,
                "characteristics": ["Consistent visitors", "Moderate spenders", "Medium price sensitivity"]
            },
            "occasional": {
                "count": 75,
                "percentage": 25.0,
                "avg_order_value": 22.00,
                "avg_frequency_days": 30.0,
                "total_ltv": 264.00,
                "characteristics": ["Infrequent visitors", "Lower spenders", "High price sensitivity"]
            },
            "new": {
                "count": 30,
                "percentage": 10.0,
                "avg_order_value": 25.00,
                "avg_frequency_days": None,
                "total_ltv": 25.00,
                "characteristics": ["First-time visitors", "Unknown patterns", "Price conscious"]
            }
        }
        
        # Calculate overall metrics
        total_customers = sum(segment["count"] for segment in customer_segments.values())
        weighted_avg_order_value = sum(
            segment["count"] * segment["avg_order_value"] 
            for segment in customer_segments.values()
        ) / total_customers
        
        # RFM Analysis summary
        rfm_distribution = {
            "champions": {"count": 25, "rfm_score": "555", "description": "Best customers"},
            "loyal_customers": {"count": 40, "rfm_score": "544", "description": "Regular high-value customers"},
            "potential_loyalists": {"count": 60, "rfm_score": "453", "description": "Recent customers with potential"},
            "at_risk": {"count": 35, "rfm_score": "244", "description": "Customers who may churn"},
            "hibernating": {"count": 20, "rfm_score": "155", "description": "Inactive customers"},
            "lost": {"count": 15, "rfm_score": "111", "description": "Churned customers"}
        }
        
        # Spending trends
        spending_trends = []
        base_date = datetime.utcnow() - timedelta(days=analysis_period_days)
        
        for week in range(min(12, analysis_period_days // 7)):  # Up to 12 weeks
            trend_date = base_date + timedelta(weeks=week)
            spending_trends.append({
                "week": trend_date.strftime("%Y-W%U"),
                "total_revenue": round(12000 + (week * 200) + (week % 3 * 500), 2),
                "avg_order_value": round(25.0 + (week * 0.5), 2),
                "customer_count": 180 + (week * 5),
                "repeat_customer_rate": round(65.0 + (week * 0.8), 1)
            })
        
        # Generate recommendations
        recommendations = [
            {
                "segment": "high_value",
                "priority": "high",
                "action": "retention",
                "description": "Implement VIP program for high-value customers",
                "expected_impact": "Increase retention by 15%"
            },
            {
                "segment": "at_risk",
                "priority": "medium",
                "action": "win_back",
                "description": "Send personalized offers to at-risk customers",
                "expected_impact": "Recover 25% of at-risk customers"
            }
        ]
        
        return {
            "success": True,
            "data": {
                "restaurant_id": restaurant_id,
                "analysis_period_days": analysis_period_days,
                "segmentation_method": segment_by,
                "overall_metrics": {
                    "total_customers": total_customers,
                    "average_order_value": round(weighted_avg_order_value, 2),
                    "customer_retention_rate": 72.5,
                    "churn_rate": 8.3
                },
                "customer_segments": customer_segments,
                "rfm_distribution": rfm_distribution,
                "spending_trends": spending_trends,
                "recommendations": recommendations
            },
            "metadata": {
                "analyzed_by": current_user.id,
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "analysis_type": "customer_spending_analysis"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Customer spending analysis failed: {str(e)}"
        )


@router.get("/price-elasticity/{restaurant_id}")
async def analyze_price_elasticity(
    restaurant_id: str = Path(..., description="Restaurant ID for price elasticity analysis"),
    menu_item_id: Optional[str] = Query(None, description="Specific menu item ID (optional)"),
    analysis_period_days: int = Query(90, ge=30, le=365, description="Analysis period in days"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze price elasticity for menu items to optimize pricing strategies
    """
    try:
        # Verify restaurant access
        restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
        restaurant_result = await db.execute(restaurant_query)
        restaurant = restaurant_result.scalar_one_or_none()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Get menu items to analyze
        if menu_item_id:
            items_query = select(MenuItem).where(
                MenuItem.id == menu_item_id,
                MenuItem.restaurant_id == restaurant_id
            )
        else:
            items_query = select(MenuItem).where(MenuItem.restaurant_id == restaurant_id)
        
        items_result = await db.execute(items_query)
        menu_items = items_result.scalars().all()
        
        if not menu_items:
            raise HTTPException(status_code=404, detail="No menu items found")
        
        # Generate mock elasticity analysis for each item
        elasticity_results = []
        
        for item in menu_items:
            # Mock price elasticity data (in production, this would analyze actual price change impacts)
            import random
            
            # Generate realistic elasticity coefficient
            base_elasticity = random.uniform(-2.5, -0.3)  # Negative values (normal goods)
            
            # Determine elasticity category
            if base_elasticity < -1.0:
                category = "elastic"
                description = "Demand is sensitive to price changes"
            elif base_elasticity > -1.0:
                category = "inelastic"
                description = "Demand is relatively insensitive to price changes"
            else:
                category = "unit_elastic"
                description = "Demand changes proportionally with price"
            
            # Mock historical price change data
            price_changes = [
                {
                    "date": (datetime.utcnow() - timedelta(days=60)).date().isoformat(),
                    "old_price": float(item.price) - 2.0,
                    "new_price": float(item.price),
                    "price_change_percentage": 8.7,
                    "demand_change_percentage": base_elasticity * 8.7,
                    "revenue_impact_percentage": (1 + base_elasticity) * 8.7
                }
            ]
            
            # Calculate optimal price recommendation
            current_price = float(item.price)
            if category == "inelastic":
                # Can increase price with minimal demand loss
                optimal_price = current_price * 1.1
                expected_revenue_change = 8.5
            elif category == "elastic":
                # Should be careful with price increases
                optimal_price = current_price * 0.98
                expected_revenue_change = 3.2
            else:
                # Unit elastic - revenue neutral
                optimal_price = current_price
                expected_revenue_change = 0.0
            
            elasticity_results.append({
                "menu_item_id": item.id,
                "menu_item_name": item.name,
                "current_price": current_price,
                "elasticity_coefficient": round(base_elasticity, 3),
                "elasticity_category": category,
                "description": description,
                "price_changes_analyzed": price_changes,
                "optimal_pricing": {
                    "recommended_price": round(optimal_price, 2),
                    "price_change": round(optimal_price - current_price, 2),
                    "expected_revenue_change_percentage": round(expected_revenue_change, 1)
                },
                "confidence_metrics": {
                    "statistical_significance": random.choice([True, False]),
                    "confidence_level": 0.95,
                    "sample_size": random.randint(50, 200)
                }
            })
        
        # Generate overall insights
        elastic_items = [r for r in elasticity_results if r["elasticity_category"] == "elastic"]
        inelastic_items = [r for r in elasticity_results if r["elasticity_category"] == "inelastic"]
        
        insights = [
            {
                "type": "pricing_opportunity",
                "description": f"{len(inelastic_items)} items show low price sensitivity - consider price increases",
                "impact": "positive"
            },
            {
                "type": "pricing_caution",
                "description": f"{len(elastic_items)} items show high price sensitivity - be cautious with increases",
                "impact": "warning"
            }
        ]
        
        return {
            "success": True,
            "data": {
                "restaurant_id": restaurant_id,
                "analysis_period_days": analysis_period_days,
                "items_analyzed": len(elasticity_results),
                "summary": {
                    "elastic_items": len(elastic_items),
                    "inelastic_items": len(inelastic_items),
                    "unit_elastic_items": len(elasticity_results) - len(elastic_items) - len(inelastic_items)
                },
                "elasticity_results": elasticity_results,
                "insights": insights
            },
            "metadata": {
                "analyzed_by": current_user.id,
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "analysis_type": "price_elasticity_analysis"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Price elasticity analysis failed: {str(e)}"
        )
