"""
BiteBase Intelligence Multi-Location Management API
API endpoints for enterprise multi-location restaurant management
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.multi_location.location_manager import MultiLocationManager, LocationPerformanceAnalyzer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/multi-location", tags=["multi-location"])

@router.get("/dashboard/{restaurant_id}")
async def get_multi_location_dashboard(
    restaurant_id: UUID,
    date_range_days: int = Query(default=30, ge=1, le=365, description="Analysis period in days"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive multi-location dashboard"""
    try:
        manager = MultiLocationManager(db)
        dashboard_data = await manager.get_multi_location_dashboard(restaurant_id, date_range_days)
        
        return JSONResponse(
            status_code=200,
            content={
                "dashboard": dashboard_data,
                "generated_at": datetime.utcnow().isoformat()
            }
        )
    
    except Exception as e:
        logger.error(f"Error getting multi-location dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard data")

@router.get("/performance/{restaurant_id}")
async def get_location_performance_summary(
    restaurant_id: UUID,
    date_range_days: int = Query(default=30, ge=1, le=365, description="Analysis period in days"),
    include_recommendations: bool = Query(default=True, description="Include performance recommendations"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get performance summary for all locations"""
    try:
        analyzer = LocationPerformanceAnalyzer(db)
        performance_data = await analyzer.get_location_performance_summary(restaurant_id, date_range_days)
        
        # Filter recommendations if not requested
        if not include_recommendations:
            performance_data.pop('recommendations', None)
        
        return JSONResponse(
            status_code=200,
            content={
                "restaurant_id": str(restaurant_id),
                "performance": performance_data,
                "parameters": {
                    "date_range_days": date_range_days,
                    "include_recommendations": include_recommendations
                },
                "generated_at": datetime.utcnow().isoformat()
            }
        )
    
    except Exception as e:
        logger.error(f"Error getting location performance: {e}")
        raise HTTPException(status_code=500, detail="Failed to get performance data")

@router.post("/compare/{restaurant_id}")
async def compare_locations(
    restaurant_id: UUID,
    location_ids: List[str],
    metrics: Optional[List[str]] = Query(default=None, description="Metrics to compare"),
    date_range_days: int = Query(default=30, ge=1, le=365, description="Analysis period in days"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Compare performance across selected locations"""
    try:
        if len(location_ids) < 2:
            raise HTTPException(status_code=400, detail="At least 2 locations required for comparison")
        
        if len(location_ids) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 locations can be compared at once")
        
        analyzer = LocationPerformanceAnalyzer(db)
        comparison_data = await analyzer.compare_locations(
            restaurant_id, location_ids, metrics, date_range_days
        )
        
        return JSONResponse(
            status_code=200,
            content={
                "restaurant_id": str(restaurant_id),
                "comparison": comparison_data,
                "parameters": {
                    "location_ids": location_ids,
                    "metrics": metrics,
                    "date_range_days": date_range_days
                },
                "generated_at": datetime.utcnow().isoformat()
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing locations: {e}")
        raise HTTPException(status_code=500, detail="Failed to compare locations")

@router.get("/benchmarks/{restaurant_id}/{location_id}")
async def get_location_benchmarks(
    restaurant_id: UUID,
    location_id: str,
    benchmark_type: str = Query(default="internal", description="Type of benchmark"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get performance benchmarks for a specific location"""
    try:
        analyzer = LocationPerformanceAnalyzer(db)
        benchmark_data = await analyzer.get_location_benchmarks(
            restaurant_id, location_id, benchmark_type
        )
        
        return JSONResponse(
            status_code=200,
            content={
                "restaurant_id": str(restaurant_id),
                "benchmarks": benchmark_data,
                "parameters": {
                    "location_id": location_id,
                    "benchmark_type": benchmark_type
                },
                "generated_at": datetime.utcnow().isoformat()
            }
        )
    
    except Exception as e:
        logger.error(f"Error getting location benchmarks: {e}")
        raise HTTPException(status_code=500, detail="Failed to get benchmark data")

@router.get("/analytics/revenue-distribution/{restaurant_id}")
async def get_revenue_distribution(
    restaurant_id: UUID,
    date_range_days: int = Query(default=30, ge=1, le=365, description="Analysis period in days"),
    group_by: str = Query(default="location", description="Grouping method"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get revenue distribution analysis across locations"""
    try:
        analyzer = LocationPerformanceAnalyzer(db)
        
        # Get performance data for all locations
        performance_data = await analyzer.get_location_performance_summary(restaurant_id, date_range_days)
        
        if not performance_data.get('locations'):
            return JSONResponse(
                status_code=200,
                content={
                    "restaurant_id": str(restaurant_id),
                    "revenue_distribution": {
                        "total_revenue": 0,
                        "distribution": [],
                        "insights": []
                    }
                }
            )
        
        # Calculate revenue distribution
        locations = performance_data['locations']
        total_revenue = sum(loc['performance_metrics']['revenue']['total'] for loc in locations if 'performance_metrics' in loc)
        
        distribution = []
        for location in locations:
            if 'performance_metrics' in location:
                revenue = location['performance_metrics']['revenue']['total']
                percentage = (revenue / total_revenue * 100) if total_revenue > 0 else 0
                
                distribution.append({
                    'location_id': location['location_id'],
                    'location_name': location['location_name'],
                    'city': location.get('city', 'Unknown'),
                    'revenue': revenue,
                    'percentage': round(percentage, 2),
                    'daily_average': location['performance_metrics']['revenue']['daily_average']
                })
        
        # Sort by revenue (descending)
        distribution.sort(key=lambda x: x['revenue'], reverse=True)
        
        # Generate insights
        insights = []
        if len(distribution) > 1:
            top_performer = distribution[0]
            insights.append({
                'type': 'top_performer',
                'message': f"{top_performer['location_name']} generates {top_performer['percentage']}% of total revenue",
                'impact': 'high' if top_performer['percentage'] > 40 else 'medium'
            })
            
            # Check for revenue concentration
            top_3_percentage = sum(loc['percentage'] for loc in distribution[:3])
            if top_3_percentage > 70:
                insights.append({
                    'type': 'concentration_risk',
                    'message': f"Top 3 locations generate {top_3_percentage:.1f}% of revenue - consider diversification",
                    'impact': 'medium'
                })
        
        return JSONResponse(
            status_code=200,
            content={
                "restaurant_id": str(restaurant_id),
                "revenue_distribution": {
                    "total_revenue": total_revenue,
                    "distribution": distribution,
                    "insights": insights,
                    "group_by": group_by
                },
                "parameters": {
                    "date_range_days": date_range_days,
                    "group_by": group_by
                },
                "generated_at": datetime.utcnow().isoformat()
            }
        )
    
    except Exception as e:
        logger.error(f"Error getting revenue distribution: {e}")
        raise HTTPException(status_code=500, detail="Failed to get revenue distribution")

@router.get("/analytics/operational-efficiency/{restaurant_id}")
async def get_operational_efficiency(
    restaurant_id: UUID,
    date_range_days: int = Query(default=30, ge=1, le=365, description="Analysis period in days"),
    efficiency_threshold: float = Query(default=80.0, ge=0, le=100, description="Efficiency threshold percentage"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get operational efficiency analysis across locations"""
    try:
        analyzer = LocationPerformanceAnalyzer(db)
        
        # Get performance data
        performance_data = await analyzer.get_location_performance_summary(restaurant_id, date_range_days)
        
        if not performance_data.get('locations'):
            return JSONResponse(
                status_code=200,
                content={
                    "restaurant_id": str(restaurant_id),
                    "operational_efficiency": {
                        "overall_efficiency": 0,
                        "locations": [],
                        "recommendations": []
                    }
                }
            )
        
        # Analyze operational efficiency
        locations = performance_data['locations']
        efficiency_data = []
        total_efficiency = 0
        
        for location in locations:
            if 'performance_metrics' in location:
                operational = location['performance_metrics']['operational']
                staff_efficiency = operational['staff_efficiency']
                inventory_turnover = operational['inventory_turnover']
                customer_satisfaction = operational['customer_satisfaction']
                
                # Calculate composite efficiency score
                composite_score = (staff_efficiency + (inventory_turnover * 4) + (customer_satisfaction * 20)) / 3
                
                efficiency_data.append({
                    'location_id': location['location_id'],
                    'location_name': location['location_name'],
                    'staff_efficiency': staff_efficiency,
                    'inventory_turnover': inventory_turnover,
                    'customer_satisfaction': customer_satisfaction,
                    'composite_score': round(composite_score, 1),
                    'status': 'efficient' if composite_score >= efficiency_threshold else 'needs_improvement'
                })
                
                total_efficiency += composite_score
        
        overall_efficiency = total_efficiency / len(efficiency_data) if efficiency_data else 0
        
        # Generate recommendations
        recommendations = []
        inefficient_locations = [loc for loc in efficiency_data if loc['composite_score'] < efficiency_threshold]
        
        if inefficient_locations:
            recommendations.append({
                'type': 'efficiency_improvement',
                'priority': 'high',
                'message': f"{len(inefficient_locations)} locations below efficiency threshold",
                'affected_locations': [loc['location_id'] for loc in inefficient_locations],
                'suggested_actions': [
                    'Review staff scheduling and training',
                    'Optimize inventory management processes',
                    'Implement customer service improvements'
                ]
            })
        
        # Sort by composite score (descending)
        efficiency_data.sort(key=lambda x: x['composite_score'], reverse=True)
        
        return JSONResponse(
            status_code=200,
            content={
                "restaurant_id": str(restaurant_id),
                "operational_efficiency": {
                    "overall_efficiency": round(overall_efficiency, 1),
                    "locations": efficiency_data,
                    "recommendations": recommendations,
                    "efficiency_threshold": efficiency_threshold
                },
                "parameters": {
                    "date_range_days": date_range_days,
                    "efficiency_threshold": efficiency_threshold
                },
                "generated_at": datetime.utcnow().isoformat()
            }
        )
    
    except Exception as e:
        logger.error(f"Error getting operational efficiency: {e}")
        raise HTTPException(status_code=500, detail="Failed to get operational efficiency data")

@router.get("/alerts/{restaurant_id}")
async def get_location_alerts(
    restaurant_id: UUID,
    severity: Optional[str] = Query(default=None, description="Filter by severity"),
    alert_type: Optional[str] = Query(default=None, description="Filter by alert type"),
    limit: int = Query(default=50, ge=1, le=100, description="Maximum number of alerts"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get alerts and notifications for all locations"""
    try:
        manager = MultiLocationManager(db)
        
        # Get operational alerts
        alerts = await manager._get_operational_alerts(restaurant_id)
        
        # Apply filters
        if severity:
            alerts = [alert for alert in alerts if alert.get('severity') == severity]
        
        if alert_type:
            alerts = [alert for alert in alerts if alert.get('type') == alert_type]
        
        # Limit results
        alerts = alerts[:limit]
        
        # Group alerts by severity
        alert_summary = {
            'urgent': len([a for a in alerts if a.get('severity') == 'urgent']),
            'high': len([a for a in alerts if a.get('severity') == 'high']),
            'medium': len([a for a in alerts if a.get('severity') == 'medium']),
            'low': len([a for a in alerts if a.get('severity') == 'low'])
        }
        
        return JSONResponse(
            status_code=200,
            content={
                "restaurant_id": str(restaurant_id),
                "alerts": {
                    "summary": alert_summary,
                    "total_alerts": len(alerts),
                    "alerts": alerts
                },
                "filters": {
                    "severity": severity,
                    "alert_type": alert_type,
                    "limit": limit
                },
                "generated_at": datetime.utcnow().isoformat()
            }
        )
    
    except Exception as e:
        logger.error(f"Error getting location alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get alerts")
