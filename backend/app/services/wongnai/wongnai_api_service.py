"""
Wongnai API Service
Handles integration with Wongnai APIs for business and menu data retrieval
"""
import asyncio
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class WongnaiAPIService:
    """Service for interacting with Wongnai APIs"""
    
    def __init__(self):
        self.base_url = "https://www.wongnai.com/_api"
        self.timeout = 30.0
        self.rate_limit_delay = 1.0  # 1 second between requests
        
    async def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make HTTP request to Wongnai API with error handling and rate limiting"""
        url = f"{self.base_url}{endpoint}"
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9,th;q=0.8",
            "Referer": "https://www.wongnai.com/",
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params, headers=headers)
                response.raise_for_status()
                
                # Rate limiting
                await asyncio.sleep(self.rate_limit_delay)
                
                return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching {url}: {e.response.status_code}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Request error fetching {url}: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching {url}: {str(e)}")
            raise
    
    async def search_businesses(
        self,
        latitude: float,
        longitude: float,
        radius: float = 2000,  # meters
        cuisine_type: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Search for businesses near a location using Wongnai businesses API
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            radius: Search radius in meters
            cuisine_type: Optional cuisine filter
            limit: Maximum number of results
            
        Returns:
            List of business data from Wongnai
        """
        params = {
            "lat": latitude,
            "lng": longitude,
            "radius": radius,
            "limit": limit,
            "type": "restaurant"
        }
        
        if cuisine_type:
            params["cuisine"] = cuisine_type
            
        try:
            data = await self._make_request("/businesses", params)
            
            # Extract businesses from response
            businesses = data.get("businesses", []) if isinstance(data, dict) else []
            
            # Clean and standardize business data
            cleaned_businesses = []
            for business in businesses:
                cleaned_business = self._clean_business_data(business)
                if cleaned_business:
                    cleaned_businesses.append(cleaned_business)
                    
            logger.info(f"Found {len(cleaned_businesses)} businesses near ({latitude}, {longitude})")
            return cleaned_businesses
            
        except Exception as e:
            logger.error(f"Error searching businesses: {str(e)}")
            return []
    
    async def get_restaurant_menu(self, public_id: str) -> Dict[str, Any]:
        """
        Get detailed menu data for a restaurant using Wongnai delivery menu API
        
        Args:
            public_id: Restaurant's public ID from businesses API
            
        Returns:
            Restaurant menu data with dishes, prices, and categories
        """
        try:
            endpoint = f"/restaurants/{public_id}/delivery-menu"
            data = await self._make_request(endpoint)
            
            # Clean and structure menu data
            menu_data = self._clean_menu_data(data, public_id)
            
            logger.info(f"Retrieved menu for restaurant {public_id}")
            return menu_data
            
        except Exception as e:
            logger.error(f"Error fetching menu for restaurant {public_id}: {str(e)}")
            return {}
    
    async def get_restaurants_with_menus(
        self,
        latitude: float,
        longitude: float,
        radius: float = 2000,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get restaurants with their full menu data for comprehensive analysis
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            radius: Search radius in meters
            limit: Maximum number of restaurants
            
        Returns:
            List of restaurants with menu data
        """
        # First get businesses
        businesses = await self.search_businesses(latitude, longitude, radius, limit=limit)
        
        # Then get menu for each business
        restaurants_with_menus = []
        
        for business in businesses:
            public_id = business.get("public_id")
            if not public_id:
                continue
                
            menu_data = await self.get_restaurant_menu(public_id)
            if menu_data:
                # Combine business and menu data
                restaurant_data = {
                    **business,
                    "menu": menu_data
                }
                restaurants_with_menus.append(restaurant_data)
                
        logger.info(f"Retrieved {len(restaurants_with_menus)} restaurants with menus")
        return restaurants_with_menus
    
    def _clean_business_data(self, business: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and standardize business data from Wongnai API"""
        try:
            return {
                "public_id": business.get("publicId") or business.get("id"),
                "name": business.get("name", ""),
                "cuisine_type": business.get("cuisineType", ""),
                "rating": business.get("rating", 0.0),
                "review_count": business.get("reviewCount", 0),
                "price_level": business.get("priceLevel", 1),
                "latitude": business.get("lat") or business.get("latitude"),
                "longitude": business.get("lng") or business.get("longitude"),
                "address": business.get("address", ""),
                "phone": business.get("phone", ""),
                "opening_hours": business.get("openingHours", {}),
                "delivery_available": business.get("deliveryAvailable", False),
                "image_url": business.get("imageUrl", ""),
                "wongnai_url": business.get("url", ""),
                "tags": business.get("tags", []),
                "distance": business.get("distance", 0),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        except Exception as e:
            logger.error(f"Error cleaning business data: {str(e)}")
            return None
    
    def _clean_menu_data(self, menu_data: Dict[str, Any], public_id: str) -> Dict[str, Any]:
        """Clean and structure menu data from Wongnai delivery menu API"""
        try:
            categories = menu_data.get("categories", [])
            dishes = []
            
            for category in categories:
                category_name = category.get("name", "")
                category_items = category.get("items", [])
                
                for item in category_items:
                    dish = {
                        "dish_id": item.get("id"),
                        "name": item.get("name", ""),
                        "description": item.get("description", ""),
                        "price": item.get("price", 0.0),
                        "category": category_name,
                        "image_url": item.get("imageUrl", ""),
                        "available": item.get("available", True),
                        "popular": item.get("popular", False),
                        "spicy_level": item.get("spicyLevel", 0),
                        "ingredients": item.get("ingredients", []),
                        "allergens": item.get("allergens", []),
                        "dietary_info": item.get("dietaryInfo", [])
                    }
                    dishes.append(dish)
            
            return {
                "public_id": public_id,
                "total_dishes": len(dishes),
                "categories": [cat.get("name", "") for cat in categories],
                "dishes": dishes,
                "price_range": self._calculate_price_range(dishes),
                "cuisine_analysis": self._analyze_cuisine_from_menu(dishes),
                "updated_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error cleaning menu data: {str(e)}")
            return {}
    
    def _calculate_price_range(self, dishes: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate price range from menu dishes"""
        prices = [dish.get("price", 0) for dish in dishes if dish.get("price", 0) > 0]
        
        if not prices:
            return {"min": 0.0, "max": 0.0, "average": 0.0}
            
        return {
            "min": min(prices),
            "max": max(prices),
            "average": sum(prices) / len(prices)
        }
    
    def _analyze_cuisine_from_menu(self, dishes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze cuisine characteristics from menu dishes"""
        # Count dish categories
        categories = {}
        for dish in dishes:
            category = dish.get("category", "Other")
            categories[category] = categories.get(category, 0) + 1
        
        # Analyze dietary options
        dietary_options = set()
        spicy_dishes = 0
        
        for dish in dishes:
            dietary_info = dish.get("dietary_info", [])
            dietary_options.update(dietary_info)
            
            if dish.get("spicy_level", 0) > 0:
                spicy_dishes += 1
        
        return {
            "categories": categories,
            "dietary_options": list(dietary_options),
            "spicy_dishes_count": spicy_dishes,
            "spicy_percentage": (spicy_dishes / len(dishes) * 100) if dishes else 0
        }

# Global service instance
wongnai_service = WongnaiAPIService()