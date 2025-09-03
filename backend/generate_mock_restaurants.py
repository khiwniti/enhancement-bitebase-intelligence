#!/usr/bin/env python3
"""
Generate realistic mock Bangkok restaurant data for testing
Create diverse restaurants across Bangkok districts
"""

import sqlite3
import uuid
import json
import random
from datetime import datetime
from typing import List, Dict

# Bangkok districts with realistic coordinates
BANGKOK_DISTRICTS = [
    {"name": "Siam", "lat": 13.7563, "lon": 100.5018},
    {"name": "Sukhumvit", "lat": 13.7308, "lon": 100.5418},
    {"name": "Silom", "lat": 13.7248, "lon": 100.5335},
    {"name": "Chatuchak", "lat": 13.7998, "lon": 100.5505},
    {"name": "Sathorn", "lat": 13.7167, "lon": 100.5204},
    {"name": "Khao San", "lat": 13.7590, "lon": 100.4977},
    {"name": "Thonglor", "lat": 13.7306, "lon": 100.5698},
    {"name": "Phrom Phong", "lat": 13.7291, "lon": 100.5697},
    {"name": "Asok", "lat": 13.7365, "lon": 100.5601},
    {"name": "Ratchada", "lat": 13.7659, "lon": 100.5388},
    {"name": "Chinatown", "lat": 13.7375, "lon": 100.5096},
    {"name": "Ari", "lat": 13.7794, "lon": 100.5359},
    {"name": "Phaya Thai", "lat": 13.7564, "lon": 100.5322},
    {"name": "Victory Monument", "lat": 13.7631, "lon": 100.5378},
    {"name": "On Nut", "lat": 13.7055, "lon": 100.6008},
]

# Restaurant name templates
RESTAURANT_NAMES = {
    "thai": [
        "Bangkok Kitchen", "Siam Spice", "Golden Thai", "Royal Orchid", "Thai Garden",
        "Lotus Flower", "Emerald Buddha", "Chao Phraya", "Tuk Tuk Thai", "Mango Tree",
        "Bamboo House", "Jasmine Rice", "Bangkok Bistro", "Thai Heritage", "Siam Palace"
    ],
    "chinese": [
        "Golden Dragon", "Jade Garden", "Dynasty Palace", "Red Lantern", "Phoenix Court",
        "Great Wall", "Peking Duck", "Fortune House", "Dragon Well", "Golden Wok",
        "Ming Garden", "Imperial Kitchen", "Lucky Star", "Silver Chopsticks", "Red Phoenix"
    ],
    "japanese": [
        "Tokyo Sushi", "Sakura Japanese", "Zen Garden", "Fuji Teppanyaki", "Koi Sushi",
        "Ramen Yokocho", "Sushi Masa", "Takoyaki House", "Bonsai Kitchen", "Katsu Corner",
        "Izakaya Ichi", "Tempura Ten", "Soba Noodle", "Yakitori Tori", "Miso Ramen"
    ],
    "korean": [
        "Seoul Kitchen", "Kimchi House", "BBQ Palace", "Gangnam Style", "K-Town Grill",
        "Bulgogi Brothers", "Hanok Restaurant", "Bibimbap Bowl", "Seoul Garden", "K-BBQ",
        "Gochujang Kitchen", "Samgyeopsal House", "Korean Garden", "Hallyu Kitchen", "Jeju Island"
    ],
    "italian": [
        "Bella Vista", "Roma Trattoria", "Venezia", "Pasta Palace", "Milano Kitchen",
        "Tuscan Table", "Amalfi Coast", "Sicilian Kitchen", "Napoli Pizza", "Parmigiano",
        "Dolce Vita", "Casa Italia", "Buon Appetito", "Villa Toscana", "Ristorante Roma"
    ],
    "international": [
        "Global Fusion", "World Kitchen", "International Buffet", "Fusion Lab", "Global Taste",
        "Crossroads Cafe", "International Table", "World Flavors", "Fusion Point", "Global Grill",
        "International House", "World Cuisine", "Fusion Kitchen", "Global Bites", "Unity Kitchen"
    ]
}

