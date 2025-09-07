# Simple backend test - just start a minimal FastAPI server
import os
os.environ["GEOIP_DATABASE_PATH"] = "/tmp/dummy.mmdb"

from fastapi import FastAPI, Body, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uvicorn
import random
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Geoapify API configuration
GEOAPIFY_API_KEY = "7b278df53c9f42148598710d37436cf5"
GEOAPIFY_BASE_URL = "https://api.geoapify.com/v2"

app = FastAPI(title="BiteBase Intelligence API", version="1.0.0")

# Data Models for Market Research
class MarketResearchRequest(BaseModel):
    location: str = Field(..., description="Location name or coordinates")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    cuisine_type: str = Field(..., description="Target cuisine type")
    radius: float = Field(default=5.0, description="Search radius in kilometers")
    budget_range: str = Field(default="medium", description="Budget range: low, medium, high")
    target_demographics: Optional[List[str]] = Field(default=None, description="Target customer demographics")

class LocationMetrics(BaseModel):
    total_restaurants: int
    competition_density: float
    average_rating: float
    average_price_range: str
    foot_traffic_score: int
    accessibility_score: int

class CompetitorData(BaseModel):
    name: str
    cuisine_type: str
    rating: float
    price_range: str
    distance: float
    estimated_revenue: float
    strengths: List[str]
    weaknesses: List[str]

class MarketOpportunity(BaseModel):
    opportunity_type: str
    description: str
    potential_impact: str
    implementation_difficulty: str
    estimated_roi: float

class MarketResearchResponse(BaseModel):
    request_id: str
    location_metrics: LocationMetrics
    competitors: List[CompetitorData]
    market_opportunities: List[MarketOpportunity]
    customer_demographics: Dict[str, Any]
    pricing_insights: Dict[str, Any]
    marketing_recommendations: List[str]
    risk_factors: List[str]
    overall_market_score: float
    generated_at: datetime

# Geoapify API Helper Functions
async def fetch_restaurants_from_geoapify(latitude: float, longitude: float, radius: float = 1000, cuisine_type: str = None):
    """Fetch real restaurant data from Geoapify API"""
    try:
        # Base parameters for restaurant search
        params = {
            "categories": "catering.restaurant",
            "filter": f"circle:{longitude},{latitude},{radius}",
            "bias": f"proximity:{longitude},{latitude}",
            "limit": 50,
            "apiKey": GEOAPIFY_API_KEY
        }
        
        # Add cuisine-specific filtering if provided
        if cuisine_type and cuisine_type.lower() != "all":
            cuisine_map = {
                "italian": "catering.restaurant.italian",
                "chinese": "catering.restaurant.chinese", 
                "pizza": "catering.restaurant.pizza",
                "asian": "catering.restaurant.asian",
                "american": "catering.restaurant.american",
                "mexican": "catering.restaurant.mexican",
                "indian": "catering.restaurant.indian",
                "thai": "catering.restaurant.thai",
                "japanese": "catering.restaurant.japanese"
            }
            if cuisine_type.lower() in cuisine_map:
                params["categories"] = cuisine_map[cuisine_type.lower()]
        
        # Make API request
        response = requests.get(f"{GEOAPIFY_BASE_URL}/places", params=params)
        response.raise_for_status()
        
        data = response.json()
        restaurants = []
        
        for feature in data.get("features", []):
            props = feature.get("properties", {})
            geometry = feature.get("geometry", {})
            coords = geometry.get("coordinates", [0, 0])
            
            restaurant = {
                "name": props.get("name", "Unknown Restaurant"),
                "latitude": coords[1] if len(coords) > 1 else 0,
                "longitude": coords[0] if len(coords) > 0 else 0,
                "address": props.get("formatted", ""),
                "cuisine": props.get("catering", {}).get("cuisine", "general"),
                "phone": props.get("contact", {}).get("phone", ""),
                "website": props.get("website", ""),
                "opening_hours": props.get("opening_hours", ""),
                "facilities": props.get("facilities", {}),
                "categories": props.get("categories", []),
                "distance": props.get("distance", 0),
                "place_id": props.get("place_id", "")
            }
            restaurants.append(restaurant)
        
        logger.info(f"Fetched {len(restaurants)} restaurants from Geoapify")
        return restaurants
        
    except Exception as e:
        logger.error(f"Error fetching restaurants from Geoapify: {str(e)}")
        return []

