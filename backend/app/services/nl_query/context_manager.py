"""
BiteBase Intelligence Restaurant Context Manager
Manages context awareness for natural language queries
"""

import logging
from typing import Dict, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.models.restaurant import Restaurant, RestaurantAnalytics, MenuItem
from app.models.dashboard import Dashboard
from app.schemas.nl_query import RestaurantQueryContext

logger = logging.getLogger(__name__)


class RestaurantContextManager:
    """Manages restaurant-specific context for NL queries"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self._context_cache = {}
        self._cache_ttl = 300  # 5 minutes
    
    async def get_user_context(self, user_id: str, dashboard_id: Optional[str] = None, 
                              additional_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Get comprehensive user context for query processing"""
        try:
            # Check cache first
            cache_key = f"{user_id}:{dashboard_id or 'global'}"
            if self._is_cache_valid(cache_key):
                cached_context = self._context_cache[cache_key]['data']
                logger.info(f"Using cached context for user {user_id}")
                return self._merge_additional_context(cached_context, additional_context)
            
            # Build fresh context
            context = await self._build_user_context(user_id, dashboard_id)
            
            # Cache the context
            self._context_cache[cache_key] = {
                'data': context,
                'timestamp': datetime.utcnow()
            }
            
            return self._merge_additional_context(context, additional_context)
            
        except Exception as e:
            logger.error(f"Error getting user context: {str(e)}")
            return self._get_default_context()
    
    async def _build_user_context(self, user_id: str, dashboard_id: Optional[str] = None) -> Dict[str, Any]:
        """Build comprehensive user context"""
        context = {
            'user_id': user_id,
            'dashboard_id': dashboard_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Get accessible restaurants
        accessible_restaurants = await self._get_accessible_restaurants(user_id)
        context['accessible_restaurants'] = accessible_restaurants
        context['restaurant_count'] = len(accessible_restaurants)
        
        # Get available date range
        date_range = await self._get_available_date_range(accessible_restaurants)
        context['available_date_range'] = date_range
        
        # Get dashboard context if provided
        if dashboard_id:
            dashboard_context = await self._get_dashboard_context(dashboard_id)
            context.update(dashboard_context)
        
        # Get restaurant schema information
        schema_info = await self._get_schema_information()
        context['schema_info'] = schema_info
        
        # Get user preferences and history
        user_preferences = await self._get_user_preferences(user_id)
        context['user_preferences'] = user_preferences
        
        # Get available locations
        available_locations = await self._get_available_locations(accessible_restaurants)
        context['available_locations'] = available_locations
        
        # Get menu categories
        menu_categories = await self._get_menu_categories(accessible_restaurants)
        context['menu_categories'] = menu_categories
        
        return context
    
    async def _get_accessible_restaurants(self, user_id: str) -> List[Dict[str, Any]]:
        """Get restaurants accessible to the user"""
        try:
            # For now, return all active restaurants
            # In production, this would be filtered by user permissions
            query = select(Restaurant).where(Restaurant.is_active == True).limit(100)
            result = await self.db.execute(query)
            restaurants = result.scalars().all()
            
            return [
                {
                    'id': str(restaurant.id),
                    'name': restaurant.name,
                    'brand': restaurant.brand,
                    'city': restaurant.city,
                    'area': restaurant.area,
                    'cuisine_types': restaurant.cuisine_types,
                    'category': restaurant.category
                }
                for restaurant in restaurants
            ]
            
        except Exception as e:
            logger.error(f"Error getting accessible restaurants: {str(e)}")
            return []
    
    async def _get_available_date_range(self, restaurants: List[Dict[str, Any]]) -> Dict[str, str]:
        """Get available date range for analytics data"""
        try:
            if not restaurants:
                return {'start_date': '', 'end_date': ''}
            
            restaurant_ids = [r['id'] for r in restaurants]
            
            # Get min and max dates from analytics
            query = select(
                func.min(RestaurantAnalytics.date).label('min_date'),
                func.max(RestaurantAnalytics.date).label('max_date')
            ).where(RestaurantAnalytics.restaurant_id.in_(restaurant_ids))
            
            result = await self.db.execute(query)
            date_range = result.first()
            
            if date_range and date_range.min_date and date_range.max_date:
                return {
                    'start_date': date_range.min_date.isoformat(),
                    'end_date': date_range.max_date.isoformat()
                }
            
            # Fallback to last 90 days
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=90)
            
            return {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting date range: {str(e)}")
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=90)
            return {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
    
    async def _get_dashboard_context(self, dashboard_id: str) -> Dict[str, Any]:
        """Get dashboard-specific context"""
        try:
            query = select(Dashboard).where(Dashboard.id == dashboard_id)
            result = await self.db.execute(query)
            dashboard = result.scalar_one_or_none()
            
            if dashboard:
                return {
                    'dashboard_name': dashboard.name,
                    'dashboard_theme': dashboard.theme_config,
                    'dashboard_settings': dashboard.settings_config,
                    'widget_count': len(dashboard.widgets) if dashboard.widgets else 0
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Error getting dashboard context: {str(e)}")
            return {}
    
    async def _get_schema_information(self) -> Dict[str, Any]:
        """Get database schema information for query generation"""
        return {
            'tables': {
                'restaurants': {
                    'columns': ['id', 'name', 'brand', 'city', 'area', 'country', 'cuisine_types', 'category', 'average_rating'],
                    'primary_key': 'id',
                    'description': 'Restaurant master data'
                },
                'restaurant_analytics': {
                    'columns': ['restaurant_id', 'date', 'period_type', 'estimated_revenue', 'estimated_customers', 'average_order_value'],
                    'primary_key': 'id',
                    'foreign_keys': {'restaurant_id': 'restaurants.id'},
                    'description': 'Restaurant performance analytics'
                },
                'menu_items': {
                    'columns': ['id', 'restaurant_id', 'name', 'category', 'price', 'popularity_score'],
                    'primary_key': 'id',
                    'foreign_keys': {'restaurant_id': 'restaurants.id'},
                    'description': 'Restaurant menu items'
                },
                'restaurant_reviews': {
                    'columns': ['id', 'restaurant_id', 'rating', 'review_text', 'source_platform', 'sentiment_score'],
                    'primary_key': 'id',
                    'foreign_keys': {'restaurant_id': 'restaurants.id'},
                    'description': 'Restaurant reviews and ratings'
                }
            },
            'relationships': {
                'restaurant_analytics': 'restaurants.id = restaurant_analytics.restaurant_id',
                'menu_items': 'restaurants.id = menu_items.restaurant_id',
                'restaurant_reviews': 'restaurants.id = restaurant_reviews.restaurant_id'
            }
        }
    
    async def _get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences and query history"""
        try:
            # This would typically query user preferences and recent query patterns
            # For now, return default preferences
            return {
                'preferred_metrics': ['revenue', 'customers', 'rating'],
                'preferred_time_period': 'last_month',
                'preferred_chart_types': ['line', 'bar', 'pie'],
                'recent_queries': [],
                'favorite_locations': []
            }
            
        except Exception as e:
            logger.error(f"Error getting user preferences: {str(e)}")
            return {}
    
    async def _get_available_locations(self, restaurants: List[Dict[str, Any]]) -> List[str]:
        """Get list of available locations"""
        try:
            locations = set()
            
            for restaurant in restaurants:
                if restaurant.get('city'):
                    locations.add(restaurant['city'])
                if restaurant.get('area'):
                    locations.add(restaurant['area'])
            
            return sorted(list(locations))
            
        except Exception as e:
            logger.error(f"Error getting available locations: {str(e)}")
            return []
    
    async def _get_menu_categories(self, restaurants: List[Dict[str, Any]]) -> List[str]:
        """Get available menu categories"""
        try:
            if not restaurants:
                return []
            
            restaurant_ids = [r['id'] for r in restaurants]
            
            query = select(MenuItem.category).where(
                MenuItem.restaurant_id.in_(restaurant_ids)
            ).distinct()
            
            result = await self.db.execute(query)
            categories = [row[0] for row in result.fetchall() if row[0]]
            
            return sorted(categories)
            
        except Exception as e:
            logger.error(f"Error getting menu categories: {str(e)}")
            return ['appetizer', 'main', 'dessert', 'beverage']  # Default categories
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached context is still valid"""
        if cache_key not in self._context_cache:
            return False
        
        cache_entry = self._context_cache[cache_key]
        cache_age = (datetime.utcnow() - cache_entry['timestamp']).total_seconds()
        
        return cache_age < self._cache_ttl
    
    def _merge_additional_context(self, base_context: Dict[str, Any], 
                                 additional_context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Merge additional context with base context"""
        if not additional_context:
            return base_context
        
        merged_context = base_context.copy()
        merged_context.update(additional_context)
        
        return merged_context
    
    def _get_default_context(self) -> Dict[str, Any]:
        """Get default context when context building fails"""
        return {
            'user_id': 'unknown',
            'dashboard_id': None,
            'accessible_restaurants': [],
            'restaurant_count': 0,
            'available_date_range': {
                'start_date': (datetime.utcnow() - timedelta(days=90)).isoformat(),
                'end_date': datetime.utcnow().isoformat()
            },
            'available_locations': [],
            'menu_categories': ['appetizer', 'main', 'dessert', 'beverage'],
            'user_preferences': {
                'preferred_metrics': ['revenue', 'customers'],
                'preferred_time_period': 'last_month',
                'preferred_chart_types': ['line', 'bar']
            },
            'schema_info': self._get_schema_information(),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    async def invalidate_user_context(self, user_id: str, dashboard_id: Optional[str] = None):
        """Invalidate cached context for a user"""
        cache_key = f"{user_id}:{dashboard_id or 'global'}"
        if cache_key in self._context_cache:
            del self._context_cache[cache_key]
            logger.info(f"Invalidated context cache for {cache_key}")
    
    async def get_context_summary(self, user_id: str) -> Dict[str, Any]:
        """Get a summary of user context for debugging"""
        context = await self.get_user_context(user_id)
        
        return {
            'user_id': context.get('user_id'),
            'restaurant_count': context.get('restaurant_count', 0),
            'location_count': len(context.get('available_locations', [])),
            'date_range': context.get('available_date_range'),
            'menu_categories': len(context.get('menu_categories', [])),
            'cache_status': 'cached' if self._is_cache_valid(f"{user_id}:global") else 'fresh'
        }