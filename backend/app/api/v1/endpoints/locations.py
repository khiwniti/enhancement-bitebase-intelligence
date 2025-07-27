"""
BiteBase Intelligence Location API Endpoints
Location intelligence and site analysis functionality
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
# from geoalchemy2.functions import ST_DWithin, ST_GeogFromText  # Disabled for SQLite
from typing import List, Optional, Dict, Any
import uuid
import math
from datetime import datetime

from app.core.database import get_db
from app.models.restaurant import Restaurant, LocationAnalysis
from app.services.location.location_intelligence_service import LocationIntelligenceService
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


@router.post("/analyze")
async def analyze_location(
    latitude: float = Query(..., ge=-90, le=90, description="Location latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Location longitude"),
    radius_km: float = Query(2.0, ge=0.1, le=10, description="Analysis radius in kilometers"),
    cuisine_types: Optional[List[str]] = Query(None, description="Target cuisine types for analysis"),
    category: Optional[str] = Query(None, description="Target restaurant category"),
    db: AsyncSession = Depends(get_db)
):
    """
    Perform comprehensive location intelligence analysis
    """
    try:
        location_service = LocationIntelligenceService(db)
        
        analysis_result = await location_service.analyze_location(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            target_cuisine_types=cuisine_types,
            target_category=category
        )
        
        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "radius_km": radius_km
            },
            "analysis": analysis_result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location analysis failed: {str(e)}")


@router.get("/score")
async def get_location_score(
    latitude: float = Query(..., ge=-90, le=90, description="Location latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Location longitude"),
    cuisine_type: Optional[str] = Query(None, description="Target cuisine type"),
    category: Optional[str] = Query(None, description="Target restaurant category"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get AI-powered location success score (1-100)
    """
    try:
        location_service = LocationIntelligenceService(db)
        
        score_result = await location_service.calculate_location_score(
            latitude=latitude,
            longitude=longitude,
            target_cuisine_type=cuisine_type,
            target_category=category
        )
        
        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "target": {
                "cuisine_type": cuisine_type,
                "category": category
            },
            "score": score_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location scoring failed: {str(e)}")


