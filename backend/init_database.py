"""
Database initialization script for BiteBaseAI platform.
Creates tables and populates with Bangkok restaurant data and mock users.
"""
import asyncio
import os
import sys
from datetime import datetime, timedelta
from typing import List
import random
from decimal import Decimal

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db, engine, Base, AsyncSessionLocal
from app.models.user import User, UserRole, APIKey
from app.models.restaurant import Restaurant, CuisineType, BusinessType, PriceRange
from app.models.market_research import (
    MarketAnalysis, AnalysisType, MarketTrend, BusinessInsight,
    CompetitorAnalysis, LocationAnalysis, CustomerSegment,
    RevenueProjection, OperationalMetrics
)
from app.services.geoapify_client import GeoapifyClient
from app.core.config import settings
from sqlalchemy import select
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Bangkok districts for location data
BANGKOK_DISTRICTS = [
    "Siam", "Sukhumvit", "Silom", "Sathorn", "Chatuchak", "Phrom Phong",
    "Thong Lo", "Ekkamai", "Ari", "Ratchathewi", "Pathum Wan", "Bang Rak",
    "Watthana", "Khlong Toei", "Huai Khwang", "Din Daeng", "Ratchada",
    "Lat Phrao", "Wang Thonglang", "Saphan Phut", "Chinatown", "Khao San"
]

async def create_tables():
    """Create all database tables."""
    logger.info("Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created successfully!")

async def create_mock_users():
    """Create comprehensive mock users with different roles."""
    logger.info("Creating mock users...")
    
    async with AsyncSessionLocal() as session:
        users_data = [
            {
                "email": "admin@bitebase.ai",
                "username": "admin",
                "full_name": "BiteBase Administrator",
                "role": UserRole.ADMIN,
                "is_active": True
            },
            {
                "email": "analyst@bitebase.ai", 
                "username": "market_analyst",
                "full_name": "Market Research Analyst",
                "role": UserRole.ANALYST,
                "is_active": True
            },
            {
                "email": "consultant@bitebase.ai",
                "username": "business_consultant", 
                "full_name": "Business Development Consultant",
                "role": UserRole.CONSULTANT,
                "is_active": True
            },
            {
                "email": "client@restaurant.com",
                "username": "restaurant_owner",
                "full_name": "Restaurant Owner",
                "role": UserRole.CLIENT,
                "is_active": True
            },
            {
                "email": "viewer@company.com",
                "username": "data_viewer",
                "full_name": "Data Viewer",
                "role": UserRole.VIEWER,
                "is_active": True
            }
        ]
        
        for user_data in users_data:
            # Check if user already exists
            result = await session.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing_user = result.scalar_one_or_none()
            
            if not existing_user:
                user = User(**user_data)
                user.set_password("password123")  # Default password for all mock users
                session.add(user)
                
                # Create API key for each user
                api_key = APIKey(
                    user=user,
                    name=f"{user_data['username']}_api_key",
                    key=f"bai_{user_data['username']}_{random.randint(100000, 999999)}",
                    expires_at=datetime.utcnow() + timedelta(days=365)
                )
                session.add(api_key)
        
        await session.commit()
        logger.info("Mock users created successfully!")

