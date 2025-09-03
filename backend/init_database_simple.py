"""
Simplified database initialization script for BiteBaseAI platform.
Creates tables and populates with Bangkok restaurant data and mock users.
"""
import asyncio
import os
import sys
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, AsyncSessionLocal
from app.models.user import User, UserRole, APIKey
from app.models.restaurant import Restaurant
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

# Sample cuisine types and categories
CUISINE_TYPES = [
    ["Thai"], ["Japanese"], ["Chinese"], ["Italian"], ["American"], 
    ["Korean"], ["Indian"], ["Vietnamese"], ["French"], ["Mexican"],
    ["Thai", "Asian"], ["Japanese", "Sushi"], ["Chinese", "Asian"]
]

CATEGORIES = [
    "fast-food", "casual-dining", "fine-dining", "cafe", "street-food", "buffet"
]

PRICE_RANGES = ["$", "$$", "$$$", "$$$$"]

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
                "first_name": "BiteBase",
                "last_name": "Administrator",
                "role": UserRole.ADMIN
            },
            {
                "email": "manager@bitebase.ai", 
                "first_name": "Market",
                "last_name": "Manager",
                "role": UserRole.MANAGER
            },
            {
                "email": "user@bitebase.ai",
                "first_name": "Business",
                "last_name": "User",
                "role": UserRole.USER
            },
            {
                "email": "client@restaurant.com",
                "first_name": "Restaurant",
                "last_name": "Owner",
                "role": UserRole.USER
            },
            {
                "email": "viewer@company.com",
                "first_name": "Data",
                "last_name": "Viewer",
                "role": UserRole.VIEWER
            }
        ]
        
        for user_data in users_data:
            # Check if user already exists
            result = await session.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing_user = result.scalar_one_or_none()
            
            if not existing_user:
                # Add password hash manually for now (should use proper password hashing in production)
                user_data["password_hash"] = "hashed_password_123"  # Placeholder
                user = User(**user_data)
                session.add(user)
        
        await session.commit()
        logger.info("Mock users created successfully!")

def create_mock_restaurant_data():
    """Create mock restaurant data for Bangkok."""
    restaurants = []
    
    # Famous Bangkok restaurants with realistic data
    famous_restaurants = [
        {
            "name": "Gaggan Anand",
            "cuisine_types": ["Indian", "Progressive"],
            "category": "fine-dining",
            "price_range": "$$$$",
            "district": "Silom",
            "rating": 4.8,
            "phone": "+66 2 652 1700"
        },
        {
            "name": "Jay Fai",
            "cuisine_types": ["Thai", "Street Food"],
            "category": "street-food",
            "price_range": "$$",
            "district": "Phra Nakhon",
            "rating": 4.5,
            "phone": "+66 2 223 9384"
        },
        {
            "name": "Nahm",
            "cuisine_types": ["Thai"],
            "category": "fine-dining",
            "price_range": "$$$$",
            "district": "Sathorn",
            "rating": 4.7,
            "phone": "+66 2 625 3388"
        },
        {
            "name": "Sorn",
            "cuisine_types": ["Thai", "Southern Thai"],
            "category": "fine-dining",
            "price_range": "$$$",
            "district": "Sukhumvit",
            "rating": 4.6,
            "phone": "+66 2 105 7706"
        },
        {
            "name": "Paste Bangkok",
            "cuisine_types": ["Thai", "Modern Thai"],
            "category": "fine-dining",
            "price_range": "$$$",
            "district": "Ratchathewi",
            "rating": 4.5,
            "phone": "+66 2 656 1003"
        }
    ]
    
    # Add famous restaurants
    for i, rest_data in enumerate(famous_restaurants):
        restaurant = {
            "name": rest_data["name"],
            "address": f"{rest_data['name']}, {rest_data['district']}, Bangkok, Thailand",
            "city": "Bangkok",
            "area": rest_data["district"],
            "country": "Thailand",
            "latitude": 13.7563 + random.uniform(-0.1, 0.1),  # Bangkok area coordinates
            "longitude": 100.5018 + random.uniform(-0.1, 0.1),
            "cuisine_types": rest_data["cuisine_types"],
            "category": rest_data["category"],
            "price_range": rest_data["price_range"],
            "phone": rest_data.get("phone", f"+66-{random.randint(10000000, 99999999)}"),
            "average_rating": rest_data["rating"],
            "total_reviews": random.randint(100, 1000),
            "is_active": True,
            "data_source": "Manual",
            "data_quality_score": 1.0,
            "estimated_revenue": random.randint(500000, 5000000),
            "employee_count": random.randint(10, 100),
            "seating_capacity": random.randint(30, 200)
        }
        restaurants.append(restaurant)
    
    # Add more mock restaurants for each district
    for district in BANGKOK_DISTRICTS:
        for i in range(3):  # 3 restaurants per district
            restaurant = {
                "name": f"{random.choice(['Royal', 'Golden', 'Spicy', 'Fresh', 'Tasty', 'Bangkok', 'Thai', 'Modern'])} {random.choice(['Kitchen', 'House', 'Garden', 'Place', 'Corner', 'Bistro'])} {district}",
                "address": f"{district} District, Bangkok, Thailand",
                "city": "Bangkok", 
                "area": district,
                "country": "Thailand",
                "latitude": 13.7563 + random.uniform(-0.15, 0.15),
                "longitude": 100.5018 + random.uniform(-0.15, 0.15),
                "cuisine_types": random.choice(CUISINE_TYPES),
                "category": random.choice(CATEGORIES),
                "price_range": random.choice(PRICE_RANGES),
                "phone": f"+66-{random.randint(10000000, 99999999)}",
                "average_rating": round(random.uniform(3.5, 5.0), 1),
                "total_reviews": random.randint(50, 500),
                "is_active": True,
                "data_source": "Generated",
                "data_quality_score": round(random.uniform(0.7, 0.9), 2),
                "estimated_revenue": random.randint(100000, 2000000),
                "employee_count": random.randint(5, 50),
                "seating_capacity": random.randint(20, 150)
            }
            restaurants.append(restaurant)
    
    return restaurants

async def populate_restaurants():
    """Populate database with Bangkok restaurant data."""
    logger.info("Populating restaurant data...")
    
    restaurants_data = create_mock_restaurant_data()
    
    async with AsyncSessionLocal() as session:
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

async def main():
    """Main initialization function."""
    logger.info("Starting BiteBaseAI database initialization...")
    
    try:
        # Create tables
        await create_tables()
        
        # Create mock users
        await create_mock_users()
        
        # Populate restaurants with Bangkok data
        await populate_restaurants()
        
        logger.info("Database initialization completed successfully!")
        logger.info("You can now start the FastAPI server with: uvicorn main:app --reload")
        
        # Show some stats
        async with AsyncSessionLocal() as session:
            user_count = await session.execute(select(User))
            restaurant_count = await session.execute(select(Restaurant))
            
            logger.info(f"Created {len(user_count.scalars().all())} users")
            logger.info(f"Created {len(restaurant_count.scalars().all())} restaurants")
        
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())