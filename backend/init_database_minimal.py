"""
Minimal database initialization - tables and basic data only.
"""
import asyncio
import os
import sys
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, AsyncSessionLocal
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_tables_only():
    """Create only core tables without complex models."""
    logger.info("Creating minimal database tables...")
    async with engine.begin() as conn:
        # Create users table manually
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                company TEXT,
                phone TEXT,
                avatar_url TEXT,
                role TEXT NOT NULL DEFAULT 'user',
                status TEXT NOT NULL DEFAULT 'active',
                is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
                is_two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
                timezone TEXT NOT NULL DEFAULT 'UTC',
                language TEXT NOT NULL DEFAULT 'en',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_login_at TIMESTAMP,
                email_verified_at TIMESTAMP
            )
        """))
        
        # Create restaurants table manually
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS restaurants (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                brand TEXT,
                address TEXT NOT NULL,
                city TEXT NOT NULL,
                area TEXT,
                country TEXT NOT NULL,
                postal_code TEXT,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                cuisine_types TEXT NOT NULL,
                category TEXT NOT NULL,
                price_range TEXT,
                phone TEXT,
                email TEXT,
                website TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                opening_date TIMESTAMP,
                closing_date TIMESTAMP,
                average_rating REAL,
                total_reviews INTEGER DEFAULT 0,
                estimated_revenue REAL,
                employee_count INTEGER,
                seating_capacity INTEGER,
                data_source TEXT,
                data_quality_score REAL DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
    logger.info("Database tables created successfully!")

async def populate_basic_data():
    """Add basic test data."""
    logger.info("Adding basic test data...")
    
    async with AsyncSessionLocal() as session:
        # Add test users
        await session.execute(text("""
            INSERT OR IGNORE INTO users (
                id, email, password_hash, first_name, last_name, role
            ) VALUES 
            ('user-001', 'admin@bitebase.ai', 'hashed_password_123', 'Admin', 'User', 'admin'),
            ('user-002', 'manager@bitebase.ai', 'hashed_password_123', 'Manager', 'User', 'manager'),
            ('user-003', 'user@bitebase.ai', 'hashed_password_123', 'Regular', 'User', 'user')
        """))
        
        # Add test restaurants
        await session.execute(text("""
            INSERT OR IGNORE INTO restaurants (
                id, name, address, city, area, country, latitude, longitude,
                cuisine_types, category, price_range, is_active
            ) VALUES 
            ('rest-001', 'Bangkok Thai Kitchen', 'Siam Square, Bangkok', 'Bangkok', 'Siam', 'Thailand', 
             13.7563, 100.5018, '["Thai"]', 'casual-dining', '$$', TRUE),
            ('rest-002', 'Sukhumvit Sushi Bar', 'Sukhumvit Road, Bangkok', 'Bangkok', 'Sukhumvit', 'Thailand',
             13.7308, 100.5418, '["Japanese", "Sushi"]', 'fine-dining', '$$$', TRUE),
            ('rest-003', 'Silom Street Food', 'Silom Road, Bangkok', 'Bangkok', 'Silom', 'Thailand',
             13.7248, 100.5335, '["Thai", "Street Food"]', 'street-food', '$', TRUE),
            ('rest-004', 'Chatuchak Cafe', 'Chatuchak Weekend Market, Bangkok', 'Bangkok', 'Chatuchak', 'Thailand',
             13.7998, 100.5505, '["Thai", "International"]', 'cafe', '$', TRUE),
            ('rest-005', 'Sathorn Fine Dining', 'Sathorn Road, Bangkok', 'Bangkok', 'Sathorn', 'Thailand',
             13.7167, 100.5204, '["French", "European"]', 'fine-dining', '$$$$', TRUE)
        """))
        
        await session.commit()
        logger.info("Basic test data added successfully!")

async def main():
    """Main initialization function."""
    logger.info("Starting minimal BiteBaseAI database initialization...")
    
    try:
        # Create tables manually 
        await create_tables_only()
        
        # Add basic data
        await populate_basic_data()
        
        logger.info("Minimal database initialization completed successfully!")
        
        # Show stats
        async with AsyncSessionLocal() as session:
            user_result = await session.execute(text("SELECT COUNT(*) FROM users"))
            restaurant_result = await session.execute(text("SELECT COUNT(*) FROM restaurants"))
            
            user_count = user_result.scalar()
            restaurant_count = restaurant_result.scalar()
            
            logger.info(f"Created {user_count} users")
            logger.info(f"Created {restaurant_count} restaurants")
            logger.info("You can now start the FastAPI server!")
        
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())