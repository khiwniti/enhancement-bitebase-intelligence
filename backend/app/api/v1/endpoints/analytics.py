"""
BiteBase Intelligence Analytics API Endpoints
Business intelligence and performance analytics
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, text
# from geoalchemy2.functions import ST_DWithin, ST_GeogFromText  # Disabled for SQLite
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from app.core.database import get_db
from app.models.restaurant import Restaurant, RestaurantAnalytics, MenuItem, RestaurantReview
from app.services.analytics.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/dashboard")
async def get_analytics_dashboard(
    restaurant_id: Optional[uuid.UUID] = Query(None, description="Specific restaurant ID"),
    location: Optional[str] = Query(None, description="Location filter (city, area)"),
    time_period: str = Query("month", pattern="^(week|month|quarter|year)$", description="Analysis time period"),
    include_predictions: bool = Query(True, description="Include predictive analytics"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get comprehensive analytics dashboard data
    """
    try:
        analytics_service = AnalyticsService(db)
        
        if restaurant_id:
            # Single restaurant dashboard
            dashboard_data = await analytics_service.get_restaurant_dashboard(
                restaurant_id=restaurant_id,
                time_period=time_period,
                include_predictions=include_predictions
            )
        else:
            # Market-level dashboard
            dashboard_data = await analytics_service.get_market_dashboard(
                location=location,
                time_period=time_period,
                include_predictions=include_predictions
            )
        
        return {
            "dashboard_type": "restaurant" if restaurant_id else "market",
            "time_period": time_period,
            "data": dashboard_data,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard generation failed: {str(e)}")


@router.get("/performance")
async def get_performance_metrics(
    restaurant_id: uuid.UUID = Query(..., description="Restaurant ID"),
    start_date: Optional[datetime] = Query(None, description="Start date for analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for analysis"),
    metrics: List[str] = Query(["revenue", "customers", "rating"], description="Metrics to include"),
    compare_to: Optional[str] = Query(None, pattern="^(previous_period|market_average|competitors)$", description="Comparison baseline"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed performance metrics for a restaurant
    """
    try:
        analytics_service = AnalyticsService(db)
        
        # Set default date range if not provided
        if not end_date:
            end_date = datetime.utcnow()
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        performance_data = await analytics_service.get_performance_metrics(
            restaurant_id=restaurant_id,
            start_date=start_date,
            end_date=end_date,
            metrics=metrics,
            compare_to=compare_to
        )
        
        return {
            "restaurant_id": str(restaurant_id),
            "date_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "metrics": metrics,
            "comparison": compare_to,
            "performance": performance_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance analysis failed: {str(e)}")


@router.get("/market-analysis")
async def get_market_analysis(
    latitude: float = Query(..., ge=-90, le=90, description="Market center latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Market center longitude"),
    radius_km: float = Query(5.0, ge=0.1, le=20, description="Market analysis radius"),
    cuisine_type: Optional[str] = Query(None, description="Focus cuisine type"),
    analysis_depth: str = Query("standard", pattern="^(basic|standard|comprehensive)$", description="Analysis depth"),
    db: AsyncSession = Depends(get_db)
):
    """
    Comprehensive market analysis for a geographic area
    """
    try:
        analytics_service = AnalyticsService(db)
        
        market_analysis = await analytics_service.analyze_market(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            cuisine_type=cuisine_type,
            analysis_depth=analysis_depth
        )
        
        return {
            "market_center": {
                "latitude": latitude,
                "longitude": longitude,
                "radius_km": radius_km
            },
            "focus_cuisine": cuisine_type,
            "analysis_depth": analysis_depth,
            "market_analysis": market_analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market analysis failed: {str(e)}")


@router.get("/trends")
async def get_trend_analysis(
    metric: str = Query("revenue", description="Metric to analyze trends for"),
    location: Optional[str] = Query(None, description="Location filter"),
    cuisine_type: Optional[str] = Query(None, description="Cuisine type filter"),
    time_period: str = Query("year", pattern="^(month|quarter|year)$", description="Trend analysis period"),
    granularity: str = Query("month", pattern="^(day|week|month)$", description="Data granularity"),
    include_forecast: bool = Query(True, description="Include trend forecasting"),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze trends and patterns in restaurant industry data
    """
    try:
        analytics_service = AnalyticsService(db)
        
        trend_analysis = await analytics_service.analyze_trends(
            metric=metric,
            location=location,
            cuisine_type=cuisine_type,
            time_period=time_period,
            granularity=granularity,
            include_forecast=include_forecast
        )
        
        return {
            "metric": metric,
            "filters": {
                "location": location,
                "cuisine_type": cuisine_type
            },
            "time_period": time_period,
            "granularity": granularity,
            "trends": trend_analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trend analysis failed: {str(e)}")


@router.get("/competitive-intelligence")
async def get_competitive_intelligence(
    restaurant_id: uuid.UUID = Query(..., description="Restaurant ID for competitive analysis"),
    analysis_radius_km: float = Query(3.0, ge=0.1, le=10, description="Competitive analysis radius"),
    include_benchmarking: bool = Query(True, description="Include performance benchmarking"),
    include_positioning: bool = Query(True, description="Include market positioning analysis"),
    db: AsyncSession = Depends(get_db)
):
    """
    Comprehensive competitive intelligence analysis
    """
    try:
        analytics_service = AnalyticsService(db)
        
        competitive_intel = await analytics_service.get_competitive_intelligence(
            restaurant_id=restaurant_id,
            analysis_radius_km=analysis_radius_km,
            include_benchmarking=include_benchmarking,
            include_positioning=include_positioning
        )
        
        return {
            "restaurant_id": str(restaurant_id),
            "analysis_radius_km": analysis_radius_km,
            "competitive_intelligence": competitive_intel
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Competitive intelligence failed: {str(e)}")


@router.get("/predictions")
async def get_predictive_analytics(
    restaurant_id: uuid.UUID = Query(..., description="Restaurant ID"),
    prediction_type: str = Query("revenue", pattern="^(revenue|customers|rating|demand)$", description="Type of prediction"),
    forecast_horizon: int = Query(30, ge=1, le=365, description="Forecast horizon in days"),
    confidence_level: float = Query(0.95, ge=0.8, le=0.99, description="Prediction confidence level"),
    include_factors: bool = Query(True, description="Include key driving factors"),
    db: AsyncSession = Depends(get_db)
):
    """
    AI-powered predictive analytics for restaurant performance
    """
    try:
        analytics_service = AnalyticsService(db)
        
        predictions = await analytics_service.generate_predictions(
            restaurant_id=restaurant_id,
            prediction_type=prediction_type,
            forecast_horizon=forecast_horizon,
            confidence_level=confidence_level,
            include_factors=include_factors
        )
        
        return {
            "restaurant_id": str(restaurant_id),
            "prediction_type": prediction_type,
            "forecast_horizon": forecast_horizon,
            "confidence_level": confidence_level,
            "predictions": predictions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Predictive analytics failed: {str(e)}")


@router.get("/insights")
async def get_automated_insights(
    restaurant_id: Optional[uuid.UUID] = Query(None, description="Restaurant ID for specific insights"),
    location: Optional[str] = Query(None, description="Location for market insights"),
    insight_types: List[str] = Query(["performance", "opportunities", "risks"], description="Types of insights to generate"),
    time_period: str = Query("month", pattern="^(week|month|quarter)$", description="Analysis time period"),
    min_confidence: float = Query(0.7, ge=0.5, le=1.0, description="Minimum confidence threshold for insights"),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate automated business insights using AI analysis
    """
    try:
        analytics_service = AnalyticsService(db)
        
        insights = await analytics_service.generate_automated_insights(
            restaurant_id=restaurant_id,
            location=location,
            insight_types=insight_types,
            time_period=time_period,
            min_confidence=min_confidence
        )
        
        return {
            "scope": "restaurant" if restaurant_id else "market",
            "target_id": str(restaurant_id) if restaurant_id else location,
            "insight_types": insight_types,
            "time_period": time_period,
            "insights": insights,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insight generation failed: {str(e)}")


@router.get("/benchmarking")
async def get_benchmarking_analysis(
    restaurant_id: uuid.UUID = Query(..., description="Restaurant ID to benchmark"),
    benchmark_against: str = Query("market", pattern="^(market|cuisine|category|competitors)$", description="Benchmarking baseline"),
    metrics: List[str] = Query(["revenue", "rating", "efficiency"], description="Metrics to benchmark"),
    location_radius_km: Optional[float] = Query(5.0, ge=0.1, le=20, description="Radius for local benchmarking"),
    db: AsyncSession = Depends(get_db)
):
    """
    Benchmark restaurant performance against various baselines
    """
    try:
        analytics_service = AnalyticsService(db)
        
        benchmarking = await analytics_service.benchmark_performance(
            restaurant_id=restaurant_id,
            benchmark_against=benchmark_against,
            metrics=metrics,
            location_radius_km=location_radius_km
        )
        
        return {
            "restaurant_id": str(restaurant_id),
            "benchmark_against": benchmark_against,
            "metrics": metrics,
            "benchmarking": benchmarking
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmarking analysis failed: {str(e)}")


@router.get("/roi-analysis")
async def get_roi_analysis(
    restaurant_id: Optional[uuid.UUID] = Query(None, description="Restaurant ID for ROI analysis"),
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="Location latitude for new site ROI"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="Location longitude for new site ROI"),
    investment_amount: float = Query(..., ge=10000, description="Investment amount for ROI calculation"),
    time_horizon: int = Query(36, ge=12, le=120, description="ROI analysis time horizon in months"),
    cuisine_type: Optional[str] = Query(None, description="Target cuisine type"),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate ROI analysis for existing restaurants or potential new locations
    """
    try:
        analytics_service = AnalyticsService(db)
        
        if restaurant_id:
            # Existing restaurant ROI analysis
            roi_analysis = await analytics_service.calculate_restaurant_roi(
                restaurant_id=restaurant_id,
                investment_amount=investment_amount,
                time_horizon=time_horizon
            )
        elif latitude and longitude:
            # New location ROI projection
            roi_analysis = await analytics_service.project_location_roi(
                latitude=latitude,
                longitude=longitude,
                investment_amount=investment_amount,
                time_horizon=time_horizon,
                cuisine_type=cuisine_type
            )
        else:
            raise HTTPException(status_code=400, detail="Either restaurant_id or coordinates must be provided")
        
        return {
            "analysis_type": "existing_restaurant" if restaurant_id else "new_location",
            "target": str(restaurant_id) if restaurant_id else f"{latitude},{longitude}",
            "investment_amount": investment_amount,
            "time_horizon_months": time_horizon,
            "roi_analysis": roi_analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ROI analysis failed: {str(e)}")


@router.get("/export")
async def export_analytics_data(
    restaurant_id: Optional[uuid.UUID] = Query(None, description="Restaurant ID for export"),
    location: Optional[str] = Query(None, description="Location filter for market data"),
    data_types: List[str] = Query(["performance", "trends", "insights"], description="Types of data to export"),
    format: str = Query("json", pattern="^(json|csv|excel)$", description="Export format"),
    start_date: Optional[datetime] = Query(None, description="Start date for data export"),
    end_date: Optional[datetime] = Query(None, description="End date for data export"),
    db: AsyncSession = Depends(get_db)
):
    """
    Export analytics data in various formats
    """
    try:
        analytics_service = AnalyticsService(db)
        
        # Set default date range if not provided
        if not end_date:
            end_date = datetime.utcnow()
        if not start_date:
            start_date = end_date - timedelta(days=90)
        
        export_data = await analytics_service.export_analytics_data(
            restaurant_id=restaurant_id,
            location=location,
            data_types=data_types,
            format=format,
            start_date=start_date,
            end_date=end_date
        )
        
        return {
            "export_info": {
                "restaurant_id": str(restaurant_id) if restaurant_id else None,
                "location": location,
                "data_types": data_types,
                "format": format,
                "date_range": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat()
                }
            },
            "data": export_data,
            "export_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data export failed: {str(e)}")