# Categories and their characteristics
CATEGORIES = {
    "fast-food": {"price": "$", "seating": (20, 50), "employees": (3, 8)},
    "casual-dining": {"price": "$$", "seating": (40, 120), "employees": (8, 20)},
    "fine-dining": {"price": "$$$", "seating": (30, 80), "employees": (15, 35)},
    "cafe": {"price": "$", "seating": (15, 40), "employees": (3, 10)},
    "food-truck": {"price": "$", "seating": (10, 25), "employees": (2, 5)},
    "bakery": {"price": "$", "seating": (10, 30), "employees": (3, 8)}
}


def generate_restaurant(district: Dict, cuisine_type: str) -> Dict:
    """Generate a realistic restaurant for the given district and cuisine"""
    
    # Select random name from cuisine type
    base_names = RESTAURANT_NAMES.get(cuisine_type, RESTAURANT_NAMES["thai"])
    base_name = random.choice(base_names)
    
    # Add district suffix for uniqueness
    name = f"{base_name} {district['name']}"
    
    # Select category with bias based on cuisine type
    if cuisine_type == "thai":
        category = random.choices(
            ["casual-dining", "fine-dining", "food-truck", "fast-food"],
            weights=[50, 20, 20, 10]
        )[0]
    elif cuisine_type in ["japanese", "italian"]:
        category = random.choices(
            ["casual-dining", "fine-dining", "fast-food"],
            weights=[40, 40, 20]
        )[0]
    elif cuisine_type == "chinese":
        category = random.choices(
            ["casual-dining", "fast-food", "fine-dining"],
            weights=[50, 30, 20]
        )[0]
    else:
        category = random.choice(["casual-dining", "fast-food", "cafe"])
    
    # Get category characteristics
    cat_info = CATEGORIES[category]
    
    # Generate coordinates with small random offset from district center
    lat_offset = random.uniform(-0.01, 0.01)
    lon_offset = random.uniform(-0.01, 0.01)
    latitude = district["lat"] + lat_offset
    longitude = district["lon"] + lon_offset
    
    # Generate business metrics
    seating_capacity = random.randint(*cat_info["seating"])
    employee_count = random.randint(*cat_info["employees"])
    average_rating = round(random.uniform(3.2, 4.9), 1)
    total_reviews = random.randint(25, 800)
    
    # Revenue based on category and rating
    base_revenue = {
        "fast-food": 15000,
        "casual-dining": 35000,
        "fine-dining": 80000,
        "cafe": 12000,
        "food-truck": 8000,
        "bakery": 10000
    }
    revenue_multiplier = (average_rating - 3.0) * 0.5 + 1.0
    estimated_revenue = int(base_revenue[category] * revenue_multiplier * random.uniform(0.7, 1.3))
    
    # Generate address
    street_names = [
        "Sukhumvit Road", "Silom Road", "Sathorn Road", "Ratchadamri Road",
        "Ploenchit Road", "Wireless Road", "Langsuan Road", "Sarasin Road",
        "Rajdamri Road", "Phetchaburi Road", "Rama IV Road", "New Phetchaburi Road"
    ]
    address = f"{random.randint(1, 999)} {random.choice(street_names)}, {district['name']}, Bangkok"
    
    # Phone number (Thai format)
    phone = f"+66 2 {random.randint(100, 999)} {random.randint(1000, 9999)}"
    
    # Website
    website = f"https://www.{base_name.lower().replace(' ', '')}{district['name'].lower()}.com" if random.random() > 0.3 else None
    
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "brand": base_name if random.random() > 0.7 else None,
        "cuisine_types": json.dumps([cuisine_type]),
        "category": category,
        "price_range": cat_info["price"],
        "phone": phone,
        "email": None,
        "website": website,
        "seating_capacity": seating_capacity,
        "latitude": latitude,
        "longitude": longitude,
        "address": address,
        "city": "Bangkok",
        "area": district["name"],
        "country": "Thailand",
        "postal_code": random.randint(10000, 10999),
        "is_active": True,
        "opening_date": None,
        "closing_date": None,
        "average_rating": average_rating,
        "total_reviews": total_reviews,
        "estimated_revenue": estimated_revenue,
        "employee_count": employee_count,
        "data_source": "Generated",
        "data_quality_score": 0.85,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }


