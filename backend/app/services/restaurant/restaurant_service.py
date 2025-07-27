"""
BiteBase Intelligence Restaurant Service
Business logic for restaurant data management
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
# from geoalchemy2.functions import ST_GeogFromText, ST_Point  # Disabled for SQLite
from typing import Optional, List
import uuid
import math
from datetime import datetime

from app.models.restaurant import Restaurant, MenuItem, RestaurantReview
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate
from app.services.location.geocoding_service import GeocodingService


class RestaurantService:
    """Service class for restaurant operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.geocoding_service = GeocodingService()
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return 6371 * c  # Earth's radius in km
    
    async def create_restaurant(self, restaurant_data: RestaurantCreate) -> Restaurant:
        """Create a new restaurant with location data"""
        try:
            # Create restaurant instance with lat/lng coordinates
            restaurant = Restaurant(
                name=restaurant_data.name,
                brand=restaurant_data.brand,
                address=restaurant_data.location.address,
                city=restaurant_data.location.city,
                area=restaurant_data.location.area,
                country=restaurant_data.location.country,
                postal_code=restaurant_data.location.postal_code,
                latitude=restaurant_data.location.latitude,
                longitude=restaurant_data.location.longitude,
                cuisine_types=restaurant_data.cuisine_types,
                category=restaurant_data.category,
                price_range=restaurant_data.price_range,
                phone=restaurant_data.phone,
                email=restaurant_data.email,
                website=restaurant_data.website,
                seating_capacity=restaurant_data.seating_capacity,
                opening_date=restaurant_data.opening_date,
                is_active=True,
                data_quality_score=0.8,  # Initial score
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Add to database
            self.db.add(restaurant)
            await self.db.commit()
            await self.db.refresh(restaurant)
            
            return restaurant
            
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to create restaurant: {str(e)}")
    
    async def get_restaurant(self, restaurant_id: uuid.UUID) -> Optional[Restaurant]:
        """Get restaurant by ID"""
        try:
            query = select(Restaurant).where(Restaurant.id == restaurant_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
            
        except Exception as e:
            raise Exception(f"Failed to get restaurant: {str(e)}")
    
    async def update_restaurant(self, restaurant_id: uuid.UUID, restaurant_data: RestaurantUpdate) -> Optional[Restaurant]:
        """Update restaurant data"""
        try:
            # Get existing restaurant
            restaurant = await self.get_restaurant(restaurant_id)
            if not restaurant:
                return None
            
            # Update fields
            update_data = restaurant_data.dict(exclude_unset=True)
            if update_data:
                update_data['updated_at'] = datetime.utcnow()
                
                query = update(Restaurant).where(Restaurant.id == restaurant_id).values(**update_data)
                await self.db.execute(query)
                await self.db.commit()
                
                # Refresh and return updated restaurant
                await self.db.refresh(restaurant)
            
            return restaurant
            
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to update restaurant: {str(e)}")
    
    async def delete_restaurant(self, restaurant_id: uuid.UUID) -> bool:
        """Soft delete restaurant (set is_active=False)"""
        try:
            query = update(Restaurant).where(Restaurant.id == restaurant_id).values(
                is_active=False,
                updated_at=datetime.utcnow()
            )
            result = await self.db.execute(query)
            await self.db.commit()
            
            return result.rowcount > 0
            
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to delete restaurant: {str(e)}")
    
    async def search_restaurants(self, **filters) -> List[Restaurant]:
        """Search restaurants with various filters"""
        try:
            query = select(Restaurant).where(Restaurant.is_active == True)
            
            # Apply filters
            if 'name' in filters and filters['name']:
                query = query.where(Restaurant.name.ilike(f"%{filters['name']}%"))
            
            if 'city' in filters and filters['city']:
                query = query.where(Restaurant.city.ilike(f"%{filters['city']}%"))
            
            if 'cuisine' in filters and filters['cuisine']:
                query = query.where(Restaurant.cuisine_types.any(filters['cuisine']))
            
            if 'category' in filters and filters['category']:
                query = query.where(Restaurant.category == filters['category'])
            
            if 'brand' in filters and filters['brand']:
                query = query.where(Restaurant.brand.ilike(f"%{filters['brand']}%"))
            
            if 'min_rating' in filters and filters['min_rating']:
                query = query.where(Restaurant.average_rating >= filters['min_rating'])
            
            # Execute query
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            raise Exception(f"Failed to search restaurants: {str(e)}")
    
    async def get_restaurant_statistics(self, restaurant_id: uuid.UUID) -> dict:
        """Get comprehensive statistics for a restaurant"""
        try:
            restaurant = await self.get_restaurant(restaurant_id)
            if not restaurant:
                return {}
            
            # Get menu item count
            menu_count_query = select(func.count(MenuItem.id)).where(MenuItem.restaurant_id == restaurant_id)
            menu_count_result = await self.db.execute(menu_count_query)
            menu_count = menu_count_result.scalar()
            
            # Get review statistics
            review_stats_query = select(
                func.count(RestaurantReview.id).label('total_reviews'),
                func.avg(RestaurantReview.rating).label('avg_rating'),
                func.avg(RestaurantReview.sentiment_score).label('avg_sentiment')
            ).where(RestaurantReview.restaurant_id == restaurant_id)
            
            review_stats_result = await self.db.execute(review_stats_query)
            review_stats = review_stats_result.first()
            
            return {
                'restaurant_id': str(restaurant_id),
                'name': restaurant.name,
                'menu_items_count': menu_count,
                'total_reviews': review_stats.total_reviews or 0,
                'average_rating': round(review_stats.avg_rating or 0, 2),
                'average_sentiment': round(review_stats.avg_sentiment or 0, 3),
                'cuisine_types': restaurant.cuisine_types,
                'category': restaurant.category,
                'is_active': restaurant.is_active,
                'data_quality_score': restaurant.data_quality_score
            }
            
        except Exception as e:
            raise Exception(f"Failed to get restaurant statistics: {str(e)}")
    
    async def update_restaurant_rating(self, restaurant_id: uuid.UUID) -> bool:
        """Recalculate and update restaurant average rating"""
        try:
            # Calculate new average rating from reviews
            rating_query = select(
                func.avg(RestaurantReview.rating).label('avg_rating'),
                func.count(RestaurantReview.id).label('total_reviews')
            ).where(RestaurantReview.restaurant_id == restaurant_id)
            
            rating_result = await self.db.execute(rating_query)
            rating_data = rating_result.first()
            
            # Update restaurant record
            update_query = update(Restaurant).where(Restaurant.id == restaurant_id).values(
                average_rating=rating_data.avg_rating,
                total_reviews=rating_data.total_reviews,
                updated_at=datetime.utcnow()
            )
            
            await self.db.execute(update_query)
            await self.db.commit()
            
            return True
            
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to update restaurant rating: {str(e)}")
    
    async def get_nearby_competitors(self, restaurant_id: uuid.UUID, radius_km: float = 2.0) -> List[Restaurant]:
        """Find competitor restaurants within specified radius"""
        try:
            # Get the target restaurant
            restaurant = await self.get_restaurant(restaurant_id)
            if not restaurant:
                return []
            
            # Find all restaurants and filter by distance and similarity
            query = select(Restaurant).where(
                and_(
                    Restaurant.id != restaurant_id,
                    Restaurant.is_active == True
                )
            )
            
            result = await self.db.execute(query)
            all_restaurants = result.scalars().all()
            
            # Filter by distance and similarity, then sort by distance
            nearby_restaurants = []
            for candidate in all_restaurants:
                distance = self.calculate_distance(
                    restaurant.latitude, restaurant.longitude,
                    candidate.latitude, candidate.longitude
                )
                if distance <= radius_km:
                    # Check if similar cuisine or same category
                    has_similar_cuisine = any(cuisine in candidate.cuisine_types for cuisine in restaurant.cuisine_types)
                    if has_similar_cuisine or candidate.category == restaurant.category:
                        nearby_restaurants.append((candidate, distance))
            
            # Sort by distance and limit to 20
            nearby_restaurants.sort(key=lambda x: x[1])
            return [restaurant for restaurant, _ in nearby_restaurants[:20]]
            
        except Exception as e:
            raise Exception(f"Failed to find nearby competitors: {str(e)}")
    
    async def calculate_market_density(self, latitude: float, longitude: float, radius_km: float = 5.0) -> dict:
        """Calculate restaurant market density for a location"""
        try:
            # Get all restaurants and filter by distance
            all_restaurants_query = select(Restaurant).where(Restaurant.is_active == True)
            all_restaurants_result = await self.db.execute(all_restaurants_query)
            all_restaurants = all_restaurants_result.scalars().all()
            
            # Filter by distance and count by category
            restaurants_in_radius = []
            for restaurant in all_restaurants:
                distance = self.calculate_distance(latitude, longitude, restaurant.latitude, restaurant.longitude)
                if distance <= radius_km:
                    restaurants_in_radius.append(restaurant)
            
            # Count by category
            category_counts = {}
            for restaurant in restaurants_in_radius:
                category = restaurant.category or 'unknown'
                category_counts[category] = category_counts.get(category, 0) + 1
            
            # Convert to the expected format
            density_data = [(category, count) for category, count in category_counts.items()]
            
            # Calculate total and density metrics
            total_restaurants = sum(count for category, count in density_data)
            area_km2 = 3.14159 * (radius_km ** 2)  # Circle area
            
            return {
                'location': {'latitude': latitude, 'longitude': longitude},
                'radius_km': radius_km,
                'total_restaurants': total_restaurants,
                'density_per_km2': round(total_restaurants / area_km2, 2),
                'category_breakdown': {category: count for category, count in density_data},
                'market_saturation': 'high' if total_restaurants > 50 else 'medium' if total_restaurants > 20 else 'low'
            }
            
        except Exception as e:
            raise Exception(f"Failed to calculate market density: {str(e)}")