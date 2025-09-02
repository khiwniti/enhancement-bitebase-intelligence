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
from app.services.analytics.integrated_analytics_service import IntegratedAnalyticsService

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

@router.get("/metrics")
async def get_analytics_metrics(
    restaurant_id: Optional[uuid.UUID] = Query(None, description="Restaurant ID filter"),
    time_period: str = Query("month", description="Time period for metrics"),
    metrics: List[str] = Query(["revenue", "customers", "orders"], description="Metrics to include"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get analytics metrics for frontend compatibility
    """
    try:
        # Mock metrics data - replace with actual analytics service
        metrics_data = {
            "revenue": {
                "current": 125000,
                "previous": 118000,
                "change": 5.9,
                "trend": "up"
            },
            "customers": {
                "current": 1250,
                "previous": 1180,
                "change": 5.9,
                "trend": "up"
            },
            "orders": {
                "current": 3400,
                "previous": 3200,
                "change": 6.25,
                "trend": "up"
            },
            "rating": {
                "current": 4.2,
                "previous": 4.1,
                "change": 2.4,
                "trend": "up"
            }
        }

        return {
            "success": True,
            "data": metrics_data,
            "time_period": time_period,
            "restaurant_id": str(restaurant_id) if restaurant_id else None,
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")

@router.get("/charts/{chart_id}")
async def get_chart_data(
    chart_id: str,
    time_period: str = Query("month", description="Time period for chart data"),
    restaurant_id: Optional[uuid.UUID] = Query(None, description="Restaurant ID filter"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get chart data for specific chart ID
    """
    try:
        # Mock chart data based on chart_id
        if chart_id == "revenue_trend":
            chart_data = {
                "type": "line",
                "data": {
                    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    "datasets": [{
                        "label": "Revenue",
                        "data": [65000, 72000, 68000, 81000, 76000, 85000],
                        "borderColor": "rgb(34, 197, 94)",
                        "backgroundColor": "rgba(34, 197, 94, 0.1)"
                    }]
                }
            }
        elif chart_id == "customer_flow":
            chart_data = {
                "type": "bar",
                "data": {
                    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    "datasets": [{
                        "label": "Customers",
                        "data": [120, 150, 180, 200, 250, 300, 280],
                        "backgroundColor": "rgba(59, 130, 246, 0.8)"
                    }]
                }
            }
        else:
            chart_data = {
                "type": "doughnut",
                "data": {
                    "labels": ["Thai", "Italian", "Japanese", "Mexican"],
                    "datasets": [{
                        "data": [30, 25, 20, 25],
                        "backgroundColor": ["#ef4444", "#f97316", "#eab308", "#22c55e"]
                    }]
                }
            }

        return {
            "success": True,
            "chart_id": chart_id,
            "data": chart_data,
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chart data: {str(e)}")

@router.post("/query")
async def execute_analytics_query(
    query: str,
    params: Optional[dict] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Execute custom analytics query
    """
    try:
        # Mock query execution - in production, validate and execute SQL safely
        if "revenue" in query.lower():
            result = {
                "columns": ["date", "revenue", "orders"],
                "data": [
                    ["2024-01-01", 5000, 45],
                    ["2024-01-02", 5200, 48],
                    ["2024-01-03", 4800, 42]
                ]
            }
        elif "customer" in query.lower():
            result = {
                "columns": ["customer_id", "name", "total_orders"],
                "data": [
                    [1, "John Doe", 15],
                    [2, "Jane Smith", 12],
                    [3, "Bob Johnson", 8]
                ]
            }
        else:
            result = {
                "columns": ["metric", "value"],
                "data": [
                    ["total_revenue", 125000],
                    ["total_customers", 1250],
                    ["avg_rating", 4.2]
                ]
            }

        return {
            "success": True,
            "query": query,
            "result": result,
            "execution_time_ms": 45,
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute query: {str(e)}")

@router.post("/reports")
async def generate_analytics_report(
    config: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate analytics report based on configuration
    """
    try:
        # Mock report generation
        report_data = {
            "report_id": f"report_{uuid.uuid4()}",
            "title": config.get("title", "Analytics Report"),
            "type": config.get("type", "summary"),
            "sections": [
                {
                    "title": "Revenue Overview",
                    "data": {
                        "total_revenue": 125000,
                        "growth_rate": 12.5,
                        "top_performing_day": "Saturday"
                    }
                },
                {
                    "title": "Customer Insights",
                    "data": {
                        "total_customers": 1250,
                        "new_customers": 180,
                        "retention_rate": 85.2
                    }
                }
            ],
            "generated_at": datetime.utcnow().isoformat(),
            "download_url": f"/api/v1/analytics/reports/download/{uuid.uuid4()}"
        }

        return {
            "success": True,
            "report": report_data,
            "message": "Report generated successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.post("/export")
async def export_analytics_data(
    params: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Export analytics data in specified format
    """
    try:
        export_format = params.get("format", "csv")
        data_type = params.get("data_type", "revenue")

        # Mock export data
        export_data = {
            "export_id": f"export_{uuid.uuid4()}",
            "format": export_format,
            "data_type": data_type,
            "file_size": "2.5MB",
            "download_url": f"/api/v1/analytics/exports/download/{uuid.uuid4()}.{export_format}",
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
            "generated_at": datetime.utcnow().isoformat()
        }

        return {
            "success": True,
            "export": export_data,
            "message": f"Data exported successfully in {export_format} format"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export data: {str(e)}")

@router.get("/exports/download/{export_id}")
async def download_export_file(
    export_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Download exported analytics file
    """
    try:
        # Mock file download - in production, retrieve from storage
        # Check if export exists and is ready

        # Mock file content based on export_id
        if "csv" in export_id:
            file_content = """Date,Revenue,Orders,Customers
2024-01-01,5000,45,32
2024-01-02,5200,48,35
2024-01-03,4800,42,30"""
            content_type = "text/csv"
            filename = f"analytics_export_{datetime.utcnow().strftime('%Y%m%d')}.csv"

        elif "excel" in export_id:
            # Mock Excel content
            file_content = "Mock Excel file content - would be binary in production"
            content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            filename = f"analytics_export_{datetime.utcnow().strftime('%Y%m%d')}.xlsx"

        else:
            # Default JSON
            file_content = {
                "export_id": export_id,
                "data": {
                    "revenue": [5000, 5200, 4800],
                    "orders": [45, 48, 42],
                    "customers": [32, 35, 30]
                },
                "generated_at": datetime.utcnow().isoformat()
            }
            content_type = "application/json"
            filename = f"analytics_export_{datetime.utcnow().strftime('%Y%m%d')}.json"

        return {
            "success": True,
            "export_id": export_id,
            "filename": filename,
            "content_type": content_type,
            "content": file_content,
            "download_url": f"/api/v1/analytics/exports/download/{export_id}",
            "file_size": len(str(file_content)) if isinstance(file_content, str) else len(str(file_content))
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download export: {str(e)}")

@router.get("/reports/download/{report_id}")
async def download_analytics_report(
    report_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Download generated analytics report
    """
    try:
        # Mock report download
        report_content = {
            "report_id": report_id,
            "title": "Analytics Report",
            "generated_at": datetime.utcnow().isoformat(),
            "sections": [
                {
                    "title": "Revenue Overview",
                    "data": {
                        "total_revenue": 125000,
                        "growth_rate": 12.5,
                        "top_performing_day": "Saturday"
                    }
                },
                {
                    "title": "Customer Insights",
                    "data": {
                        "total_customers": 1250,
                        "new_customers": 180,
                        "retention_rate": 85.2
                    }
                }
            ]
        }

        return {
            "success": True,
            "report_id": report_id,
            "filename": f"analytics_report_{datetime.utcnow().strftime('%Y%m%d')}.json",
            "content_type": "application/json",
            "content": report_content,
            "file_size": len(str(report_content))
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download report: {str(e)}")


@router.get("/integrated-dashboard")
async def get_integrated_analytics_dashboard(
    restaurant_id: Optional[uuid.UUID] = Query(None, description="Specific restaurant ID"),
    time_period: str = Query("month", pattern="^(week|month|quarter|year)$", description="Analysis time period"),
    include_predictions: bool = Query(True, description="Include predictive analytics"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get integrated analytics dashboard combining restaurant, campaign, and POS data
    """
    try:
        integrated_service = IntegratedAnalyticsService(db)

        dashboard_data = await integrated_service.get_comprehensive_dashboard(
            restaurant_id=restaurant_id,
            time_period=time_period,
            include_predictions=include_predictions
        )

        return {
            "dashboard_type": "integrated",
            "time_period": time_period,
            "restaurant_id": str(restaurant_id) if restaurant_id else None,
            "data": dashboard_data,
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Integrated dashboard generation failed: {str(e)}")


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