async def fetch_bangkok_restaurants():
    """Fetch real restaurant data from Bangkok using Geoapify API."""
    logger.info("Fetching Bangkok restaurant data from Geoapify...")
    
    geoapify = GeoapifyClient()
    restaurants = []
    
    # Search for restaurants in different Bangkok districts
    for district in BANGKOK_DISTRICTS[:10]:  # Limit to 10 districts to avoid API limits
        try:
            query = f"restaurant {district} Bangkok Thailand"
            places = await geoapify.search_places(query, limit=5)
            
            for place in places:
                restaurant_data = {
                    "name": place.get("properties", {}).get("name", f"Restaurant in {district}"),
                    "address": place.get("properties", {}).get("formatted", f"{district}, Bangkok, Thailand"),
                    "latitude": place.get("geometry", {}).get("coordinates", [0, 0])[1],
                    "longitude": place.get("geometry", {}).get("coordinates", [0, 0])[0],
                    "district": district,
                    "cuisine_type": random.choice(list(CuisineType)),
                    "business_type": random.choice(list(BusinessType)),
                    "price_range": random.choice(list(PriceRange)),
                    "phone": place.get("properties", {}).get("contact", {}).get("phone"),
                    "website": place.get("properties", {}).get("contact", {}).get("website"),
                    "rating": round(random.uniform(3.5, 5.0), 1),
                    "review_count": random.randint(50, 500),
                    "is_active": True
                }
                restaurants.append(restaurant_data)
                
        except Exception as e:
            logger.warning(f"Error fetching restaurants for {district}: {e}")
            # Create mock data for this district
            restaurant_data = {
                "name": f"Mock Restaurant {district}",
                "address": f"{district}, Bangkok, Thailand", 
                "latitude": 13.7563 + random.uniform(-0.1, 0.1),
                "longitude": 100.5018 + random.uniform(-0.1, 0.1),
                "district": district,
                "cuisine_type": random.choice(list(CuisineType)),
                "business_type": random.choice(list(BusinessType)),
                "price_range": random.choice(list(PriceRange)),
                "phone": f"+66-{random.randint(10000000, 99999999)}",
                "rating": round(random.uniform(3.5, 5.0), 1),
                "review_count": random.randint(50, 500),
                "is_active": True
            }
            restaurants.append(restaurant_data)
    
    return restaurants

async def populate_restaurants():
    """Populate database with Bangkok restaurant data."""
    logger.info("Populating restaurant data...")
    
    restaurants_data = await fetch_bangkok_restaurants()
    
    async with get_async_session() as session:
        for restaurant_data in restaurants_data:
            # Check if restaurant already exists
            result = await session.execute(
                select(Restaurant).where(Restaurant.name == restaurant_data["name"])
            )
            existing_restaurant = result.scalar_one_or_none()
            
            if not existing_restaurant:
                restaurant = Restaurant(**restaurant_data)
                session.add(restaurant)
        
        await session.commit()
        logger.info(f"Added {len(restaurants_data)} restaurants to database!")

