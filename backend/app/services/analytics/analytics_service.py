"""
BiteBase Intelligence Analytics Service
Business intelligence and performance analytics
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
# from geoalchemy2.functions import ST_DWithin, ST_GeogFromText  # Disabled for SQLite
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import random
import math

from app.models.restaurant import Restaurant, RestaurantAnalytics, MenuItem, RestaurantReview


class AnalyticsService:
    """Service for business intelligence and analytics"""
    
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
    
    async def get_restaurant_dashboard(
        self,
        restaurant_id: uuid.UUID,
        time_period: str = "month",
        include_predictions: bool = True
    ) -> Dict[str, Any]:
        """
        Get comprehensive dashboard data for a restaurant
        """
        try:
            # Get restaurant info
            restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
            restaurant_result = await self.db.execute(restaurant_query)
            restaurant = restaurant_result.scalar_one_or_none()
            
            if not restaurant:
                raise Exception("Restaurant not found")
            
            # Calculate date range
            end_date = datetime.utcnow()
            if time_period == "week":
                start_date = end_date - timedelta(days=7)
            elif time_period == "quarter":
                start_date = end_date - timedelta(days=90)
            elif time_period == "year":
                start_date = end_date - timedelta(days=365)
            else:  # month
                start_date = end_date - timedelta(days=30)
            
            # Get performance metrics
            performance_metrics = await self._get_restaurant_performance_metrics(
                restaurant_id, start_date, end_date
            )
            
            # Get menu performance
            menu_performance = await self._get_menu_performance(restaurant_id)
            
            # Get review analytics
            review_analytics = await self._get_review_analytics(restaurant_id, start_date, end_date)
            
            # Get competitive position
            competitive_position = await self._get_competitive_position(restaurant)
            
            dashboard_data = {
                'restaurant_info': {
                    'id': str(restaurant.id),
                    'name': restaurant.name,
                    'brand': restaurant.brand,
                    'cuisine_types': restaurant.cuisine_types,
                    'category': restaurant.category,
                    'average_rating': restaurant.average_rating,
                    'total_reviews': restaurant.total_reviews
                },
                'time_period': {
                    'period': time_period,
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'performance_metrics': performance_metrics,
                'menu_performance': menu_performance,
                'review_analytics': review_analytics,
                'competitive_position': competitive_position
            }
            
            if include_predictions:
                predictions = await self._generate_restaurant_predictions(restaurant_id)
                dashboard_data['predictions'] = predictions
            
            return dashboard_data
            
        except Exception as e:
            raise Exception(f"Restaurant dashboard generation failed: {str(e)}")
    
    async def get_market_dashboard(
        self,
        location: Optional[str] = None,
        time_period: str = "month",
        include_predictions: bool = True
    ) -> Dict[str, Any]:
        """
        Get market-level dashboard data
        """
        try:
            # Build query for restaurants in location
            query = select(Restaurant).where(Restaurant.is_active == True)
            
            if location:
                query = query.where(
                    or_(
                        Restaurant.city.ilike(f"%{location}%"),
                        Restaurant.area.ilike(f"%{location}%")
                    )
                )
            
            # Execute query
            result = await self.db.execute(query)
            restaurants = result.scalars().all()
            
            # Calculate market metrics
            market_metrics = await self._calculate_market_metrics(restaurants, time_period)
            
            # Get cuisine distribution
            cuisine_distribution = await self._get_cuisine_distribution(restaurants)
            
            # Get category performance
            category_performance = await self._get_category_performance(restaurants)
            
            # Get market trends
            market_trends = await self._get_market_trends(location, time_period)
            
            dashboard_data = {
                'market_info': {
                    'location': location,
                    'total_restaurants': len(restaurants),
                    'time_period': time_period
                },
                'market_metrics': market_metrics,
                'cuisine_distribution': cuisine_distribution,
                'category_performance': category_performance,
                'market_trends': market_trends
            }
            
            if include_predictions:
                market_predictions = await self._generate_market_predictions(location)
                dashboard_data['predictions'] = market_predictions
            
            return dashboard_data
            
        except Exception as e:
            raise Exception(f"Market dashboard generation failed: {str(e)}")
    
    async def get_performance_metrics(
        self,
        restaurant_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
        metrics: List[str],
        compare_to: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get detailed performance metrics for a restaurant
        """
        try:
            # Get restaurant
            restaurant_query = select(Restaurant).where(Restaurant.id == restaurant_id)
            restaurant_result = await self.db.execute(restaurant_query)
            restaurant = restaurant_result.scalar_one_or_none()
            
            if not restaurant:
                raise Exception("Restaurant not found")
            
            performance_data = {}
            
            # Calculate requested metrics
            for metric in metrics:
                if metric == "revenue":
                    performance_data["revenue"] = await self._calculate_revenue_metrics(
                        restaurant_id, start_date, end_date
                    )
                elif metric == "customers":
                    performance_data["customers"] = await self._calculate_customer_metrics(
                        restaurant_id, start_date, end_date
                    )
                elif metric == "rating":
                    performance_data["rating"] = await self._calculate_rating_metrics(
                        restaurant_id, start_date, end_date
                    )
            
            # Add comparison data if requested
            if compare_to:
                comparison_data = await self._get_comparison_data(
                    restaurant, metrics, start_date, end_date, compare_to
                )
                performance_data["comparison"] = comparison_data
            
            return performance_data
            
        except Exception as e:
            raise Exception(f"Performance metrics calculation failed: {str(e)}")
    
    async def analyze_market(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 5.0,
        cuisine_type: Optional[str] = None,
        analysis_depth: str = "standard"
    ) -> Dict[str, Any]:
        """
        Comprehensive market analysis for a geographic area
        """
        try:
            # Get all restaurants and filter by distance
            query = select(Restaurant).where(Restaurant.is_active == True)
            
            if cuisine_type:
                query = query.where(Restaurant.cuisine_types.any(cuisine_type))
            
            result = await self.db.execute(query)
            all_restaurants = result.scalars().all()
            
            # Filter by distance
            restaurants = []
            for restaurant in all_restaurants:
                distance = self.calculate_distance(latitude, longitude, restaurant.latitude, restaurant.longitude)
                if distance <= radius_km:
                    restaurants.append(restaurant)
            
            # Basic analysis
            basic_analysis = {
                'total_restaurants': len(restaurants),
                'market_density': len(restaurants) / (3.14159 * radius_km ** 2),
                'cuisine_diversity': len(set(cuisine for r in restaurants for cuisine in r.cuisine_types)),
                'average_rating': sum(r.average_rating or 0 for r in restaurants) / len(restaurants) if restaurants else 0
            }
            
            analysis_result = {
                'location': {'latitude': latitude, 'longitude': longitude, 'radius_km': radius_km},
                'basic_analysis': basic_analysis
            }
            
            if analysis_depth in ["standard", "comprehensive"]:
                # Add competitive analysis
                competitive_analysis = await self._analyze_market_competition(restaurants)
                analysis_result['competitive_analysis'] = competitive_analysis
                
                # Add pricing analysis
                pricing_analysis = await self._analyze_market_pricing(restaurants)
                analysis_result['pricing_analysis'] = pricing_analysis
            
            if analysis_depth == "comprehensive":
                # Add trend analysis
                trend_analysis = await self._analyze_market_trends_detailed(restaurants)
                analysis_result['trend_analysis'] = trend_analysis
                
                # Add opportunity analysis
                opportunity_analysis = await self._analyze_market_opportunities(restaurants, latitude, longitude)
                analysis_result['opportunity_analysis'] = opportunity_analysis
            
            return analysis_result
            
        except Exception as e:
            raise Exception(f"Market analysis failed: {str(e)}")
    
    # Helper methods (simplified implementations for MVP)
    
    async def _get_restaurant_performance_metrics(self, restaurant_id: uuid.UUID, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get performance metrics for a restaurant"""
        # Simulate performance metrics
        return {
            'revenue': {
                'current': random.uniform(50000, 200000),
                'previous': random.uniform(45000, 180000),
                'growth_rate': random.uniform(-10, 25)
            },
            'customers': {
                'current': random.randint(1000, 5000),
                'previous': random.randint(900, 4500),
                'growth_rate': random.uniform(-5, 20)
            },
            'average_order_value': {
                'current': random.uniform(25, 75),
                'previous': random.uniform(23, 70),
                'growth_rate': random.uniform(-5, 15)
            }
        }
    
    async def _get_menu_performance(self, restaurant_id: uuid.UUID) -> Dict[str, Any]:
        """Get menu performance metrics"""
        # Get menu items
        menu_query = select(MenuItem).where(MenuItem.restaurant_id == restaurant_id)
        menu_result = await self.db.execute(menu_query)
        menu_items = menu_result.scalars().all()
        
        if not menu_items:
            return {'message': 'No menu items found'}
        
        # Calculate menu metrics
        total_items = len(menu_items)
        avg_price = sum(item.price for item in menu_items) / total_items
        
        # Get top performing items
        top_items = sorted(menu_items, key=lambda x: x.popularity_score or 0, reverse=True)[:5]
        
        return {
            'total_items': total_items,
            'average_price': round(avg_price, 2),
            'top_performing_items': [
                {
                    'name': item.name,
                    'category': item.category,
                    'price': item.price,
                    'popularity_score': item.popularity_score
                }
                for item in top_items
            ]
        }
    
    async def _get_review_analytics(self, restaurant_id: uuid.UUID, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get review analytics"""
        # Get reviews in date range
        reviews_query = select(RestaurantReview).where(
            and_(
                RestaurantReview.restaurant_id == restaurant_id,
                RestaurantReview.review_date >= start_date,
                RestaurantReview.review_date <= end_date
            )
        )
        
        reviews_result = await self.db.execute(reviews_query)
        reviews = reviews_result.scalars().all()
        
        if not reviews:
            return {'message': 'No reviews found in date range'}
        
        # Calculate review metrics
        total_reviews = len(reviews)
        avg_rating = sum(review.rating for review in reviews) / total_reviews
        avg_sentiment = sum(review.sentiment_score or 0 for review in reviews) / total_reviews
        
        # Rating distribution
        rating_distribution = {}
        for i in range(1, 6):
            rating_distribution[str(i)] = len([r for r in reviews if int(r.rating) == i])
        
        return {
            'total_reviews': total_reviews,
            'average_rating': round(avg_rating, 2),
            'average_sentiment': round(avg_sentiment, 3),
            'rating_distribution': rating_distribution,
            'review_sources': list(set(review.source_platform for review in reviews))
        }
    
    async def _get_competitive_position(self, restaurant: Restaurant) -> Dict[str, Any]:
        """Get competitive position analysis"""
        # Simulate competitive position
        return {
            'market_rank': random.randint(1, 20),
            'rating_rank': random.randint(1, 15),
            'price_position': random.choice(['premium', 'competitive', 'value']),
            'unique_selling_points': ['location', 'cuisine quality', 'service'],
            'competitive_threats': random.randint(3, 12)
        }
    
    async def _generate_restaurant_predictions(self, restaurant_id: uuid.UUID) -> Dict[str, Any]:
        """Generate predictions for restaurant"""
        # Simulate predictions
        return {
            'revenue_forecast': {
                'next_month': random.uniform(60000, 180000),
                'confidence': random.uniform(0.75, 0.95),
                'trend': random.choice(['increasing', 'stable', 'decreasing'])
            },
            'customer_forecast': {
                'next_month': random.randint(1200, 4500),
                'confidence': random.uniform(0.70, 0.90),
                'trend': random.choice(['increasing', 'stable', 'decreasing'])
            }
        }
    
    async def _calculate_market_metrics(self, restaurants: List[Restaurant], time_period: str) -> Dict[str, Any]:
        """Calculate market-level metrics"""
        if not restaurants:
            return {'message': 'No restaurants found'}
        
        total_restaurants = len(restaurants)
        avg_rating = sum(r.average_rating or 0 for r in restaurants) / total_restaurants
        total_reviews = sum(r.total_reviews or 0 for r in restaurants)
        
        return {
            'total_restaurants': total_restaurants,
            'average_market_rating': round(avg_rating, 2),
            'total_market_reviews': total_reviews,
            'market_growth_rate': random.uniform(-5, 15),  # Simulated
            'new_openings': random.randint(0, 5),  # Simulated
            'closures': random.randint(0, 3)  # Simulated
        }
    
    async def _get_cuisine_distribution(self, restaurants: List[Restaurant]) -> Dict[str, Any]:
        """Get cuisine distribution in market"""
        cuisine_counts = {}
        for restaurant in restaurants:
            for cuisine in restaurant.cuisine_types:
                cuisine_counts[cuisine] = cuisine_counts.get(cuisine, 0) + 1
        
        total = sum(cuisine_counts.values())
        cuisine_percentages = {
            cuisine: round(count / total * 100, 1)
            for cuisine, count in cuisine_counts.items()
        }
        
        return {
            'cuisine_counts': cuisine_counts,
            'cuisine_percentages': cuisine_percentages,
            'diversity_index': len(cuisine_counts)
        }
    
    async def _get_category_performance(self, restaurants: List[Restaurant]) -> Dict[str, Any]:
        """Get category performance metrics"""
        category_counts = {}
        category_ratings = {}
        
        for restaurant in restaurants:
            category = restaurant.category
            category_counts[category] = category_counts.get(category, 0) + 1
            
            if category not in category_ratings:
                category_ratings[category] = []
            if restaurant.average_rating:
                category_ratings[category].append(restaurant.average_rating)
        
        # Calculate average ratings by category
        category_avg_ratings = {}
        for category, ratings in category_ratings.items():
            if ratings:
                category_avg_ratings[category] = round(sum(ratings) / len(ratings), 2)
        
        return {
            'category_distribution': category_counts,
            'category_average_ratings': category_avg_ratings,
            'top_performing_category': max(category_avg_ratings.items(), key=lambda x: x[1]) if category_avg_ratings else None
        }
    
    async def _get_market_trends(self, location: Optional[str], time_period: str) -> Dict[str, Any]:
        """Get market trends"""
        # Simulate market trends
        return {
            'trending_cuisines': ['plant-based', 'korean', 'mediterranean'],
            'declining_cuisines': ['traditional american', 'basic italian'],
            'growth_categories': ['fast-casual', 'healthy options'],
            'pricing_trends': {
                'average_increase': random.uniform(2, 8),
                'premium_segment_growth': random.uniform(5, 15)
            }
        }
    
    async def _generate_market_predictions(self, location: Optional[str]) -> Dict[str, Any]:
        """Generate market predictions"""
        # Simulate market predictions
        return {
            'market_growth': {
                'next_quarter': random.uniform(2, 12),
                'confidence': random.uniform(0.70, 0.90)
            },
            'new_entrants': {
                'predicted_count': random.randint(2, 8),
                'likely_categories': ['fast-casual', 'ethnic cuisine']
            },
            'market_opportunities': [
                'Underserved healthy food segment',
                'Premium dining gap in area',
                'Late-night dining opportunity'
            ]
        }
    
    # Additional helper methods would be implemented here for comprehensive analytics
    async def _calculate_revenue_metrics(self, restaurant_id: uuid.UUID, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Calculate revenue metrics"""
        # Simulate revenue calculation
        return {
            'total_revenue': random.uniform(50000, 200000),
            'daily_average': random.uniform(1500, 6500),
            'growth_rate': random.uniform(-10, 25),
            'seasonal_factor': random.uniform(0.8, 1.2)
        }
    
    async def _calculate_customer_metrics(self, restaurant_id: uuid.UUID, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Calculate customer metrics"""
        # Simulate customer calculation
        return {
            'total_customers': random.randint(1000, 5000),
            'daily_average': random.randint(30, 150),
            'repeat_customer_rate': random.uniform(0.3, 0.7),
            'customer_acquisition_cost': random.uniform(15, 45)
        }
    
    async def _calculate_rating_metrics(self, restaurant_id: uuid.UUID, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Calculate rating metrics"""
        # Simulate rating calculation
        return {
            'average_rating': random.uniform(3.5, 4.8),
            'rating_trend': random.choice(['improving', 'stable', 'declining']),
            'review_velocity': random.randint(5, 25),
            'sentiment_score': random.uniform(0.6, 0.9)
        }
    
    async def _get_comparison_data(self, restaurant: Restaurant, metrics: List[str], start_date: datetime, end_date: datetime, compare_to: str) -> Dict[str, Any]:
        """Get comparison data"""
        # Simulate comparison data
        return {
            'comparison_type': compare_to,
            'performance_vs_comparison': {
                'revenue': random.uniform(-20, 30),
                'customers': random.uniform(-15, 25),
                'rating': random.uniform(-0.5, 0.8)
            }
        }
    
    async def _analyze_market_competition(self, restaurants: List[Restaurant]) -> Dict[str, Any]:
        """Analyze market competition"""
        # Simulate competitive analysis
        return {
            'competition_intensity': random.choice(['low', 'medium', 'high']),
            'market_leaders': random.sample([r.name for r in restaurants], min(3, len(restaurants))),
            'competitive_gaps': ['premium dining', 'late-night options'],
            'market_concentration': random.uniform(0.2, 0.8)
        }
    
    async def _analyze_market_pricing(self, restaurants: List[Restaurant]) -> Dict[str, Any]:
        """Analyze market pricing"""
        # Simulate pricing analysis
        return {
            'price_range_distribution': {
                '$': random.randint(5, 15),
                '$$': random.randint(10, 25),
                '$$$': random.randint(3, 12),
                '$$$$': random.randint(0, 5)
            },
            'pricing_pressure': random.choice(['low', 'medium', 'high']),
            'premium_opportunity': random.uniform(0.3, 0.8)
        }
    
    async def _analyze_market_trends_detailed(self, restaurants: List[Restaurant]) -> Dict[str, Any]:
        """Detailed market trend analysis"""
        # Simulate detailed trend analysis
        return {
            'growth_trends': {
                'overall_market': random.uniform(-5, 15),
                'by_category': {
                    'fast-casual': random.uniform(5, 20),
                    'fine-dining': random.uniform(-10, 10),
                    'cafe': random.uniform(0, 15)
                }
            },
            'emerging_concepts': ['ghost kitchens', 'plant-based', 'fusion cuisine'],
            'technology_adoption': random.uniform(0.4, 0.9)
        }
    
    async def _analyze_market_opportunities(self, restaurants: List[Restaurant], latitude: float, longitude: float) -> Dict[str, Any]:
        """Analyze market opportunities"""
        # Simulate opportunity analysis
        return {
            'underserved_segments': ['healthy fast-casual', 'ethnic cuisine', 'premium coffee'],
            'location_opportunities': ['high foot traffic areas', 'business districts'],
            'timing_opportunities': ['breakfast segment', 'late-night dining'],
            'investment_attractiveness': random.uniform(0.5, 0.9)
        }
    
    # Additional methods for comprehensive analytics would be implemented here
    async def analyze_trends(self, metric: str, location: Optional[str], cuisine_type: Optional[str], time_period: str, granularity: str, include_forecast: bool) -> Dict[str, Any]:
        """Analyze trends in restaurant data"""
        # Placeholder implementation
        return {'message': 'Trend analysis not yet implemented'}
    
    async def get_competitive_intelligence(self, restaurant_id: uuid.UUID, analysis_radius_km: float, include_benchmarking: bool, include_positioning: bool) -> Dict[str, Any]:
        """Get competitive intelligence"""
        # Placeholder implementation
        return {'message': 'Competitive intelligence not yet implemented'}
    
    async def generate_predictions(self, restaurant_id: uuid.UUID, prediction_type: str, forecast_horizon: int, confidence_level: float, include_factors: bool) -> Dict[str, Any]:
        """Generate predictions"""
        # Placeholder implementation
        return {'message': 'Predictions not yet implemented'}
    
    async def generate_automated_insights(self, restaurant_id: Optional[uuid.UUID], location: Optional[str], insight_types: List[str], time_period: str, min_confidence: float) -> Dict[str, Any]:
        """Generate automated insights"""
        # Placeholder implementation
        return {'message': 'Automated insights not yet implemented'}
    
    async def benchmark_performance(self, restaurant_id: uuid.UUID, benchmark_against: str, metrics: List[str], location_radius_km: Optional[float]) -> Dict[str, Any]:
        """Benchmark performance"""
        # Placeholder implementation
        return {'message': 'Benchmarking not yet implemented'}
    
    async def calculate_restaurant_roi(self, restaurant_id: uuid.UUID, investment_amount: float, time_horizon: int) -> Dict[str, Any]:
        """Calculate restaurant ROI"""
        # Placeholder implementation
        return {'message': 'ROI calculation not yet implemented'}
    
    async def project_location_roi(self, latitude: float, longitude: float, investment_amount: float, time_horizon: int, cuisine_type: Optional[str]) -> Dict[str, Any]:
        """Project location ROI"""
        # Placeholder implementation
        return {'message': 'Location ROI projection not yet implemented'}
    
    async def export_analytics_data(self, restaurant_id: Optional[uuid.UUID], location: Optional[str], data_types: List[str], format: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Export analytics data"""
        # Placeholder implementation
        return {'message': 'Data export not yet implemented'}