async def geocode_location(location_name: str):
    """Geocode a location name to get coordinates"""
    try:
        params = {
            "text": location_name,
            "apiKey": GEOAPIFY_API_KEY,
            "limit": 1
        }
        
        response = requests.get(f"{GEOAPIFY_BASE_URL}/geocode/search", params=params)
        response.raise_for_status()
        
        data = response.json()
        features = data.get("features", [])
        
        if features:
            coords = features[0].get("geometry", {}).get("coordinates", [0, 0])
            return {
                "latitude": coords[1] if len(coords) > 1 else 0,
                "longitude": coords[0] if len(coords) > 0 else 0,
                "formatted_address": features[0].get("properties", {}).get("formatted", location_name)
            }
        
        return None
        
    except Exception as e:
        logger.error(f"Error geocoding location: {str(e)}")
        return None

@app.get("/")
async def root():
    return {"message": "BiteBase Intelligence Backend is running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "bitebase-intelligence"}

@app.get("/api/v1/test")
async def test_endpoint():
    return {"message": "API test successful", "version": "1.0.0"}

# Market Research Endpoints
@app.post("/api/v1/market-research/analyze", response_model=MarketResearchResponse)
async def analyze_market(request: MarketResearchRequest = Body(...)):
    """Perform comprehensive market research analysis using real restaurant data"""
    request_id = f"mr_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}"
    
    # Get coordinates if not provided
    latitude = request.latitude
    longitude = request.longitude
    
    if not latitude or not longitude:
        geocoded = await geocode_location(request.location)
        if geocoded:
            latitude = geocoded["latitude"]
            longitude = geocoded["longitude"]
        else:
            # Fallback to Basel coordinates for demo
            latitude = 47.5649
            longitude = 7.5886
    
    # Fetch real restaurant data from Geoapify
    restaurants = await fetch_restaurants_from_geoapify(
        latitude=latitude, 
        longitude=longitude, 
        radius=request.radius * 1000,  # Convert km to meters
        cuisine_type=request.cuisine_type
    )
    
    # Calculate real metrics from the data
    total_restaurants = len(restaurants)
    competition_density = min(1.0, total_restaurants / 50.0)  # Normalize to 0-1
    
    # Extract ratings and calculate average (fallback to random if no ratings)
    ratings = []
    for r in restaurants:
        # Simulate ratings based on facilities and other factors
        base_rating = 3.5
        if r.get("facilities", {}).get("wheelchair"):
            base_rating += 0.3
        if r.get("website"):
            base_rating += 0.2
        if r.get("opening_hours"):
            base_rating += 0.1
        ratings.append(min(5.0, base_rating + random.uniform(-0.5, 0.5)))
    
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 4.0
    
    location_metrics = LocationMetrics(
        total_restaurants=total_restaurants,
        competition_density=round(competition_density, 2),
        average_rating=avg_rating,
        average_price_range=random.choice(["$", "$$", "$$$"]),
        foot_traffic_score=random.randint(60, 95),
        accessibility_score=random.randint(70, 100)
    )
    
    # Convert real restaurants to competitor data
    competitors = []
    for i, restaurant in enumerate(restaurants[:6]):  # Limit to 6 competitors
        competitor = CompetitorData(
            name=restaurant["name"],
            cuisine_type=restaurant.get("cuisine", request.cuisine_type),
            rating=ratings[i] if i < len(ratings) else 4.0,
            price_range=random.choice(["$", "$$", "$$$"]),
            distance=round(restaurant.get("distance", 0) / 1000, 1),  # Convert meters to km
            estimated_revenue=random.randint(50000, 500000),
            strengths=random.sample([
                "Strong online presence" if restaurant.get("website") else "Established location",
                "Good accessibility" if restaurant.get("facilities", {}).get("wheelchair") else "Convenient hours",
                "Central location",
                "Local reputation"
            ], 2),
            weaknesses=random.sample([
                "Limited online presence" if not restaurant.get("website") else "High competition",
                "Accessibility concerns" if not restaurant.get("facilities", {}).get("wheelchair") else "Parking challenges", 
                "Price sensitivity",
                "Market saturation"
            ], 2)
        )
        competitors.append(competitor)
    
    opportunities = [
        MarketOpportunity(
            opportunity_type="Delivery Expansion",
            description="Limited delivery options in evening hours",
            potential_impact="High",
            implementation_difficulty="Low",
            estimated_roi=0.25
        ),
        MarketOpportunity(
            opportunity_type="Catering Services",
            description="Growing demand for office catering",
            potential_impact="Medium",
            implementation_difficulty="Medium",
            estimated_roi=0.18
        )
    ]
    
    customer_demographics = {
        "age_groups": {"18-25": 0.15, "26-35": 0.35, "36-45": 0.25, "46-55": 0.15, "55+": 0.10},
        "income_levels": {"low": 0.20, "medium": 0.50, "high": 0.30},
        "dining_preferences": {"dine_in": 0.45, "takeout": 0.35, "delivery": 0.20}
    }
    
    pricing_insights = {
        "optimal_price_range": request.budget_range,
        "price_sensitivity": "Medium",
        "competitor_average": random.randint(15, 35),
        "recommended_pricing": {
            "appetizers": f"${random.randint(8, 15)}",
            "main_courses": f"${random.randint(18, 32)}",
            "desserts": f"${random.randint(6, 12)}"
        }
    }
    
    marketing_recommendations = [
        "Focus on social media marketing to reach 26-35 age group",
        "Implement loyalty program to increase customer retention",
        "Partner with local businesses for cross-promotion"
    ]
    
    risk_factors = [
        "High competition in the area",
        "Rising food costs affecting profit margins",
        "Potential parking limitations"
    ]
    
    overall_market_score = round(
        (location_metrics.foot_traffic_score * 0.3 +
         location_metrics.accessibility_score * 0.2 +
         (100 - location_metrics.competition_density * 100) * 0.3 +
         location_metrics.average_rating * 20 * 0.2), 1
    )
    
    return MarketResearchResponse(
        request_id=request_id,
        location_metrics=location_metrics,
        competitors=competitors,
        market_opportunities=opportunities,
        customer_demographics=customer_demographics,
        pricing_insights=pricing_insights,
        marketing_recommendations=marketing_recommendations,
        risk_factors=risk_factors,
        overall_market_score=overall_market_score,
        generated_at=datetime.now()
    )

@app.get("/api/v1/market-research/cuisines")
async def get_cuisines():
    """Get available cuisine types for market research"""
    cuisines = [
        {"id": "italian", "name": "Italian", "popularity": 0.85, "avg_startup_cost": "$150,000"},
        {"id": "mexican", "name": "Mexican", "popularity": 0.78, "avg_startup_cost": "$120,000"},
        {"id": "chinese", "name": "Chinese", "popularity": 0.82, "avg_startup_cost": "$130,000"},
        {"id": "american", "name": "American", "popularity": 0.90, "avg_startup_cost": "$180,000"},
        {"id": "indian", "name": "Indian", "popularity": 0.65, "avg_startup_cost": "$110,000"},
        {"id": "japanese", "name": "Japanese", "popularity": 0.72, "avg_startup_cost": "$160,000"},
        {"id": "thai", "name": "Thai", "popularity": 0.68, "avg_startup_cost": "$125,000"},
        {"id": "mediterranean", "name": "Mediterranean", "popularity": 0.70, "avg_startup_cost": "$140,000"},
        {"id": "fast_casual", "name": "Fast Casual", "popularity": 0.88, "avg_startup_cost": "$100,000"},
    ]
    
    return {
        "cuisines": cuisines,
        "total_count": len(cuisines),
        "generated_at": datetime.now()
    }

@app.get("/api/v1/market-research/locations/search")
async def search_locations(
    query: str = Query(..., description="Location search query"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results")
):
    """Search for locations using real Geoapify geocoding"""
    try:
        params = {
            "text": query,
            "apiKey": GEOAPIFY_API_KEY,
            "limit": limit,
            "format": "json"
        }
        
        response = requests.get(f"{GEOAPIFY_BASE_URL}/geocode/search", params=params)
        response.raise_for_status()
        
        data = response.json()
        features = data.get("features", [])
        
        locations = []
        for feature in features:
            props = feature.get("properties", {})
            coords = feature.get("geometry", {}).get("coordinates", [0, 0])
            
            # Determine location type based on categories
            location_type = "General"
            categories = props.get("categories", [])
            if "commercial" in categories:
                location_type = "Business District"
            elif "residential" in categories:
                location_type = "Residential"
            elif "tourism" in categories:
                location_type = "Tourist Area"
            
            location = {
                "name": props.get("name", props.get("formatted", "Unknown Location")),
                "lat": coords[1] if len(coords) > 1 else 0,
                "lng": coords[0] if len(coords) > 0 else 0,
                "type": location_type,
                "formatted_address": props.get("formatted", ""),
                "city": props.get("city", ""),
                "country": props.get("country", ""),
                "market_potential": round(random.uniform(0.6, 0.95), 2),
                "competition_level": random.choice(["Low", "Medium", "High"]),
                "foot_traffic": random.randint(70, 95)
            }
            locations.append(location)
        
        # If no results from Geoapify, provide fallback locations
        if not locations:
            fallback_locations = [
                {"name": "Siam", "lat": 13.7463, "lng": 100.5350, "type": "Business District"},
                {"name": "Sukhumvit", "lat": 13.7307, "lng": 100.5418, "type": "Business District"},
                {"name": "Silom", "lat": 13.7248, "lng": 100.5340, "type": "Business District"},
                {"name": "Chatuchak", "lat": 13.7997, "lng": 100.5537, "type": "Mixed Use"},
                {"name": "Thonglor", "lat": 13.7308, "lng": 100.5826, "type": "Residential"},
                {"name": "Asok", "lat": 13.7368, "lng": 100.5601, "type": "Business District"},
                {"name": "Phrom Phong", "lat": 13.7303, "lng": 100.5693, "type": "Mixed Use"},
                {"name": "Ari", "lat": 13.7797, "lng": 100.5345, "type": "Residential"},
            ]
            
            locations = [
                loc for loc in fallback_locations 
                if query.lower() in loc["name"].lower()
            ][:limit]
            
            # Add market metrics to fallback locations
            for location in locations:
                location.update({
                    "formatted_address": f"{location['name']}, Bangkok, Thailand",
                    "city": "Bangkok",
                    "country": "Thailand",
                    "market_potential": round(random.uniform(0.6, 0.95), 2),
                    "competition_level": random.choice(["Low", "Medium", "High"]),
                    "foot_traffic": random.randint(70, 95)
                })
        
        return {
            "locations": locations,
            "total_count": len(locations),
            "query": query,
            "generated_at": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Error searching locations: {str(e)}")
        # Return fallback response
        return {
            "locations": [
                {
                    "name": "Siam Square",
                    "lat": 13.7463,
                    "lng": 100.5350,
                    "type": "Business District",
                    "formatted_address": "Siam Square, Bangkok, Thailand",
                    "city": "Bangkok",
                    "country": "Thailand",
                    "market_potential": 0.85,
                    "competition_level": "Medium",
                    "foot_traffic": 88
                }
            ],
            "total_count": 1,
            "query": query,
            "generated_at": datetime.now()
        }

# Chat Request Model
class ChatRequest(BaseModel):
    query: str = Field(..., description="User's query/message")
    language: str = Field(default="en", description="Language preference: 'th' for Thai, 'en' for English")

class ChatResponse(BaseModel):
    response: str
    intent: Optional[str] = None
    entities: Optional[Dict[str, Any]] = None
    language: str
    confidence: float
    generated_at: datetime

# Thai Language Processor
class ThaiLanguageProcessor:
    def __init__(self):
        # Thai restaurant data for realistic responses
        self.restaurants = [
            {"name": "ร้านส้มตำนางหนิง", "cuisine": "อาหารอีสาน", "rating": 4.5, "specialty": "ส้มตำ ลาบ ไก่ย่าง"},
            {"name": "ครัวคุณยาย", "cuisine": "อาหารไทยโบราณ", "rating": 4.7, "specialty": "แกงเผด แกงส่วน น้ำพริกหนุ่ม"},
            {"name": "โจ๊กพระราม", "cuisine": "อาหารเช้า", "rating": 4.2, "specialty": "โจ๊ก ปาท่องโก๋ กาแฟ"},
            {"name": "บิสโทร เดอ กรุงเทพ", "cuisine": "ฟิวชั่น", "rating": 4.6, "specialty": "ผัดไทยฝรั่งเศส แกงเขียวหวานครีม"},
            {"name": "ตลาดนัดรถไฟ", "cuisine": "อาหารริมทาง", "rating": 4.3, "specialty": "ของทานเล่น อาหารตามสั่ง"}
        ]
        
        self.market_insights = [
            "ตลาดอาหารไทยใน กรุงเทพฯ มีความหลากหลายสูง",
            "อาหารอีสานได้รับความนิยมเพิ่มขึ้นอย่างต่อเนื่อง",
            "ร้านอาหารฟิวชั่นมีแนวโน้มเติบโตในพื้นที่ ศูนย์กลางธุรกิจ",
            "อาหารริมทางยังคงเป็นตัวเลือกหลักของคนไทย"
        ]

    def process_query(self, query: str) -> Dict[str, Any]:
        """Process Thai language query and return structured response"""
        
        # Intent detection patterns
        intent_patterns = {
            "greeting": ["สวัสดี", "หวัดดี", "ดีครับ", "ดีค่ะ"],
            "restaurant_info": ["ร้านอาหار", "ร้าน", "อาหาร", "กิน", "ทาน"],
            "market_research": ["วิเคราะห์ตลาด", "ตลาด", "การแข่งขัน", "คู่แข่ง"],
            "location": ["ที่ตั้ง", "สถานที่", "พื้นที่", "ทำเล"],
            "menu_recommendation": ["เมนู", "แนะนำ", "อร่อย", "เด็ด"]
        }
        
        # Detect intent
        detected_intent = "general"
        for intent, patterns in intent_patterns.items():
            if any(pattern in query for pattern in patterns):
                detected_intent = intent
                break
        
        # Entity extraction
        entities = {}
        
        # Location entities
        bangkok_areas = ["สยาม", "สุขุมวิท", "สีลม", "ชาตุชัก", "ทองหล่อ", "อโศก", "พร้อมพงษ์", "อารีย์"]
        for area in bangkok_areas:
            if area in query:
                entities["location"] = area
        
        # Cuisine entities  
        cuisines = ["อีสาน", "ไทย", "จีน", "ญี่ปุ่น", "อิตาเลียน", "ฝรั่งเศส", "อเมริกัน"]
        for cuisine in cuisines:
            if cuisine in query:
                entities["cuisine"] = cuisine
        
        return {
            "intent": detected_intent,
            "entities": entities,
            "query": query
        }

    def generate_response(self, processed_query: Dict[str, Any]) -> str:
        """Generate natural Thai response based on processed query"""
        
        intent = processed_query["intent"]
        entities = processed_query["entities"]
        query = processed_query["query"]
        
        if intent == "greeting":
            return "สวัสดีครับ! ยินดีต้อนรับสู่ BiteBase Intelligence ระบบวิเคราะห์ธุรกิจร้านอาหารครับ มีอะไรให้ช่วยเหลือไหมครับ?"
        
        elif intent == "restaurant_info":
            # Select a random restaurant to showcase
            restaurant = random.choice(self.restaurants)
            return f"ผมแนะนำ {restaurant['name']} ครับ เป็นร้าน{restaurant['cuisine']} ที่มีเรตติ้ง {restaurant['rating']}/5 ดาว เมนูเด็ดคือ {restaurant['specialty']} สนใจข้อมูลเพิ่มเติมหรือการวิเคราะห์ตลาดไหมครับ?"
        
        elif intent == "market_research":
            insight = random.choice(self.market_insights)
            location = entities.get("location", "กรุงเทพฯ")
            return f"จากการวิเคราะห์ตลาดในพื้นที่ {location} ครับ {insight} หากต้องการรายงานวิเคราะห์โดยละเอียด สามารถระบุประเภทอาหารและงบประมาณเพื่อให้ผมวิเคราะห์เจาะลึกให้ได้ครับ"
        
        elif intent == "location":
            location = entities.get("location", "บริเวณที่สนใจ")
            return f"สำหรับพื้นที่ {location} ครับ เป็นทำเลที่มีศักยภาพสูงสำหรับธุรกิจร้านอาหาร มีการเข้าถึงที่สะดวก และกลุ่มลูกค้าที่หลากหลาย ต้องการข้อมูลการแข่งขันและการวิเคราะห์โอกาสทางการตลาดไหมครับ?"
        
        elif intent == "menu_recommendation":
            cuisine = entities.get("cuisine", "อาหารไทย")
            return f"สำหรับ{cuisine}ครับ ผมแนะนำให้พิจารณาเมนูที่ตอบโจทย์กลุ่มเป้าหมาย เช่น เมนูคลีน เมนูฟิวชั่น หรือเมนูพื้นบ้านต้นตำรับ ขึ้นอยู่กับตำแหน่งและกลุ่มลูกค้าครับ ต้องการวิเคราะห์เจาะลึกไหมครับ?"
        
        else:
            return f"เกี่ยวกับ '{query}' ครับ ผมเป็นระบบวิเคราะห์ธุรกิจร้านอาหารที่สามารถช่วยวิเคราะห์ตลาด แนะนำทำเล ประเมินการแข่งขัน และให้คำแนะนำเชิงกลยุทธ์ได้ครับ หากมีคำถามเฉพาะเจาะจง กรุณาถามได้เลยครับ"

# Initialize Thai language processor
thai_processor = ThaiLanguageProcessor()

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Enhanced bilingual chat endpoint with Thai language support"""
    
    if request.language == "th":
        # Process Thai language
        processed = thai_processor.process_query(request.query)
        response_text = thai_processor.generate_response(processed)
        
        return ChatResponse(
            response=response_text,
            intent=processed["intent"],
            entities=processed["entities"],
            language="th",
            confidence=0.85,
            generated_at=datetime.now()
        )
    
    else:
        # English processing
        intent = "general"
        entities = {}
        
        # Simple English intent detection
        if any(word in request.query.lower() for word in ["hello", "hi", "hey"]):
            intent = "greeting"
            response_text = "Hello! Welcome to BiteBase Intelligence. How can I help you with restaurant business insights today?"
        elif any(word in request.query.lower() for word in ["restaurant", "food", "menu"]):
            intent = "restaurant_info"  
            response_text = "I can help you analyze restaurant markets, competitors, and opportunities. What specific information would you like to know?"
        elif any(word in request.query.lower() for word in ["market", "competition", "analysis"]):
            intent = "market_research"
            response_text = "I can provide comprehensive market research including competitor analysis, location insights, and growth opportunities. What area are you interested in analyzing?"
        elif any(word in request.query.lower() for word in ["location", "area", "place"]):
            intent = "location"
            response_text = "Location analysis is crucial for restaurant success. I can help evaluate foot traffic, competition density, and market potential for any area. Which location interests you?"
        else:
            response_text = f"Regarding '{request.query}', I'm a restaurant business intelligence system that can help with market analysis, location evaluation, competitor research, and strategic recommendations. How can I assist you specifically?"
        
        return ChatResponse(
            response=response_text,
            intent=intent,
            entities=entities,
            language="en", 
            confidence=0.80,
            generated_at=datetime.now()
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)