"""
Ultra-simple database initialization script for BiteBaseAI platform.
Creates tables and basic data without complex model relationships.
"""
import asyncio
import os
import sys
from datetime import datetime
import random

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, AsyncSessionLocal
from app.models.user import User, UserRole
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_tables():
    """Create basic database tables."""
    logger.info("Creating database tables...")
    async with engine.begin() as conn:
        # Drop all tables first to avoid conflicts
        await conn.run_sync(Base.metadata.drop_all)
        # Create fresh tables
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created successfully!")

async def create_basic_users():
    """Create basic users only."""
    logger.info("Creating basic users...")
    
    async with AsyncSessionLocal() as session:
        users_data = [
            {
                "email": "admin@bitebase.ai",
                "first_name": "Admin",
                "last_name": "User",
                "role": UserRole.ADMIN,
                "password_hash": "hashed_password_123"
            },
            {
                "email": "manager@bitebase.ai", 
                "first_name": "Manager",
                "last_name": "User",
                "role": UserRole.MANAGER,
                "password_hash": "hashed_password_123"
            },
            {
                "email": "user@bitebase.ai",
                "first_name": "Regular",
                "last_name": "User",
                "role": UserRole.USER,
                "password_hash": "hashed_password_123"
            }
        ]
        
        for user_data in users_data:
            user = User(**user_data)
            session.add(user)
        
        await session.commit()
        logger.info("Basic users created successfully!")

async def create_basic_restaurants():
    """Create basic restaurant records using raw SQL to avoid model issues."""
    logger.info("Creating basic restaurants...")
    
    restaurants_sql = """
    INSERT INTO restaurants (
        id, name, address, city, area, country, latitude, longitude,
        cuisine_types, category, price_range, is_active, created_at, updated_at
    ) VALUES 
    ('rest-001', 'Bangkok Thai Kitchen', 'Siam Square, Bangkok', 'Bangkok', 'Siam', 'Thailand', 
     13.7563, 100.5018, '["Thai"]', 'casual-dining', '$$', TRUE, datetime('now'), datetime('now')),
    ('rest-002', 'Sukhumvit Sushi Bar', 'Sukhumvit Road, Bangkok', 'Bangkok', 'Sukhumvit', 'Thailand',
     13.7308, 100.5418, '["Japanese", "Sushi"]', 'fine-dining', '$$$', TRUE, datetime('now'), datetime('now')),
    ('rest-003', 'Silom Street Food', 'Silom Road, Bangkok', 'Bangkok', 'Silom', 'Thailand',
     13.7248, 100.5335, '["Thai", "Street Food"]', 'street-food', '$', TRUE, datetime('now'), datetime('now')),
    ('rest-004', 'Chatuchak Cafe', 'Chatuchak Weekend Market, Bangkok', 'Bangkok', 'Chatuchak', 'Thailand',
     13.7998, 100.5505, '["Thai", "International"]', 'cafe', '$', TRUE, datetime('now'), datetime('now')),
    ('rest-005', 'Sathorn Fine Dining', 'Sathorn Road, Bangkok', 'Bangkok', 'Sathorn', 'Thailand',
     13.7167, 100.5204, '["French", "European"]', 'fine-dining', '$$$$', TRUE, datetime('now'), datetime('now'))
    """
    
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(text(restaurants_sql))
            await session.commit()
            logger.info("Basic restaurants created successfully!")
        except Exception as e:
            logger.error(f"Error creating restaurants: {e}")
            await session.rollback()

async def main():
    """Main initialization function."""
    logger.info("Starting BiteBaseAI basic database initialization...")
    
    try:
        # Create tables
        await create_tables()
        
        # Create basic users
        await create_basic_users()
        
        # Create basic restaurants using raw SQL
        await create_basic_restaurants()
        
        logger.info("Basic database initialization completed successfully!")
        logger.info("Database initialized with minimal data for testing.")
        
        # Show stats
        async with AsyncSessionLocal() as session:
            user_result = await session.execute(text("SELECT COUNT(*) FROM users"))
            restaurant_result = await session.execute(text("SELECT COUNT(*) FROM restaurants"))
            
            user_count = user_result.scalar()
            restaurant_count = restaurant_result.scalar()
            
            logger.info(f"Created {user_count} users")
            logger.info(f"Created {restaurant_count} restaurants")
        
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())