@router.get("/competitors")
async def get_location_competitors(
    latitude: float = Query(..., ge=-90, le=90, description="Location latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Location longitude"),
    radius_km: float = Query(2.0, ge=0.1, le=10, description="Search radius in kilometers"),
    cuisine_type: Optional[str] = Query(None, description="Filter by cuisine type"),
    category: Optional[str] = Query(None, description="Filter by restaurant category"),
    include_analysis: bool = Query(False, description="Include competitive analysis"),
    db: AsyncSession = Depends(get_db)
):
    """
    Find competitor restaurants within specified radius
    """
    try:
        # Build base query for active restaurants
        query = select(Restaurant).where(Restaurant.is_active == True)
        
        # Apply filters
        if cuisine_type:
            query = query.where(Restaurant.cuisine_types.any(cuisine_type))
        
        if category:
            query = query.where(Restaurant.category == category)
        
        # Execute query and filter by distance
        result = await db.execute(query)
        all_restaurants = result.scalars().all()
        
        # Filter by distance and calculate distances
        competitors_with_distance = []
        for restaurant in all_restaurants:
            distance_km = calculate_distance(
                latitude, longitude,
                restaurant.latitude, restaurant.longitude
            )
            if distance_km <= radius_km:
                competitors_with_distance.append((restaurant, distance_km))
        
        # Sort by distance and limit to 50
        competitors_with_distance.sort(key=lambda x: x[1])
        competitors_with_distance = competitors_with_distance[:50]
        
        # Process results
        competitors = []
        for restaurant, distance_km in competitors_with_distance:
            competitor_data = {
                "id": str(restaurant.id),
                "name": restaurant.name,
                "brand": restaurant.brand,
                "cuisine_types": restaurant.cuisine_types,
                "category": restaurant.category,
                "price_range": restaurant.price_range,
                "average_rating": restaurant.average_rating,
                "total_reviews": restaurant.total_reviews,
                "address": restaurant.address,
                "distance_km": round(distance_km, 2),
                "location": {
                    "latitude": restaurant.latitude,
                    "longitude": restaurant.longitude
                }
            }
            
            if include_analysis:
                # Add competitive threat analysis
                threat_level = "high" if row.distance_m < 500 else "medium" if row.distance_m < 1000 else "low"
                competitor_data["threat_analysis"] = {
                    "threat_level": threat_level,
                    "market_overlap": 0.8 if cuisine_type in row.Restaurant.cuisine_types else 0.3,
                    "rating_advantage": (row.Restaurant.average_rating or 0) - 3.5,
                    "review_volume": "high" if row.Restaurant.total_reviews > 100 else "medium" if row.Restaurant.total_reviews > 20 else "low"
                }
            
            competitors.append(competitor_data)
        
        # Calculate market density metrics
        total_competitors = len(competitors)
        area_km2 = 3.14159 * (radius_km ** 2)
        density_per_km2 = total_competitors / area_km2
        
        # Determine market saturation
        if density_per_km2 > 10:
            saturation = "high"
        elif density_per_km2 > 5:
            saturation = "medium"
        else:
            saturation = "low"
        
        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "radius_km": radius_km
            },
            "filters": {
                "cuisine_type": cuisine_type,
                "category": category
            },
            "competitors": competitors,
            "market_analysis": {
                "total_competitors": total_competitors,
                "density_per_km2": round(density_per_km2, 2),
                "market_saturation": saturation,
                "category_breakdown": {},  # Would calculate category distribution
                "average_rating": round(sum(c.get("average_rating", 0) or 0 for c in competitors) / max(total_competitors, 1), 2)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Competitor analysis failed: {str(e)}")


@router.get("/demographics")
async def get_location_demographics(
    latitude: float = Query(..., ge=-90, le=90, description="Location latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Location longitude"),
    radius_km: float = Query(1.0, ge=0.1, le=5, description="Analysis radius in kilometers"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get demographic analysis for a location
    """
    try:
        location_service = LocationIntelligenceService(db)
        
        demographics = await location_service.get_demographic_data(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km
        )
        
        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "radius_km": radius_km
            },
            "demographics": demographics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demographic analysis failed: {str(e)}")


@router.get("/market-opportunity")
async def get_market_opportunity(
    latitude: float = Query(..., ge=-90, le=90, description="Location latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Location longitude"),
    radius_km: float = Query(3.0, ge=0.1, le=10, description="Analysis radius in kilometers"),
    target_investment: Optional[float] = Query(None, ge=10000, description="Target investment amount"),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze market opportunity and provide recommendations
    """
    try:
        location_service = LocationIntelligenceService(db)
        restaurant_service = RestaurantService(db)
        
        # Get market density analysis
        market_density = await restaurant_service.calculate_market_density(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km
        )
        
        # Get location score
        location_score = await location_service.calculate_location_score(
            latitude=latitude,
            longitude=longitude
        )
        
        # Analyze cuisine gaps
        cuisine_analysis = await location_service.analyze_cuisine_gaps(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km
        )
        
        # Generate recommendations
        recommendations = []
        
        # High opportunity cuisines
        for cuisine_gap in cuisine_analysis.get("underserved_cuisines", []):
            recommendations.append({
                "type": "cuisine_opportunity",
                "cuisine": cuisine_gap["cuisine"],
                "opportunity_score": cuisine_gap["opportunity_score"],
                "description": f"Underserved {cuisine_gap['cuisine']} market with high demand potential",
                "estimated_investment": cuisine_gap.get("estimated_investment", 150000),
                "risk_level": cuisine_gap.get("risk_level", "medium")
            })
        
        # Location-specific recommendations
        if location_score["overall_score"] > 75:
            recommendations.append({
                "type": "location_advantage",
                "description": "Excellent location with high success probability",
                "opportunity_score": location_score["overall_score"],
                "key_factors": location_score.get("key_strengths", [])
            })
        
        # Market saturation warnings
        if market_density["market_saturation"] == "high":
            recommendations.append({
                "type": "market_warning",
                "description": "High market saturation - consider differentiation strategy",
                "risk_level": "high",
                "mitigation_strategies": [
                    "Focus on unique cuisine or concept",
                    "Premium positioning",
                    "Strong brand differentiation"
                ]
            })
        
        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "radius_km": radius_km
            },
            "market_analysis": {
                "location_score": location_score,
                "market_density": market_density,
                "cuisine_analysis": cuisine_analysis
            },
            "opportunity_assessment": {
                "overall_opportunity": "high" if location_score["overall_score"] > 70 else "medium" if location_score["overall_score"] > 50 else "low",
                "key_opportunities": len([r for r in recommendations if r["type"] == "cuisine_opportunity"]),
                "risk_factors": len([r for r in recommendations if r.get("risk_level") == "high"])
            },
            "recommendations": recommendations,
            "investment_analysis": {
                "target_investment": target_investment,
                "estimated_roi_timeline": "12-18 months" if location_score["overall_score"] > 70 else "18-24 months",
                "success_probability": f"{min(location_score['overall_score'], 95)}%"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market opportunity analysis failed: {str(e)}")


@router.get("/foot-traffic")
async def get_foot_traffic_analysis(
    latitude: float = Query(..., ge=-90, le=90, description="Location latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Location longitude"),
    radius_m: int = Query(500, ge=100, le=2000, description="Analysis radius in meters"),
    time_period: str = Query("week", pattern="^(day|week|month)$", description="Analysis time period"),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze foot traffic patterns for a location
    """
    try:
        location_service = LocationIntelligenceService(db)
        
        # Get foot traffic data (would integrate with external APIs)
        foot_traffic_data = await location_service.analyze_foot_traffic(
            latitude=latitude,
            longitude=longitude,
            radius_m=radius_m,
            time_period=time_period
        )
        
        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "radius_m": radius_m
            },
            "time_period": time_period,
            "foot_traffic": foot_traffic_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Foot traffic analysis failed: {str(e)}")


@router.get("/accessibility")
async def get_accessibility_analysis(
    latitude: float = Query(..., ge=-90, le=90, description="Location latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Location longitude"),
    transport_modes: List[str] = Query(["walking", "driving", "transit"], description="Transportation modes to analyze"),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze location accessibility via different transportation modes
    """
    try:
        location_service = LocationIntelligenceService(db)
        
        accessibility_data = await location_service.analyze_accessibility(
            latitude=latitude,
            longitude=longitude,
            transport_modes=transport_modes
        )
        
        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "transport_modes": transport_modes,
            "accessibility": accessibility_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Accessibility analysis failed: {str(e)}")


@router.post("/compare")
async def compare_locations(
    request: Dict[str, Any],
    analysis_type: str = Query("comprehensive", pattern="^(basic|comprehensive|competitive)$", description="Type of comparison analysis"),
    target_cuisine: Optional[str] = Query(None, description="Target cuisine for analysis"),
    db: AsyncSession = Depends(get_db)
):
    """
    Compare multiple locations for restaurant site selection
    """
    try:
        locations = request.get("locations", [])
        if len(locations) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 locations can be compared at once")
        
        location_service = LocationIntelligenceService(db)
        
        comparison_results = []
        
        for i, location in enumerate(locations):
            if "latitude" not in location or "longitude" not in location:
                raise HTTPException(status_code=400, detail=f"Location {i+1} missing latitude or longitude")
            
            # Perform analysis for each location
            if analysis_type == "comprehensive":
                analysis = await location_service.analyze_location(
                    latitude=location["latitude"],
                    longitude=location["longitude"],
                    target_cuisine_types=[target_cuisine] if target_cuisine else None
                )
            else:
                # Basic analysis - just location score
                analysis = await location_service.calculate_location_score(
                    latitude=location["latitude"],
                    longitude=location["longitude"],
                    target_cuisine_type=target_cuisine
                )
            
            comparison_results.append({
                "location_id": i + 1,
                "coordinates": location,
                "analysis": analysis
            })
        
        # Rank locations by overall score
        if analysis_type == "comprehensive":
            comparison_results.sort(key=lambda x: x["analysis"]["location_score"]["overall_score"], reverse=True)
        else:
            comparison_results.sort(key=lambda x: x["analysis"]["overall_score"], reverse=True)
        
        # Add rankings
        for i, result in enumerate(comparison_results):
            result["rank"] = i + 1
        
        return {
            "comparison_type": analysis_type,
            "target_cuisine": target_cuisine,
            "locations_analyzed": len(locations),
            "results": comparison_results,
            "summary": {
                "best_location": comparison_results[0] if comparison_results else None,
                "score_range": {
                    "highest": comparison_results[0]["analysis"].get("overall_score", 0) if comparison_results else 0,
                    "lowest": comparison_results[-1]["analysis"].get("overall_score", 0) if comparison_results else 0
                }
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location comparison failed: {str(e)}")