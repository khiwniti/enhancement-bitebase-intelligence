"""
Simple BiteBase Intelligence Backend
A working version with essential endpoints
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from typing import List, Optional
import uvicorn
import random
from datetime import datetime, timedelta

# Import operations API
try:
    from operations_api import get_operations_routes
    operations_available = True
except ImportError:
    operations_available = False
    print("Warning: Operations API not available")

# Create FastAPI application
app = FastAPI(
    title="BiteBase Intelligence API",
    description="AI-powered restaurant intelligence platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include operations routes if available
if operations_available:
    try:
        operations_router = get_operations_routes()
        app.include_router(operations_router)
        print("✅ Operations API routes loaded successfully")
    except Exception as e:
        print(f"❌ Error loading operations API: {e}")

# Mock data
MOCK_RESTAURANTS = [
    {
        "id": "1",
        "name": "Bangkok Kitchen",
        "brand": "Bangkok Kitchen",
        "cuisine_types": ["Thai", "Asian"],
        "category": "casual-dining",
        "price_range": "$$",
        "address": "123 Sukhumvit Road, Bangkok",
        "city": "Bangkok",
        "area": "Sukhumvit",
        "country": "Thailand",
        "latitude": 13.7308,
        "longitude": 100.5418,
        "phone": "+66 2-555-0101",
        "website": "https://bangkokkitchen.com",
        "average_rating": 4.5,
        "total_reviews": 245,
        "estimated_revenue": 150000,
        "employee_count": 25,
        "is_active": True
    },
    {
        "id": "2",
        "name": "Tokyo Sushi Bar",
        "brand": "Tokyo Sushi",
        "cuisine_types": ["Japanese", "Sushi"],
        "category": "fine-dining",
        "price_range": "$$$",
        "address": "456 Silom Road, Bangkok",
        "city": "Bangkok",
        "area": "Silom",
        "country": "Thailand",
        "latitude": 13.7248,
        "longitude": 100.5335,
        "phone": "+66 2-555-0102",
        "website": "https://tokyosushi.com",
        "average_rating": 4.8,
        "total_reviews": 389,
        "estimated_revenue": 280000,
        "employee_count": 18,
        "is_active": True
    },
    {
        "id": "3",
        "name": "Street Food Paradise",
        "brand": "Street Food Paradise",
        "cuisine_types": ["Thai", "Street Food"],
        "category": "fast-food",
        "price_range": "$",
        "address": "789 Khao San Road, Bangkok",
        "city": "Bangkok",
        "area": "Khao San",
        "country": "Thailand",
        "latitude": 13.7590,
        "longitude": 100.4977,
        "phone": "+66 2-555-0103",
        "website": None,
        "average_rating": 4.2,
        "total_reviews": 156,
        "estimated_revenue": 85000,
        "employee_count": 8,
        "is_active": True
    }
]

MOCK_ANALYTICS_DATA = {
    "revenue": {
        "total": 2500000,
        "monthly_growth": 15.2,
        "weekly_data": [
            {"week": "Week 1", "revenue": 580000},
            {"week": "Week 2", "revenue": 620000},
            {"week": "Week 3", "revenue": 650000},
            {"week": "Week 4", "revenue": 650000}
        ]
    },
    "customers": {
        "total": 15420,
        "growth_rate": 8.7,
        "new_customers": 1240,
        "returning_customers": 14180
    },
    "orders": {
        "total": 8965,
        "average_order_value": 278.5,
        "peak_hours": ["12:00-14:00", "19:00-21:00"]
    }
}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "BiteBase Intelligence API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "bitebase-intelligence-api",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/restaurants")
async def get_restaurants(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    city: Optional[str] = Query(None),
    cuisine: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    """Get restaurants with filtering"""
    restaurants = MOCK_RESTAURANTS.copy()
    
    # Apply filters
    if city:
        restaurants = [r for r in restaurants if r["city"].lower() == city.lower()]
    
    if cuisine:
        restaurants = [r for r in restaurants if cuisine.lower() in [c.lower() for c in r["cuisine_types"]]]
    
    if category:
        restaurants = [r for r in restaurants if r["category"].lower() == category.lower()]
    
    # Apply pagination
    total = len(restaurants)
    restaurants = restaurants[offset:offset + limit]
    
    return {
        "success": True,
        "data": restaurants,
        "meta": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
    }

@app.get("/api/v1/restaurants/{restaurant_id}")
async def get_restaurant(restaurant_id: str):
    """Get specific restaurant"""
    restaurant = next((r for r in MOCK_RESTAURANTS if r["id"] == restaurant_id), None)
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return {
        "success": True,
        "data": restaurant
    }

@app.get("/api/v1/analytics/overview")
async def get_analytics_overview():
    """Get analytics overview"""
    return {
        "success": True,
        "data": MOCK_ANALYTICS_DATA
    }

@app.get("/api/v1/analytics/revenue")
async def get_revenue_analytics(
    period: str = Query("month", description="Time period: day, week, month, year")
):
    """Get revenue analytics"""
    # Generate mock time series data
    data_points = []
    base_date = datetime.now() - timedelta(days=30)
    
    for i in range(30):
        date = base_date + timedelta(days=i)
        revenue = random.randint(15000, 35000)
        data_points.append({
            "date": date.strftime("%Y-%m-%d"),
            "revenue": revenue,
            "orders": random.randint(50, 120),
            "avg_order_value": round(revenue / random.randint(50, 120), 2)
        })
    
    return {
        "success": True,
        "data": {
            "period": period,
            "total_revenue": sum(d["revenue"] for d in data_points),
            "total_orders": sum(d["orders"] for d in data_points),
            "growth_rate": random.uniform(5.0, 15.0),
            "time_series": data_points
        }
    }

@app.get("/api/v1/insights/market")
async def get_market_insights():
    """Get market insights"""
    return {
        "success": True,
        "data": {
            "market_trends": [
                {
                    "trend": "Healthy Eating",
                    "growth": 23.5,
                    "description": "Increased demand for organic and healthy food options"
                },
                {
                    "trend": "Digital Orders",
                    "growth": 45.2,
                    "description": "Online ordering and delivery services continue to grow"
                },
                {
                    "trend": "Local Sourcing",
                    "growth": 18.7,
                    "description": "Preference for locally sourced ingredients"
                }
            ],
            "competitive_analysis": {
                "market_position": "Strong",
                "competitive_score": 8.2,
                "opportunities": [
                    "Expand healthy menu options",
                    "Improve digital presence",
                    "Partner with local suppliers"
                ]
            },
            "recommendations": [
                "Focus on healthy menu expansion",
                "Invest in mobile app development",
                "Implement loyalty program"
            ]
        }
    }

@app.get("/api/v1/ai/recommendations")
async def get_ai_recommendations():
    """Get AI-powered recommendations"""
    return {
        "success": True,
        "data": {
            "menu_optimization": [
                {
                    "item": "Pad Thai",
                    "recommendation": "Increase price by 10%",
                    "reasoning": "High demand, low profit margin",
                    "potential_impact": "+15% profit margin"
                },
                {
                    "item": "Green Curry",
                    "recommendation": "Add to featured menu",
                    "reasoning": "High rating, increasing popularity",
                    "potential_impact": "+20% orders"
                }
            ],
            "operational_insights": [
                {
                    "area": "Staffing",
                    "recommendation": "Add 2 servers during peak hours",
                    "impact": "Reduce wait times by 25%"
                },
                {
                    "area": "Inventory",
                    "recommendation": "Increase rice stock by 30%",
                    "impact": "Prevent stockouts"
                }
            ],
            "marketing_suggestions": [
                {
                    "channel": "Social Media",
                    "action": "Promote lunch specials",
                    "expected_roi": "180%"
                },
                {
                    "channel": "Email",
                    "action": "Weekend dinner promotions",
                    "expected_roi": "145%"
                }
            ]
        }
    }

@app.get("/api/v1/location/nearby")
async def get_nearby_locations(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: float = Query(5000, description="Radius in meters")
):
    """Get nearby restaurants"""
    # Simple distance calculation (not geospatially accurate, just for demo)
    nearby_restaurants = []
    
    for restaurant in MOCK_RESTAURANTS:
        # Rough distance estimation
        lat_diff = abs(restaurant["latitude"] - lat)
        lon_diff = abs(restaurant["longitude"] - lon)
        estimated_distance = (lat_diff + lon_diff) * 111000  # Very rough km to m conversion
        
        if estimated_distance <= radius:
            restaurant_with_distance = restaurant.copy()
            restaurant_with_distance["distance_meters"] = int(estimated_distance)
            nearby_restaurants.append(restaurant_with_distance)
    
    # Sort by distance
    nearby_restaurants.sort(key=lambda x: x["distance_meters"])
    
    return {
        "success": True,
        "data": {
            "restaurants": nearby_restaurants,
            "search_center": {"lat": lat, "lon": lon},
            "radius_meters": radius,
            "total_found": len(nearby_restaurants)
        }
    }

@app.get("/api/v1/search")
async def search_restaurants(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50)
):
    """Search restaurants"""
    results = []
    query = q.lower()
    
    for restaurant in MOCK_RESTAURANTS:
        # Simple text search
        searchable_text = (
            restaurant["name"] + " " +
            restaurant["brand"] + " " +
            " ".join(restaurant["cuisine_types"]) + " " +
            restaurant["area"]
        ).lower()
        
        if query in searchable_text:
            # Add relevance score (simplified)
            score = 0.5
            if query in restaurant["name"].lower():
                score += 0.3
            if query in restaurant["brand"].lower():
                score += 0.2
            
            result = restaurant.copy()
            result["relevance_score"] = score
            results.append(result)
    
    # Sort by relevance
    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    results = results[:limit]
    
    return {
        "success": True,
        "data": {
            "query": q,
            "results": results,
            "total_found": len(results)
        }
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "status_code": 500
        }
    )

@app.get("/integration-test", response_class=HTMLResponse)
async def integration_test():
    """Serve the integration test page"""
    try:
        with open("../integration-test.html", "r") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Integration test page not found")

if __name__ == "__main__":
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )