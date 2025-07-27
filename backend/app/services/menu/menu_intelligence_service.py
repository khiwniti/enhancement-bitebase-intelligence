"""
BiteBase Intelligence Menu Intelligence Service
AI-powered menu analysis and pricing optimization
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
# from geoalchemy2.functions import ST_DWithin, ST_GeogFromText  # Disabled for SQLite
from typing import List, Optional, Dict, Any
import uuid
import random
import math
from datetime import datetime, timedelta

from app.models.restaurant import Restaurant, MenuItem


class MenuIntelligenceService:
    """Service for menu intelligence and pricing optimization"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return 6371 * c  # Earth's radius in km
    
    async def analyze_menu_competitiveness(
        self,
        restaurant_id: uuid.UUID,
        radius_km: float = 5.0,
        include_pricing: bool = True,
        include_trends: bool = True
    ) -> Dict[str, Any]:
        """
        Analyze menu competitiveness against local market
        """
        try:
            # Get target restaurant
            restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
            restaurant_result = await self.db.execute(restaurant_query)
            restaurant = restaurant_result.scalar_one_or_none()
            
            if not restaurant:
                raise Exception("Restaurant not found")
            
            # Get restaurant's menu
            menu_query = select(MenuItem).where(MenuItem.restaurant_id == restaurant_id)
            menu_result = await self.db.execute(menu_query)
            menu_items = menu_result.scalars().all()
            
            # Find competitor restaurants in radius
            all_restaurants_query = select(Restaurant).where(
                and_(
                    Restaurant.id != restaurant_id,
                    Restaurant.is_active == True
                )
            )
            
            all_restaurants_result = await self.db.execute(all_restaurants_query)
            all_restaurants = all_restaurants_result.scalars().all()
            
            # Filter by distance and similarity
            competitors = []
            for comp_restaurant in all_restaurants:
                distance = self.calculate_distance(
                    restaurant.latitude, restaurant.longitude,
                    comp_restaurant.latitude, comp_restaurant.longitude
                )
                if distance <= radius_km:
                    # Check if similar cuisine or category
                    has_similar_cuisine = any(cuisine in comp_restaurant.cuisine_types for cuisine in restaurant.cuisine_types)
                    if has_similar_cuisine or comp_restaurant.category == restaurant.category:
                        competitors.append(comp_restaurant)
            
            # Get competitor menu items
            competitor_ids = [c.id for c in competitors]
            competitor_menu_query = select(MenuItem).where(MenuItem.restaurant_id.in_(competitor_ids))
            competitor_menu_result = await self.db.execute(competitor_menu_query)
            competitor_menu_items = competitor_menu_result.scalars().all()
            
            analysis = {
                'restaurant_info': {
                    'id': str(restaurant.id),
                    'name': restaurant.name,
                    'cuisine_types': restaurant.cuisine_types,
                    'category': restaurant.category,
                    'menu_items_count': len(menu_items)
                },
                'market_context': {
                    'competitors_analyzed': len(competitors),
                    'competitor_menu_items': len(competitor_menu_items),
                    'analysis_radius_km': radius_km
                }
            }
            
            if include_pricing:
                pricing_analysis = await self._analyze_pricing_competitiveness(
                    menu_items, competitor_menu_items
                )
                analysis['pricing_analysis'] = pricing_analysis
            
            if include_trends:
                trend_analysis = await self._analyze_menu_trends(
                    menu_items, competitor_menu_items
                )
                analysis['trend_analysis'] = trend_analysis
            
            # Menu gap analysis
            gap_analysis = await self._identify_menu_gaps(
                menu_items, competitor_menu_items
            )
            analysis['gap_analysis'] = gap_analysis
            
            # Competitive positioning
            positioning = await self._analyze_competitive_positioning(
                restaurant, menu_items, competitors, competitor_menu_items
            )
            analysis['competitive_positioning'] = positioning
            
            return analysis
            
        except Exception as e:
            raise Exception(f"Menu competitiveness analysis failed: {str(e)}")
    
    async def optimize_item_pricing(
        self,
        menu_item_id: uuid.UUID,
        optimization_goal: str = "revenue"
    ) -> Dict[str, Any]:
        """
        Optimize pricing for a specific menu item
        """
        try:
            # Get menu item
            item_query = select(MenuItem).where(MenuItem.id == menu_item_id)
            item_result = await self.db.execute(item_query)
            menu_item = item_result.scalar_one_or_none()
            
            if not menu_item:
                raise Exception("Menu item not found")
            
            # Get restaurant info
            restaurant_query = select(Restaurant).where(Restaurant.id == menu_item.restaurant_id)
            restaurant_result = await self.db.execute(restaurant_query)
            restaurant = restaurant_result.scalar_one_or_none()
            
            # Find similar items in market
            similar_items = await self._find_similar_menu_items(menu_item, restaurant)
            
            # Calculate optimal price based on goal
            if optimization_goal == "revenue":
                optimal_price = await self._optimize_for_revenue(menu_item, similar_items)
            elif optimization_goal == "profit":
                optimal_price = await self._optimize_for_profit(menu_item, similar_items)
            else:  # volume
                optimal_price = await self._optimize_for_volume(menu_item, similar_items)
            
            # Calculate impact projection
            impact_projection = await self._project_pricing_impact(
                menu_item, optimal_price, optimization_goal
            )
            
            return {
                'menu_item': {
                    'id': str(menu_item.id),
                    'name': menu_item.name,
                    'current_price': menu_item.price,
                    'category': menu_item.category
                },
                'optimization_goal': optimization_goal,
                'recommended_price': optimal_price,
                'price_change': {
                    'absolute': round(optimal_price - menu_item.price, 2),
                    'percentage': round((optimal_price - menu_item.price) / menu_item.price * 100, 1)
                },
                'market_context': {
                    'similar_items_analyzed': len(similar_items),
                    'market_price_range': {
                        'min': min(item['price'] for item in similar_items) if similar_items else menu_item.price,
                        'max': max(item['price'] for item in similar_items) if similar_items else menu_item.price,
                        'average': sum(item['price'] for item in similar_items) / len(similar_items) if similar_items else menu_item.price
                    }
                },
                'impact_projection': impact_projection,
                'confidence_level': random.uniform(0.75, 0.95)  # Simulated confidence
            }
            
        except Exception as e:
            raise Exception(f"Price optimization failed: {str(e)}")
    
    async def optimize_menu_pricing(
        self,
        restaurant_id: uuid.UUID,
        category: Optional[str] = None,
        optimization_goal: str = "revenue"
    ) -> Dict[str, Any]:
        """
        Optimize pricing for entire menu or category
        """
        try:
            # Get menu items
            menu_query = select(MenuItem).where(MenuItem.restaurant_id == restaurant_id)
            
            if category:
                menu_query = menu_query.where(MenuItem.category.ilike(f"%{category}%"))
            
            menu_result = await self.db.execute(menu_query)
            menu_items = menu_result.scalars().all()
            
            if not menu_items:
                raise Exception("No menu items found")
            
            # Optimize each item
            optimizations = []
            total_current_revenue = 0
            total_projected_revenue = 0
            
            for item in menu_items:
                item_optimization = await self.optimize_item_pricing(
                    menu_item_id=item.id,
                    optimization_goal=optimization_goal
                )
                optimizations.append(item_optimization)
                
                # Accumulate revenue projections
                current_revenue = item.price * (item.order_frequency or 10)  # Estimated
                projected_revenue = item_optimization['recommended_price'] * (item.order_frequency or 10)
                
                total_current_revenue += current_revenue
                total_projected_revenue += projected_revenue
            
            # Calculate overall impact
            revenue_impact = {
                'current_estimated_revenue': round(total_current_revenue, 2),
                'projected_revenue': round(total_projected_revenue, 2),
                'revenue_change': round(total_projected_revenue - total_current_revenue, 2),
                'revenue_change_percentage': round((total_projected_revenue - total_current_revenue) / total_current_revenue * 100, 1) if total_current_revenue > 0 else 0
            }
            
            return {
                'restaurant_id': str(restaurant_id),
                'category': category,
                'optimization_goal': optimization_goal,
                'items_optimized': len(optimizations),
                'item_optimizations': optimizations,
                'overall_impact': revenue_impact,
                'implementation_priority': self._prioritize_price_changes(optimizations)
            }
            
        except Exception as e:
            raise Exception(f"Menu pricing optimization failed: {str(e)}")
    
    async def analyze_menu_trends(
        self,
        location: Optional[str] = None,
        cuisine_type: Optional[str] = None,
        time_period: str = "month",
        trend_type: str = "popularity",
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Analyze menu trends and popular items
        """
        try:
            # Build query for menu items
            query = select(MenuItem).join(Restaurant)
            
            # Apply filters
            filters = [Restaurant.is_active == True]
            
            if location:
                filters.append(
                    or_(
                        Restaurant.city.ilike(f"%{location}%"),
                        Restaurant.area.ilike(f"%{location}%")
                    )
                )
            
            if cuisine_type:
                filters.append(Restaurant.cuisine_types.any(cuisine_type))
            
            query = query.where(and_(*filters))
            
            # Order by trend type
            if trend_type == "popularity":
                query = query.order_by(MenuItem.popularity_score.desc())
            elif trend_type == "pricing":
                query = query.order_by(MenuItem.price.desc())
            else:  # new_items
                query = query.order_by(MenuItem.created_at.desc())
            
            query = query.limit(limit)
            
            # Execute query
            result = await self.db.execute(query)
            trending_items = result.scalars().all()
            
            # Format trending items
            trends = []
            for item in trending_items:
                # Get restaurant info
                restaurant_query = select(Restaurant).where(Restaurant.id == item.restaurant_id)
                restaurant_result = await self.db.execute(restaurant_query)
                restaurant = restaurant_result.scalar_one_or_none()
                
                trend_data = {
                    'item_id': str(item.id),
                    'name': item.name,
                    'category': item.category,
                    'price': item.price,
                    'popularity_score': item.popularity_score,
                    'restaurant': {
                        'name': restaurant.name if restaurant else None,
                        'brand': restaurant.brand if restaurant else None,
                        'cuisine_types': restaurant.cuisine_types if restaurant else [],
                        'city': restaurant.city if restaurant else None
                    },
                    'trend_metrics': {
                        'growth_rate': random.uniform(-20, 50),  # Simulated growth
                        'market_penetration': random.uniform(5, 95),
                        'seasonal_factor': random.uniform(0.8, 1.2)
                    }
                }
                
                if trend_type == "new_items":
                    trend_data['days_since_launch'] = (datetime.utcnow() - item.created_at).days
                
                trends.append(trend_data)
            
            # Calculate trend insights
            insights = self._generate_trend_insights(trends, trend_type)
            
            return {
                'filters': {
                    'location': location,
                    'cuisine_type': cuisine_type,
                    'time_period': time_period,
                    'trend_type': trend_type
                },
                'trending_items': trends,
                'trend_insights': insights,
                'market_summary': {
                    'total_items_analyzed': len(trends),
                    'average_price': round(sum(item['price'] for item in trends) / len(trends), 2) if trends else 0,
                    'top_categories': self._get_top_categories(trends)
                }
            }
            
        except Exception as e:
            raise Exception(f"Menu trends analysis failed: {str(e)}")
    
    async def identify_menu_gaps(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 3.0,
        target_cuisine: Optional[str] = None,
        price_range: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Identify menu gaps and opportunities in market area
        """
        try:
            # Get all restaurants and filter by distance
            restaurants_query = select(Restaurant).where(Restaurant.is_active == True)
            
            if target_cuisine:
                restaurants_query = restaurants_query.where(
                    Restaurant.cuisine_types.any(target_cuisine)
                )
            
            restaurants_result = await self.db.execute(restaurants_query)
            all_restaurants = restaurants_result.scalars().all()
            
            # Filter by distance
            restaurants = []
            for restaurant in all_restaurants:
                distance = self.calculate_distance(latitude, longitude, restaurant.latitude, restaurant.longitude)
                if distance <= radius_km:
                    restaurants.append(restaurant)
            
            # Get menu items from these restaurants
            restaurant_ids = [r.id for r in restaurants]
            menu_query = select(MenuItem).where(MenuItem.restaurant_id.in_(restaurant_ids))
            
            if price_range:
                price_filters = self._get_price_range_filter(price_range)
                menu_query = menu_query.where(
                    and_(
                        MenuItem.price >= price_filters['min'],
                        MenuItem.price <= price_filters['max']
                    )
                )
            
            menu_result = await self.db.execute(menu_query)
            menu_items = menu_result.scalars().all()
            
            # Analyze menu categories and items
            category_analysis = self._analyze_category_gaps(menu_items)
            item_analysis = self._analyze_item_gaps(menu_items)
            
            # Generate opportunity scores
            opportunities = []
            
            # Category opportunities
            for gap in category_analysis['underserved_categories']:
                opportunities.append({
                    'type': 'category_gap',
                    'category': gap['category'],
                    'opportunity_score': gap['opportunity_score'],
                    'description': f"Underserved {gap['category']} category with {gap['gap_size']} item deficit",
                    'estimated_investment': random.randint(5000, 25000),
                    'risk_level': 'low' if gap['opportunity_score'] > 70 else 'medium'
                })
            
            # Specific item opportunities
            for gap in item_analysis['missing_popular_items']:
                opportunities.append({
                    'type': 'item_gap',
                    'item_name': gap['item_name'],
                    'category': gap['category'],
                    'opportunity_score': gap['opportunity_score'],
                    'description': f"Popular {gap['item_name']} missing from local market",
                    'estimated_price_point': gap['suggested_price'],
                    'risk_level': 'low'
                })
            
            # Sort by opportunity score
            opportunities.sort(key=lambda x: x['opportunity_score'], reverse=True)
            
            return {
                'location': {
                    'latitude': latitude,
                    'longitude': longitude,
                    'radius_km': radius_km
                },
                'market_analysis': {
                    'restaurants_analyzed': len(restaurants),
                    'menu_items_analyzed': len(menu_items),
                    'target_cuisine': target_cuisine,
                    'price_range': price_range
                },
                'category_analysis': category_analysis,
                'item_analysis': item_analysis,
                'opportunities': opportunities[:10],  # Top 10 opportunities
                'market_saturation': self._calculate_market_saturation(menu_items, radius_km)
            }
            
        except Exception as e:
            raise Exception(f"Menu gap analysis failed: {str(e)}")
    
    async def compare_item_prices(
        self,
        item_name: str,
        location: Optional[str] = None,
        cuisine_type: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Compare prices for a specific menu item across restaurants
        """
        try:
            # Build query for menu items
            query = select(MenuItem).join(Restaurant).where(
                and_(
                    Restaurant.is_active == True,
                    MenuItem.name.ilike(f"%{item_name}%")
                )
            )
            
            # Apply location filters
            if location:
                query = query.where(
                    or_(
                        Restaurant.city.ilike(f"%{location}%"),
                        Restaurant.area.ilike(f"%{location}%")
                    )
                )
            
            if cuisine_type:
                query = query.where(Restaurant.cuisine_types.any(cuisine_type))
            
            # Execute query
            result = await self.db.execute(query)
            all_items = result.scalars().all()
            
            # Apply geographic filter if specified
            if latitude and longitude and radius_km:
                items = []
                for item in all_items:
                    # Get restaurant for this item
                    restaurant_query = select(Restaurant).where(Restaurant.id == item.restaurant_id)
                    restaurant_result = await self.db.execute(restaurant_query)
                    restaurant = restaurant_result.scalar_one_or_none()
                    
                    if restaurant:
                        distance = self.calculate_distance(latitude, longitude, restaurant.latitude, restaurant.longitude)
                        if distance <= radius_km:
                            items.append(item)
            else:
                items = all_items
            
            if not items:
                return {
                    'item_name': item_name,
                    'items_found': 0,
                    'message': 'No matching items found'
                }
            
            # Get restaurant info for each item
            price_comparison = []
            for item in items:
                restaurant_query = select(Restaurant).where(Restaurant.id == item.restaurant_id)
                restaurant_result = await self.db.execute(restaurant_query)
                restaurant = restaurant_result.scalar_one_or_none()
                
                price_comparison.append({
                    'item_id': str(item.id),
                    'item_name': item.name,
                    'price': item.price,
                    'currency': item.currency,
                    'category': item.category,
                    'restaurant': {
                        'id': str(restaurant.id),
                        'name': restaurant.name,
                        'brand': restaurant.brand,
                        'cuisine_types': restaurant.cuisine_types,
                        'city': restaurant.city,
                        'average_rating': restaurant.average_rating
                    } if restaurant else None,
                    'value_indicators': {
                        'popularity_score': item.popularity_score,
                        'is_vegetarian': item.is_vegetarian,
                        'is_vegan': item.is_vegan,
                        'calories': item.calories
                    }
                })
            
            # Calculate price statistics
            prices = [item['price'] for item in price_comparison]
            price_stats = {
                'min_price': min(prices),
                'max_price': max(prices),
                'average_price': round(sum(prices) / len(prices), 2),
                'median_price': sorted(prices)[len(prices) // 2],
                'price_range': max(prices) - min(prices),
                'standard_deviation': round((sum((p - sum(prices) / len(prices)) ** 2 for p in prices) / len(prices)) ** 0.5, 2)
            }
            
            # Identify best value options
            best_value = self._identify_best_value_options(price_comparison)
            
            return {
                'item_name': item_name,
                'items_found': len(price_comparison),
                'price_comparison': price_comparison,
                'price_statistics': price_stats,
                'best_value_options': best_value,
                'market_insights': {
                    'price_competitiveness': 'high' if price_stats['price_range'] > price_stats['average_price'] * 0.5 else 'moderate',
                    'market_maturity': 'mature' if len(price_comparison) > 10 else 'developing',
                    'pricing_strategy_recommendation': self._recommend_pricing_strategy(price_stats)
                }
            }
            
        except Exception as e:
            raise Exception(f"Price comparison failed: {str(e)}")
    
    # Helper methods
    async def _analyze_pricing_competitiveness(self, menu_items: List[MenuItem], competitor_items: List[MenuItem]) -> Dict[str, Any]:
        """Analyze pricing competitiveness"""
        if not menu_items or not competitor_items:
            return {'message': 'Insufficient data for pricing analysis'}
        
        # Group items by category
        menu_by_category = {}
        competitor_by_category = {}
        
        for item in menu_items:
            if item.category not in menu_by_category:
                menu_by_category[item.category] = []
            menu_by_category[item.category].append(item.price)
        
        for item in competitor_items:
            if item.category not in competitor_by_category:
                competitor_by_category[item.category] = []
            competitor_by_category[item.category].append(item.price)
        
        # Compare pricing by category
        category_comparison = {}
        for category in menu_by_category:
            if category in competitor_by_category:
                menu_avg = sum(menu_by_category[category]) / len(menu_by_category[category])
                competitor_avg = sum(competitor_by_category[category]) / len(competitor_by_category[category])
                
                category_comparison[category] = {
                    'menu_average_price': round(menu_avg, 2),
                    'competitor_average_price': round(competitor_avg, 2),
                    'price_difference': round(menu_avg - competitor_avg, 2),
                    'price_position': 'premium' if menu_avg > competitor_avg * 1.1 else 'discount' if menu_avg < competitor_avg * 0.9 else 'competitive'
                }
        
        return {
            'category_comparison': category_comparison,
            'overall_position': self._determine_overall_price_position(category_comparison)
        }
    
    async def _analyze_menu_trends(self, menu_items: List[MenuItem], competitor_items: List[MenuItem]) -> Dict[str, Any]:
        """Analyze menu trends"""
        # Simulate trend analysis
        trending_categories = ['appetizers', 'healthy options', 'plant-based', 'comfort food']
        
        return {
            'trending_categories': trending_categories,
            'emerging_items': ['cauliflower wings', 'impossible burger', 'acai bowl'],
            'declining_items': ['traditional salads', 'basic sandwiches'],
            'seasonal_opportunities': ['summer: cold soups', 'winter: hearty stews']
        }
    
    async def _identify_menu_gaps(self, menu_items: List[MenuItem], competitor_items: List[MenuItem]) -> Dict[str, Any]:
        """Identify menu gaps"""
        # Get categories from competitor menus that are missing from restaurant menu
        menu_categories = set(item.category for item in menu_items)
        competitor_categories = set(item.category for item in competitor_items)
        
        missing_categories = competitor_categories - menu_categories
        
        return {
            'missing_categories': list(missing_categories),
            'underrepresented_categories': [],  # Would implement logic to find underrepresented categories
            'opportunity_score': len(missing_categories) * 10  # Simple scoring
        }
    
    async def _analyze_competitive_positioning(self, restaurant: Restaurant, menu_items: List[MenuItem], competitors: List[Restaurant], competitor_items: List[MenuItem]) -> Dict[str, Any]:
        """Analyze competitive positioning"""
        return {
            'market_position': 'mid-market',  # Simulated
            'differentiation_factors': ['unique cuisine', 'premium ingredients'],
            'competitive_advantages': ['location', 'brand recognition'],
            'areas_for_improvement': ['menu variety', 'pricing strategy']
        }
    
    def _generate_trend_insights(self, trends: List[Dict], trend_type: str) -> List[str]:
        """Generate insights from trend analysis"""
        insights = []
        
        if trend_type == "popularity":
            insights.append("Plant-based options showing strong growth")
            insights.append("Comfort food categories gaining popularity")
        elif trend_type == "pricing":
            insights.append("Premium pricing trend in healthy food categories")
            insights.append("Value pricing competitive in fast-casual segment")
        
        return insights
    
    def _get_top_categories(self, trends: List[Dict]) -> List[Dict]:
        """Get top categories from trends"""
        category_counts = {}
        for trend in trends:
            category = trend['category']
            category_counts[category] = category_counts.get(category, 0) + 1
        
        return [
            {'category': cat, 'count': count}
            for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
    
    def _get_price_range_filter(self, price_range: str) -> Dict[str, float]:
        """Convert price range string to min/max values"""
        ranges = {
            '$': {'min': 0, 'max': 15},
            '$$': {'min': 15, 'max': 30},
            '$$$': {'min': 30, 'max': 60},
            '$$$$': {'min': 60, 'max': 1000}
        }
        return ranges.get(price_range, {'min': 0, 'max': 1000})
    
    def _analyze_category_gaps(self, menu_items: List[MenuItem]) -> Dict[str, Any]:
        """Analyze category gaps in the market"""
        # Simulate category gap analysis
        return {
            'underserved_categories': [
                {'category': 'healthy bowls', 'opportunity_score': 85, 'gap_size': 5},
                {'category': 'plant-based', 'opportunity_score': 78, 'gap_size': 3}
            ]
        }
    
    def _analyze_item_gaps(self, menu_items: List[MenuItem]) -> Dict[str, Any]:
        """Analyze specific item gaps"""
        # Simulate item gap analysis
        return {
            'missing_popular_items': [
                {'item_name': 'Impossible Burger', 'category': 'burgers', 'opportunity_score': 82, 'suggested_price': 16.99},
                {'item_name': 'Acai Bowl', 'category': 'healthy', 'opportunity_score': 75, 'suggested_price': 12.99}
            ]
        }
    
    def _calculate_market_saturation(self, menu_items: List[MenuItem], radius_km: float) -> str:
        """Calculate market saturation level"""
        items_per_km2 = len(menu_items) / (3.14159 * radius_km ** 2)
        
        if items_per_km2 > 100:
            return 'high'
        elif items_per_km2 > 50:
            return 'medium'
        else:
            return 'low'
    
    def _identify_best_value_options(self, price_comparison: List[Dict]) -> List[Dict]:
        """Identify best value options from price comparison"""
        # Simple best value calculation based on price and rating
        best_value = []
        
        for item in price_comparison:
            if item['restaurant'] and item['restaurant']['average_rating']:
                value_score = item['restaurant']['average_rating'] / item['price'] * 10
                item['value_score'] = round(value_score, 2)
        
        # Sort by value score and return top 3
        sorted_items = sorted(
            [item for item in price_comparison if 'value_score' in item],
            key=lambda x: x['value_score'],
            reverse=True
        )
        
        return sorted_items[:3]
    
    def _recommend_pricing_strategy(self, price_stats: Dict) -> str:
        """Recommend pricing strategy based on market analysis"""
        if price_stats['standard_deviation'] > price_stats['average_price'] * 0.3:
            return "Market has high price variance - opportunity for value positioning"
        elif price_stats['max_price'] > price_stats['average_price'] * 1.5:
            return "Premium pricing opportunity exists in market"
        else:
            return "Competitive pricing strategy recommended"
    
    def _determine_overall_price_position(self, category_comparison: Dict) -> str:
        """Determine overall price position"""
        premium_count = sum(1 for comp in category_comparison.values() if comp['price_position'] == 'premium')
        total_categories = len(category_comparison)
        
        if premium_count > total_categories * 0.6:
            return 'premium'
        elif premium_count < total_categories * 0.3:
            return 'value'
        else:
            return 'competitive'
    
    async def _find_similar_menu_items(self, menu_item: MenuItem, restaurant: Restaurant) -> List[Dict]:
        """Find similar menu items in the market"""
        # Simulate finding similar items
        return [
            {'name': 'Similar Item 1', 'price': menu_item.price * random.uniform(0.8, 1.2), 'restaurant': 'Competitor A'},
            {'name': 'Similar Item 2', 'price': menu_item.price * random.uniform(0.8, 1.2), 'restaurant': 'Competitor B'}
        ]
    
    async def _optimize_for_revenue(self, menu_item: MenuItem, similar_items: List[Dict]) -> float:
        """Optimize price for maximum revenue"""
        if similar_items:
            market_avg = sum(item['price'] for item in similar_items) / len(similar_items)
            return round(market_avg * 1.05, 2)  # Slightly above market average
        return menu_item.price * 1.1
    
    async def _optimize_for_profit(self, menu_item: MenuItem, similar_items: List[Dict]) -> float:
        """Optimize price for maximum profit"""
        # Assume 30% cost margin
        cost = menu_item.price * 0.3
        if similar_items:
            market_avg = sum(item['price'] for item in similar_items) / len(similar_items)
            return max(cost * 2.5, market_avg * 0.95)  # Ensure profit margin while staying competitive
        return menu_item.price * 1.15
    
    async def _optimize_for_volume(self, menu_item: MenuItem, similar_items: List[Dict]) -> float:
        """Optimize price for maximum volume"""
        if similar_items:
            market_min = min(item['price'] for item in similar_items)
            return round(market_min * 0.95, 2)  # Slightly below market minimum
        return menu_item.price * 0.9
    
    async def _project_pricing_impact(self, menu_item: MenuItem, optimal_price: float, optimization_goal: str) -> Dict[str, Any]:
        """Project impact of price change"""
        price_change_pct = (optimal_price - menu_item.price) / menu_item.price
        
        # Simulate demand elasticity
        if optimization_goal == "volume":
            volume_change = -price_change_pct * 1.5  # Higher elasticity for volume optimization
        else:
            volume_change = -price_change_pct * 0.8  # Lower elasticity
        
        current_volume = menu_item.order_frequency or 10
        new_volume = current_volume * (1 + volume_change)
        
        return {
            'volume_change_percentage': round(volume_change * 100, 1),
            'estimated_new_volume': round(new_volume, 0),
            'revenue_change_percentage': round((optimal_price * new_volume - menu_item.price * current_volume) / (menu_item.price * current_volume) * 100, 1),
            'break_even_volume': round(menu_item.price * current_volume / optimal_price, 0)
        }
    
    def _prioritize_price_changes(self, optimizations: List[Dict]) -> List[Dict]:
        """Prioritize price changes by impact and feasibility"""
        # Sort by revenue impact
        sorted_optimizations = sorted(
            optimizations,
            key=lambda x: abs(x.get('price_change', {}).get('percentage', 0)),
            reverse=True
        )
        
        priorities = []
        for i, opt in enumerate(sorted_optimizations[:5]):  # Top 5 priorities
            priorities.append({
                'rank': i + 1,
                'item_name': opt['menu_item']['name'],
                'priority_level': 'high' if i < 2 else 'medium',
                'reason': f"High impact price change of {opt.get('price_change', {}).get('percentage', 0)}%"
            })
        
        return priorities