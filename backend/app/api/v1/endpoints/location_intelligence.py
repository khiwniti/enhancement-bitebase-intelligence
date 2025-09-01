"""
Location Intelligence API endpoints for BiteBase Intelligence
Advanced location analysis and market intelligence
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
import json
import math

router = APIRouter()

# Data Models
class LocationInsight(BaseModel):
    area: str
    total_restaurants: int
    average_rating: float
    average_price: float
    top_cuisines: List[Dict[str, Any]]
    competitor_density: str
    market_potential: str
    recommendations: List[str]
    last_updated: datetime

class MarketAnalysis(BaseModel):
    city: str
    timeframe: str
    overview: Dict[str, Any]
    cuisine_distribution: Dict[str, int]
    area_analysis: Dict[str, Any]
    competitive_analysis: Dict[str, Any]
    trends: Dict[str, Any]
    opportunities: List[str]
    last_updated: datetime

class LocationSearchRequest(BaseModel):
    query: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius: Optional[float] = Field(default=5.0, description="Search radius in kilometers")
    filters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class LocationSearchResult(BaseModel):
    locations: List[Dict[str, Any]]
    total_count: int
    search_metadata: Dict[str, Any]
    insights: Optional[LocationInsight] = None

# Mock data for demonstration
sample_restaurants = [
    {
        "id": "rest_001",
        "name": "Authentic Thai Kitchen",
        "cuisine": "Thai",
        "rating": 4.5,
        "price_range": 150,
        "area": "Sukhumvit",
        "latitude": 13.7563,
        "longitude": 100.5018
    },
    {
        "id": "rest_002", 
        "name": "Bangkok Street Food",
        "cuisine": "Thai",
        "rating": 4.2,
        "price_range": 80,
        "area": "Sukhumvit",
        "latitude": 13.7573,
        "longitude": 100.5028
    },
    {
        "id": "rest_003",
        "name": "Italian Corner",
        "cuisine": "Italian", 
        "rating": 4.3,
        "price_range": 200,
        "area": "Sukhumvit",
        "latitude": 13.7553,
        "longitude": 100.5008
    },
    {
        "id": "rest_004",
        "name": "Sushi Master",
        "cuisine": "Japanese",
        "rating": 4.6,
        "price_range": 300,
        "area": "Silom",
        "latitude": 13.7244,
        "longitude": 100.5347
    },
    {
        "id": "rest_005",
        "name": "Green Curry House",
        "cuisine": "Thai",
        "rating": 4.1,
        "price_range": 120,
        "area": "Silom", 
        "latitude": 13.7254,
        "longitude": 100.5357
    }
]

@router.post("/search", response_model=LocationSearchResult)
async def search_locations(request: LocationSearchRequest):
    """Advanced location search with intelligence insights"""
    
    # Filter restaurants based on search criteria
    filtered_restaurants = []
    
    for restaurant in sample_restaurants:
        # Text search
        if request.query.lower() in restaurant["name"].lower() or \
           request.query.lower() in restaurant["cuisine"].lower() or \
           request.query.lower() in restaurant["area"].lower():
            
            # Distance filter if coordinates provided
            if request.latitude and request.longitude:
                distance = calculate_distance(
                    request.latitude, request.longitude,
                    restaurant["latitude"], restaurant["longitude"]
                )
                if distance <= request.radius:
                    restaurant["distance"] = distance
                    filtered_restaurants.append(restaurant)
            else:
                filtered_restaurants.append(restaurant)
    
    # Generate insights for the search results
    insights = None
    if filtered_restaurants:
        insights = generate_location_insights(filtered_restaurants)
    
    return LocationSearchResult(
        locations=filtered_restaurants,
        total_count=len(filtered_restaurants),
        search_metadata={
            "query": request.query,
            "radius": request.radius,
            "search_time": datetime.now().isoformat(),
            "has_coordinates": bool(request.latitude and request.longitude)
        },
        insights=insights
    )

@router.get("/insights/{area}", response_model=LocationInsight)
async def get_area_insights(area: str):
    """Get detailed insights for a specific area"""
    
    # Filter restaurants by area
    area_restaurants = [r for r in sample_restaurants if r["area"].lower() == area.lower()]
    
    if not area_restaurants:
        raise HTTPException(status_code=404, detail=f"No data found for area: {area}")
    
    insights = generate_location_insights(area_restaurants, area)
    return insights

@router.get("/market-analysis/{city}", response_model=MarketAnalysis)
async def get_market_analysis(
    city: str,
    timeframe: str = Query(default="30d", description="Analysis timeframe: 7d, 30d, 90d, 1y")
):
    """Get comprehensive market analysis for a city"""
    
    # Filter restaurants by city (using area as proxy)
    city_restaurants = sample_restaurants  # In real implementation, filter by city
    
    analysis = MarketAnalysis(
        city=city,
        timeframe=timeframe,
        overview=generate_market_overview(city_restaurants),
        cuisine_distribution=get_cuisine_distribution(city_restaurants),
        area_analysis=get_area_analysis(city_restaurants),
        competitive_analysis=get_competitive_analysis(city_restaurants),
        trends=get_market_trends(city_restaurants, timeframe),
        opportunities=identify_opportunities(city_restaurants),
        last_updated=datetime.now()
    )
    
    return analysis

@router.get("/competitor-analysis")
async def get_competitor_analysis(
    latitude: float = Query(..., description="Latitude of target location"),
    longitude: float = Query(..., description="Longitude of target location"),
    radius: float = Query(default=2.0, description="Analysis radius in kilometers"),
    cuisine_type: Optional[str] = Query(None, description="Filter by cuisine type")
):
    """Get competitor analysis for a specific location"""
    
    # Find competitors within radius
    competitors = []
    for restaurant in sample_restaurants:
        distance = calculate_distance(latitude, longitude, restaurant["latitude"], restaurant["longitude"])
        if distance <= radius:
            if not cuisine_type or restaurant["cuisine"].lower() == cuisine_type.lower():
                restaurant["distance"] = distance
                competitors.append(restaurant)
    
    # Sort by distance
    competitors.sort(key=lambda x: x["distance"])
    
    # Generate competitive analysis
    analysis = {
        "location": {"latitude": latitude, "longitude": longitude},
        "search_radius": radius,
        "total_competitors": len(competitors),
        "competitors": competitors,
        "competitive_metrics": {
            "average_rating": sum(c["rating"] for c in competitors) / len(competitors) if competitors else 0,
            "average_price": sum(c["price_range"] for c in competitors) / len(competitors) if competitors else 0,
            "cuisine_diversity": len(set(c["cuisine"] for c in competitors)),
            "density_score": calculate_density_score(len(competitors), radius)
        },
        "recommendations": generate_competitive_recommendations(competitors),
        "market_gaps": identify_market_gaps(competitors)
    }
    
    return analysis

@router.get("/foot-traffic/{location_id}")
async def get_foot_traffic_analysis(location_id: str):
    """Get foot traffic analysis for a specific location"""
    
    # Mock foot traffic data
    traffic_data = {
        "location_id": location_id,
        "current_traffic": "moderate",
        "peak_hours": ["12:00-14:00", "18:00-21:00"],
        "daily_patterns": {
            "monday": 65,
            "tuesday": 70,
            "wednesday": 75,
            "thursday": 80,
            "friday": 95,
            "saturday": 100,
            "sunday": 85
        },
        "hourly_patterns": [
            {"hour": "06:00", "traffic": 10},
            {"hour": "07:00", "traffic": 25},
            {"hour": "08:00", "traffic": 45},
            {"hour": "09:00", "traffic": 35},
            {"hour": "10:00", "traffic": 30},
            {"hour": "11:00", "traffic": 50},
            {"hour": "12:00", "traffic": 85},
            {"hour": "13:00", "traffic": 90},
            {"hour": "14:00", "traffic": 70},
            {"hour": "15:00", "traffic": 40},
            {"hour": "16:00", "traffic": 45},
            {"hour": "17:00", "traffic": 60},
            {"hour": "18:00", "traffic": 85},
            {"hour": "19:00", "traffic": 95},
            {"hour": "20:00", "traffic": 100},
            {"hour": "21:00", "traffic": 80},
            {"hour": "22:00", "traffic": 50},
            {"hour": "23:00", "traffic": 25}
        ],
        "seasonal_trends": {
            "high_season": ["November", "December", "January", "February"],
            "low_season": ["June", "July", "August", "September"],
            "growth_rate": 8.5
        },
        "demographics": {
            "age_groups": {"18-25": 30, "26-35": 35, "36-50": 25, "50+": 10},
            "visitor_types": {"locals": 70, "tourists": 20, "business": 10}
        }
    }
    
    return traffic_data

# Helper functions
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in kilometers"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def generate_location_insights(restaurants: List[Dict], area: str = None) -> LocationInsight:
    """Generate insights for a list of restaurants"""
    if not restaurants:
        raise ValueError("No restaurants provided for analysis")
    
    total_restaurants = len(restaurants)
    average_rating = sum(r["rating"] for r in restaurants) / total_restaurants
    average_price = sum(r["price_range"] for r in restaurants) / total_restaurants
    
    # Get top cuisines
    cuisine_counts = {}
    for r in restaurants:
        cuisine = r["cuisine"]
        cuisine_counts[cuisine] = cuisine_counts.get(cuisine, 0) + 1
    
    top_cuisines = [
        {"cuisine": cuisine, "count": count, "percentage": (count/total_restaurants)*100}
        for cuisine, count in sorted(cuisine_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    
    # Determine competitor density
    density = "high" if total_restaurants > 10 else "medium" if total_restaurants > 5 else "low"
    
    # Determine market potential
    potential = "high" if average_rating < 4.0 and average_price > 150 else "medium"
    
    # Generate recommendations
    recommendations = []
    if average_rating < 4.0:
        recommendations.append("Focus on improving food quality and service")
    if average_price > 200:
        recommendations.append("Consider more affordable menu options")
    if len(top_cuisines) > 0 and top_cuisines[0]["percentage"] > 60:
        recommendations.append("Diversify cuisine offerings to stand out")
    
    return LocationInsight(
        area=area or "Unknown",
        total_restaurants=total_restaurants,
        average_rating=round(average_rating, 2),
        average_price=round(average_price, 2),
        top_cuisines=top_cuisines,
        competitor_density=density,
        market_potential=potential,
        recommendations=recommendations,
        last_updated=datetime.now()
    )

def generate_market_overview(restaurants: List[Dict]) -> Dict[str, Any]:
    """Generate market overview statistics"""
    return {
        "total_restaurants": len(restaurants),
        "average_rating": round(sum(r["rating"] for r in restaurants) / len(restaurants), 2),
        "price_range": {
            "min": min(r["price_range"] for r in restaurants),
            "max": max(r["price_range"] for r in restaurants),
            "average": round(sum(r["price_range"] for r in restaurants) / len(restaurants), 2)
        },
        "market_saturation": "medium",
        "growth_potential": "high"
    }

def get_cuisine_distribution(restaurants: List[Dict]) -> Dict[str, int]:
    """Get distribution of cuisines"""
    distribution = {}
    for r in restaurants:
        cuisine = r["cuisine"]
        distribution[cuisine] = distribution.get(cuisine, 0) + 1
    return distribution

def get_area_analysis(restaurants: List[Dict]) -> Dict[str, Any]:
    """Analyze restaurants by area"""
    area_stats = {}
    for r in restaurants:
        area = r["area"]
        if area not in area_stats:
            area_stats[area] = {"count": 0, "ratings": [], "prices": []}
        area_stats[area]["count"] += 1
        area_stats[area]["ratings"].append(r["rating"])
        area_stats[area]["prices"].append(r["price_range"])
    
    # Calculate averages
    for area, stats in area_stats.items():
        stats["average_rating"] = round(sum(stats["ratings"]) / len(stats["ratings"]), 2)
        stats["average_price"] = round(sum(stats["prices"]) / len(stats["prices"]), 2)
        del stats["ratings"]
        del stats["prices"]
    
    return area_stats

def get_competitive_analysis(restaurants: List[Dict]) -> Dict[str, Any]:
    """Analyze competitive landscape"""
    return {
        "competition_level": "high" if len(restaurants) > 10 else "medium",
        "market_leaders": sorted(restaurants, key=lambda x: x["rating"], reverse=True)[:3],
        "price_competition": "intense" if max(r["price_range"] for r in restaurants) - min(r["price_range"] for r in restaurants) > 200 else "moderate",
        "differentiation_opportunities": ["unique_cuisine", "premium_service", "value_pricing"]
    }

def get_market_trends(restaurants: List[Dict], timeframe: str) -> Dict[str, Any]:
    """Analyze market trends"""
    return {
        "growth_rate": 8.5,
        "emerging_cuisines": ["Korean", "Vietnamese", "Fusion"],
        "declining_trends": ["Fast_food"],
        "price_trends": "increasing",
        "quality_trends": "improving"
    }

def identify_opportunities(restaurants: List[Dict]) -> List[str]:
    """Identify market opportunities"""
    opportunities = []
    
    cuisines = [r["cuisine"] for r in restaurants]
    if "Korean" not in cuisines:
        opportunities.append("Korean cuisine gap in market")
    if "Vietnamese" not in cuisines:
        opportunities.append("Vietnamese cuisine opportunity")
    
    avg_price = sum(r["price_range"] for r in restaurants) / len(restaurants)
    if avg_price > 200:
        opportunities.append("Budget-friendly dining option needed")
    
    opportunities.extend([
        "Late night dining market",
        "Healthy food options",
        "Corporate catering services",
        "Food delivery optimization"
    ])
    
    return opportunities

def calculate_density_score(competitor_count: int, radius: float) -> str:
    """Calculate competitive density score"""
    density = competitor_count / (math.pi * radius**2)
    if density > 2:
        return "very_high"
    elif density > 1:
        return "high"
    elif density > 0.5:
        return "medium"
    else:
        return "low"

def generate_competitive_recommendations(competitors: List[Dict]) -> List[str]:
    """Generate recommendations based on competitive analysis"""
    recommendations = []
    
    if len(competitors) > 5:
        recommendations.append("High competition - focus on differentiation")
    
    avg_rating = sum(c["rating"] for c in competitors) / len(competitors) if competitors else 0
    if avg_rating < 4.0:
        recommendations.append("Opportunity to excel with superior quality")
    
    avg_price = sum(c["price_range"] for c in competitors) / len(competitors) if competitors else 0
    if avg_price > 200:
        recommendations.append("Consider competitive pricing strategy")
    
    return recommendations

def identify_market_gaps(competitors: List[Dict]) -> List[str]:
    """Identify gaps in the competitive market"""
    gaps = []
    
    cuisines = set(c["cuisine"] for c in competitors)
    all_cuisines = {"Thai", "Italian", "Japanese", "Korean", "Vietnamese", "Indian", "Chinese"}
    missing_cuisines = all_cuisines - cuisines
    
    for cuisine in missing_cuisines:
        gaps.append(f"{cuisine} cuisine not represented")
    
    price_ranges = [c["price_range"] for c in competitors]
    if not any(p < 100 for p in price_ranges):
        gaps.append("Budget dining option missing")
    if not any(p > 300 for p in price_ranges):
        gaps.append("Premium dining opportunity")
    
    return gaps