async def create_market_analysis_data():
    """Create comprehensive market analysis data for restaurants."""
    logger.info("Creating market analysis data...")
    
    async with get_async_session() as session:
        # Get all restaurants
        result = await session.execute(select(Restaurant))
        restaurants = result.scalars().all()
        
        for restaurant in restaurants[:20]:  # Limit to first 20 restaurants
            # Create market analysis
            analysis = MarketAnalysis(
                restaurant_id=restaurant.id,
                analysis_type=random.choice(list(AnalysisType)),
                analysis_date=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                market_size=random.randint(1000000, 10000000),
                target_market_share=round(random.uniform(0.01, 0.05), 4),
                competition_level=random.choice(["Low", "Medium", "High"]),
                growth_potential=random.choice(["Low", "Medium", "High"]),
                recommendations=f"Market analysis recommendations for {restaurant.name}",
                confidence_score=round(random.uniform(0.7, 0.95), 2)
            )
            session.add(analysis)
            
            # Create market trends
            trend = MarketTrend(
                analysis=analysis,
                trend_name=f"{restaurant.cuisine_type.value} Trend",
                trend_direction=random.choice(["Increasing", "Decreasing", "Stable"]),
                impact_score=round(random.uniform(0.5, 1.0), 2),
                time_horizon=random.choice(["Short-term", "Medium-term", "Long-term"]),
                description=f"Market trend analysis for {restaurant.cuisine_type.value} cuisine"
            )
            session.add(trend)
            
            # Create business insights
            insight = BusinessInsight(
                analysis=analysis,
                insight_type=random.choice(["Revenue", "Cost", "Market", "Customer"]),
                title=f"Key insight for {restaurant.name}",
                description=f"Business insight analysis for {restaurant.name}",
                impact_level=random.choice(["Low", "Medium", "High"]),
                actionable_items=f"Action items for {restaurant.name}",
                priority=random.choice(["Low", "Medium", "High"])
            )
            session.add(insight)
            
            # Create competitor analysis
            competitor = CompetitorAnalysis(
                analysis=analysis,
                competitor_name=f"Competitor of {restaurant.name}",
                market_position=random.choice(["Leader", "Challenger", "Follower", "Niche"]),
                strengths=f"Competitor strengths analysis",
                weaknesses=f"Competitor weaknesses analysis", 
                market_share=round(random.uniform(0.05, 0.3), 4),
                competitive_advantage=f"Competitive advantage analysis"
            )
            session.add(competitor)
            
            # Create location analysis
            location = LocationAnalysis(
                analysis=analysis,
                foot_traffic_score=round(random.uniform(0.5, 1.0), 2),
                accessibility_score=round(random.uniform(0.5, 1.0), 2),
                visibility_score=round(random.uniform(0.5, 1.0), 2),
                parking_availability=random.choice(["Excellent", "Good", "Fair", "Poor"]),
                public_transport_access=random.choice(["Excellent", "Good", "Fair", "Poor"]),
                nearby_attractions=f"Nearby attractions for {restaurant.district}",
                demographic_fit=round(random.uniform(0.6, 0.95), 2)
            )
            session.add(location)
            
            # Create customer segments
            segment = CustomerSegment(
                analysis=analysis,
                segment_name=f"Primary customers for {restaurant.cuisine_type.value}",
                age_range=random.choice(["18-25", "26-35", "36-45", "46-55", "55+"]),
                income_level=random.choice(["Low", "Medium", "High", "Premium"]),
                lifestyle=f"Lifestyle profile for {restaurant.cuisine_type.value} customers",
                dining_frequency=random.choice(["Daily", "Weekly", "Monthly", "Occasional"]),
                price_sensitivity=random.choice(["Low", "Medium", "High"]),
                segment_size=random.randint(1000, 50000),
                growth_rate=round(random.uniform(-0.1, 0.3), 3)
            )
            session.add(segment)
            
            # Create revenue projection
            projection = RevenueProjection(
                analysis=analysis,
                projection_period=random.choice(["Monthly", "Quarterly", "Yearly"]),
                projected_revenue=Decimal(str(random.randint(100000, 1000000))),
                revenue_growth_rate=round(random.uniform(0.05, 0.25), 3),
                seasonal_factors=f"Seasonal factors for {restaurant.cuisine_type.value}",
                risk_factors=f"Risk factors analysis",
                confidence_interval=round(random.uniform(0.8, 0.95), 2)
            )
            session.add(projection)
            
            # Create operational metrics
            metrics = OperationalMetrics(
                analysis=analysis,
                avg_daily_customers=random.randint(50, 300),
                avg_order_value=Decimal(str(random.randint(200, 800))),
                peak_hours=random.choice(["11-13,18-20", "12-14,19-21", "11-14,17-21"]),
                staff_efficiency=round(random.uniform(0.7, 0.95), 2),
                table_turnover_rate=round(random.uniform(1.5, 4.0), 1),
                food_cost_percentage=round(random.uniform(0.25, 0.35), 2),
                customer_satisfaction=round(random.uniform(0.7, 0.95), 2)
            )
            session.add(metrics)
        
        await session.commit()
        logger.info("Market analysis data created successfully!")

async def main():
    """Main initialization function."""
    logger.info("Starting BiteBaseAI database initialization...")
    
    try:
        # Create tables
        await create_tables()
        
        # Create mock users
        await create_mock_users()
        
        # Populate restaurants with real Bangkok data
        await populate_restaurants()
        
        # Create comprehensive market analysis data
        await create_market_analysis_data()
        
        logger.info("Database initialization completed successfully!")
        logger.info("You can now start the FastAPI server with: uvicorn main:app --reload")
        
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
