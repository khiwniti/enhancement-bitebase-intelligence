#!/usr/bin/env python3
"""
Simple database initialization script with realistic Bangkok restaurant data
"""
import asyncio
import os
import sys
import json
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal, engine, Base
from app.models.restaurant import Restaurant
from app.models.user import User
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Bangkok districts with realistic coordinates
BANGKOK_LOCATIONS = [
    {"name": "Siam", "lat": 13.7563, "lon": 100.5018, "area": "Pathum Wan"},
    {"name": "Sukhumvit", "lat": 13.7308, "lon": 100.5418, "area": "Watthana"},
    {"name": "Silom", "lat": 13.7248, "lon": 100.5335, "area": "Bang Rak"},
    {"name": "Chatuchak", "lat": 13.7998, "lon": 100.5505, "area": "Chatuchak"},
    {"name": "Sathorn", "lat": 13.7167, "lon": 100.5204, "area": "Sathorn"},
    {"name": "Khao San", "lat": 13.7590, "lon": 100.4977, "area": "Phra Nakhon"},
    {"name": "Thonglor", "lat": 13.7306, "lon": 100.5698, "area": "Watthana"},
    {"name": "Phrom Phong", "lat": 13.7291, "lon": 100.5697, "area": "Watthana"},
    {"name": "Asok", "lat": 13.7365, "lon": 100.5601, "area": "Watthana"},
    {"name": "Ratchada", "lat": 13.7659, "lon": 100.5388, "area": "Huai Khwang"},
    {"name": "Chinatown", "lat": 13.7375, "lon": 100.5096, "area": "Samphanthawong"},
    {"name": "Ari", "lat": 13.7794, "lon": 100.5359, "area": "Phaya Thai"},
    {"name": "Victory Monument", "lat": 13.7631, "lon": 100.5378, "area": "Ratchathewi"},
    {"name": "On Nut", "lat": 13.7055, "lon": 100.6008, "area": "Suan Luang"},
]

# Restaurant data templates
RESTAURANT_TEMPLATES = [
    {
        "name": "Bangkok Kitchen",
        "cuisine_types": ["Thai", "Asian"],
        "category": "casual-dining",
        "price_range": "$$",
        "phone": "+66 2-555-0101",
        "website": "https://bangkokkitchen.com"
    },
    {
        "name": "Siam Spice",
        "cuisine_types": ["Thai", "Spicy"],
        "category": "casual-dining",
        "price_range": "$",
        "phone": "+66 2-555-0102",
        "website": "https://siamspice.com"
    },
    {
        "name": "Tokyo Sushi Bar",
        "cuisine_types": ["Japanese", "Sushi"],
        "category": "fine-dining",
        "price_range": "$$$",
        "phone": "+66 2-555-0103",
        "website": "https://tokyosushi.com"
    },
    {
        "name": "Golden Dragon",
        "cuisine_types": ["Chinese", "Dim Sum"],
        "category": "casual-dining",
        "price_range": "$$",
        "phone": "+66 2-555-0104",
        "website": "https://goldendragon.com"
    },
    {
        "name": "Mama Noodle House",
        "cuisine_types": ["Thai", "Noodles"],
        "category": "fast-food",
        "price_range": "$",
        "phone": "+66 2-555-0105",
        "website": None
    },
    {
        "name": "Royal Orchid",
        "cuisine_types": ["Thai", "Royal Cuisine"],
        "category": "fine-dining",
        "price_range": "$$$$",
        "phone": "+66 2-555-0106",
        "website": "https://royalorchid.com"
    },
    {
        "name": "Street Food Paradise",
        "cuisine_types": ["Thai", "Street Food"],
        "category": "fast-food",
        "price_range": "$",
        "phone": "+66 2-555-0107",
        "website": None
    },
    {
        "name": "The Coffee House",
        "cuisine_types": ["Coffee", "Cafe"],
        "category": "cafe",
        "price_range": "$",
        "phone": "+66 2-555-0108",
        "website": "https://coffeehouse.com"
    },
    {
        "name": "Italian Corner",
        "cuisine_types": ["Italian", "Pizza"],
        "category": "casual-dining",
        "price_range": "$$",
        "phone": "+66 2-555-0109",
        "website": "https://italiancorner.com"
    },
    {
        "name": "Korean BBQ House",
        "cuisine_types": ["Korean", "BBQ"],
        "category": "casual-dining",
        "price_range": "$$$",
        "phone": "+66 2-555-0110",
        "website": "https://koreanbbq.com"
    },
]