def generate_all_restaurants(restaurants_per_district: int = 8) -> List[Dict]:
    """Generate restaurants for all districts"""
    all_restaurants = []
    
    # Cuisine distribution weights
    cuisine_weights = {
        "thai": 40,
        "chinese": 20,
        "japanese": 15,
        "korean": 10,
        "italian": 8,
        "international": 7
    }
    
    cuisines = list(cuisine_weights.keys())
    weights = list(cuisine_weights.values())
    
    for district in BANGKOK_DISTRICTS:
        print(f"🏙️ Generating restaurants for {district['name']} district...")
        
        for i in range(restaurants_per_district):
            # Select cuisine type based on weights
            cuisine_type = random.choices(cuisines, weights=weights)[0]
            restaurant = generate_restaurant(district, cuisine_type)
            all_restaurants.append(restaurant)
        
        print(f"   ✅ Generated {restaurants_per_district} restaurants")
    
    return all_restaurants


def populate_database():
    """Generate and insert mock restaurants into database"""
    print("🚀 Generating realistic Bangkok restaurant data...")
    
    # Generate restaurants (8 per district = 120 total)
    restaurants = generate_all_restaurants(8)
    
    print(f"\n📊 Generated {len(restaurants)} restaurants total")
    
    # Insert into database
    conn = sqlite3.connect('bitebase_intelligence.db')
    cursor = conn.cursor()
    
    try:
        # Clear existing generated data
        cursor.execute("DELETE FROM restaurants WHERE data_source = 'Generated'")
        print(f"🧹 Cleared existing generated restaurants")
        
        # Insert new restaurants
        for restaurant in restaurants:
            cursor.execute("""
                INSERT INTO restaurants (
                    id, name, brand, cuisine_types, category, price_range,
                    phone, email, website, seating_capacity,
                    latitude, longitude, address, city, area, country, postal_code,
                    is_active, opening_date, closing_date,
                    average_rating, total_reviews, estimated_revenue, employee_count,
                    data_source, data_quality_score, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                restaurant["id"], restaurant["name"], restaurant["brand"],
                restaurant["cuisine_types"], restaurant["category"], restaurant["price_range"],
                restaurant["phone"], restaurant["email"], restaurant["website"], restaurant["seating_capacity"],
                restaurant["latitude"], restaurant["longitude"], restaurant["address"],
                restaurant["city"], restaurant["area"], restaurant["country"], restaurant["postal_code"],
                restaurant["is_active"], restaurant["opening_date"], restaurant["closing_date"],
                restaurant["average_rating"], restaurant["total_reviews"], restaurant["estimated_revenue"],
                restaurant["employee_count"], restaurant["data_source"], restaurant["data_quality_score"],
                restaurant["created_at"], restaurant["updated_at"]
            ))
        
        conn.commit()
        print(f"✅ Successfully inserted {len(restaurants)} restaurants into database")
        
        # Show summary statistics
        cursor.execute("""
            SELECT 
                category,
                COUNT(*) as count,
                ROUND(AVG(average_rating), 1) as avg_rating,
                ROUND(AVG(estimated_revenue)) as avg_revenue
            FROM restaurants 
            WHERE data_source = 'Generated'
            GROUP BY category
            ORDER BY count DESC
        """)
        category_stats = cursor.fetchall()
        
        print(f"\n📈 Restaurant statistics by category:")
        for category, count, avg_rating, avg_revenue in category_stats:
            print(f"   {category}: {count} restaurants (⭐{avg_rating}, 💰{avg_revenue:,} THB)")
        
        # Show district distribution
        cursor.execute("""
            SELECT area, COUNT(*) as count
            FROM restaurants 
            WHERE data_source = 'Generated'
            GROUP BY area
            ORDER BY area
        """)
        district_stats = cursor.fetchall()
        
        print(f"\n📍 Restaurants by district:")
        for area, count in district_stats:
            print(f"   {area}: {count} restaurants")
        
        # Total count check
        cursor.execute("SELECT COUNT(*) FROM restaurants")
        total_count = cursor.fetchone()[0]
        print(f"\n🏪 Total restaurants in database: {total_count}")
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    populate_database()
    print(f"\n🎉 Bangkok restaurant database population complete!")