async def create_tables():
    """Create all database tables."""
    logger.info("Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created successfully!")

async def create_restaurants():
    """Create realistic restaurant data."""
    logger.info("Creating restaurants...")
    
    async with AsyncSessionLocal() as session:
        restaurants = []
        
        # Create multiple restaurants for each template and location combination
        for i, template in enumerate(RESTAURANT_TEMPLATES):
            for j, location in enumerate(BANGKOK_LOCATIONS):
                # Create 1-3 restaurants per location-template combination
                num_restaurants = random.randint(1, 3)
                
                for k in range(num_restaurants):
                    # Add some variation to coordinates (within ~500m)
                    lat_offset = random.uniform(-0.005, 0.005)
                    lon_offset = random.uniform(-0.005, 0.005)
                    
                    restaurant_name = f"{template['name']}"
                    if k > 0:
                        restaurant_name += f" {location['area']} Branch"
                    elif num_restaurants > 1:
                        restaurant_name += f" {location['name']}"
                    
                    restaurant = Restaurant(
                        name=restaurant_name,
                        brand=template['name'],
                        address=f"123/45 {location['name']} Road, {location['area']}, Bangkok 10110",
                        city="Bangkok",
                        area=location['area'],
                        country="Thailand",
                        postal_code="10110",
                        latitude=location['lat'] + lat_offset,
                        longitude=location['lon'] + lon_offset,
                        cuisine_types=template['cuisine_types'],
                        category=template['category'],
                        price_range=template['price_range'],
                        phone=template['phone'],
                        website=template['website'],
                        is_active=True,
                        opening_date=datetime.now() - timedelta(days=random.randint(30, 1095)),
                        average_rating=round(random.uniform(3.5, 5.0), 1),
                        total_reviews=random.randint(50, 500),
                        estimated_revenue=random.uniform(50000, 500000),
                        employee_count=random.randint(5, 50),
                        seating_capacity=random.randint(20, 200),
                        data_source="mock_data",
                        data_quality_score=random.uniform(0.8, 1.0),
                    )
                    
                    restaurants.append(restaurant)
        
        session.add_all(restaurants)
        await session.commit()
        logger.info(f"Created {len(restaurants)} restaurants!")

async def create_users():
    """Create mock users."""
    logger.info("Creating users...")
    
    async with AsyncSessionLocal() as session:
        users = [
            User(
                username="admin",
                email="admin@bitebase.ai",
                full_name="System Administrator",
                hashed_password="$2b$12$LnZpOWlmU5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z",  # "password"
                is_active=True,
                is_superuser=True,
            ),
            User(
                username="demo_user",
                email="demo@bitebase.ai",
                full_name="Demo User",
                hashed_password="$2b$12$LnZpOWlmU5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z",  # "password"
                is_active=True,
                is_superuser=False,
            ),
            User(
                username="restaurant_owner",
                email="owner@restaurant.com",
                full_name="Restaurant Owner",
                hashed_password="$2b$12$LnZpOWlmU5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z",  # "password"
                is_active=True,
                is_superuser=False,
            ),
        ]
        
        session.add_all(users)
        await session.commit()
        logger.info(f"Created {len(users)} users!")

async def main():
    """Main initialization function."""
    try:
        await create_tables()
        await create_users()
        await create_restaurants()
        logger.info("Database initialization completed successfully!")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())