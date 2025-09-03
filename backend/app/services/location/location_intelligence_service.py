"""
BiteBase Intelligence Location Intelligence Service
AI-powered location analysis and site selection
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
# from geoalchemy2.functions import ST_DWithin, ST_GeogFromText, ST_Distance  # Disabled for SQLite
from typing import List, Optional, Dict, Any
import math
import random
from datetime import datetime

from app.models.restaurant import Restaurant, LocationAnalysis
from app.core.config import settings
import json


class LocationIntelligenceService:
    """Service for location intelligence and site analysis"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def parse_cuisine_types(self, cuisine_types) -> List[str]:
        """Parse cuisine_types field which might be JSON string or list"""
        if isinstance(cuisine_types, str):
            try:
                return json.loads(cuisine_types)
            except (json.JSONDecodeError, TypeError):
                return [cuisine_types]
        elif isinstance(cuisine_types, list):
            return cuisine_types
        else:
            return []
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points using Haversine formula
        Returns distance in kilometers
        """
        # Convert to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Earth's radius in kilometers
        r = 6371
        
        return c * r
    
    async def analyze_location(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 2.0,
        target_cuisine_types: Optional[List[str]] = None,
        target_category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive location analysis including demographics, competition, and market potential
        """
        try:
            # Calculate individual scores
            demographic_score = await self._analyze_demographics(latitude, longitude, radius_km)
            competition_score = await self._analyze_competition(latitude, longitude, radius_km, target_cuisine_types, target_category)
            accessibility_score = await self._analyze_accessibility(latitude, longitude)
            market_potential_score = await self._analyze_market_potential(latitude, longitude, radius_km, target_cuisine_types)
            
            # Calculate overall location score (weighted average)
            weights = {
                'demographic': 0.3,
                'competition': 0.25,
                'accessibility': 0.2,
                'market_potential': 0.25
            }
            
            overall_score = (
                demographic_score['score'] * weights['demographic'] +
                competition_score['score'] * weights['competition'] +
                accessibility_score['score'] * weights['accessibility'] +
                market_potential_score['score'] * weights['market_potential']
            )
            
            # Generate insights and recommendations
            insights = self._generate_location_insights(
                overall_score, demographic_score, competition_score, 
                accessibility_score, market_potential_score
            )
            
            return {
                'location_score': {
                    'overall_score': round(overall_score, 1),
                    'demographic_score': demographic_score['score'],
                    'competition_score': competition_score['score'],
                    'accessibility_score': accessibility_score['score'],
                    'market_potential_score': market_potential_score['score'],
                    'confidence_level': self._calculate_confidence_level(overall_score)
                },
                'demographic_analysis': demographic_score['details'],
                'competition_analysis': competition_score['details'],
                'accessibility_analysis': accessibility_score['details'],
                'market_analysis': market_potential_score['details'],
                'insights': insights,
                'recommendations': self._generate_recommendations(overall_score, insights),
                'risk_assessment': self._assess_risks(competition_score, market_potential_score),
                'analysis_metadata': {
                    'analysis_date': datetime.utcnow().isoformat(),
                    'radius_km': radius_km,
                    'target_cuisine_types': target_cuisine_types,
                    'target_category': target_category
                }
            }
            
        except Exception as e:
            raise Exception(f"Location analysis failed: {str(e)}")
    
    async def calculate_location_score(
        self,
        latitude: float,
        longitude: float,
        target_cuisine_type: Optional[str] = None,
        target_category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate AI-powered location success score (1-100)
        """
        try:
            # Perform quick analysis for scoring
            analysis = await self.analyze_location(
                latitude=latitude,
                longitude=longitude,
                radius_km=2.0,
                target_cuisine_types=[target_cuisine_type] if target_cuisine_type else None,
                target_category=target_category
            )
            
            return analysis['location_score']
            
        except Exception as e:
            raise Exception(f"Location scoring failed: {str(e)}")
    
    async def get_demographic_data(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 1.0
    ) -> Dict[str, Any]:
        """
        Get demographic data for a location (simulated data for MVP)
        """
        try:
            # In production, this would integrate with census APIs, demographic databases
            # For MVP, we'll simulate realistic demographic data
            
            # Simulate population density based on location (urban vs suburban vs rural)
            base_density = random.uniform(1000, 8000)  # people per km²
            
            # Simulate income distribution
            median_income = random.uniform(35000, 120000)
            
            # Simulate age distribution
            age_distribution = {
                '18-24': random.uniform(8, 15),
                '25-34': random.uniform(15, 25),
                '35-44': random.uniform(12, 20),
                '45-54': random.uniform(10, 18),
                '55-64': random.uniform(8, 15),
                '65+': random.uniform(5, 12)
            }
            
            # Normalize age distribution to 100%
            total_age = sum(age_distribution.values())
            age_distribution = {k: round(v / total_age * 100, 1) for k, v in age_distribution.items()}
            
            return {
                'population_density': round(base_density, 0),
                'estimated_population': round(base_density * math.pi * (radius_km ** 2), 0),
                'median_income': round(median_income, 0),
                'income_distribution': {
                    'low': random.uniform(15, 30),
                    'middle': random.uniform(40, 60),
                    'high': random.uniform(15, 30)
                },
                'age_distribution': age_distribution,
                'household_composition': {
                    'single': random.uniform(25, 40),
                    'couple': random.uniform(20, 35),
                    'family_with_children': random.uniform(25, 40),
                    'other': random.uniform(5, 15)
                },
                'education_level': {
                    'high_school': random.uniform(20, 35),
                    'college': random.uniform(35, 50),
                    'graduate': random.uniform(15, 30)
                }
            }
            
        except Exception as e:
            raise Exception(f"Demographic analysis failed: {str(e)}")
    
    async def analyze_cuisine_gaps(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 3.0
    ) -> Dict[str, Any]:
        """
        Analyze underserved cuisine types in the area
        """
        try:
            # Get all restaurants and filter by distance
            all_restaurants_query = select(Restaurant).where(Restaurant.is_active == True)
            result = await self.db.execute(all_restaurants_query)
            all_restaurants = result.scalars().all()
            
            # Filter by distance
            restaurants = []
            for restaurant in all_restaurants:
                distance = self.calculate_distance(latitude, longitude, restaurant.latitude, restaurant.longitude)
                if distance <= radius_km:
                    restaurants.append(restaurant)
            
            # Count cuisine types
            cuisine_counts = {}
            for restaurant in restaurants:
                restaurant_cuisines = self.parse_cuisine_types(restaurant.cuisine_types)
                for cuisine in restaurant_cuisines:
                    cuisine_counts[cuisine] = cuisine_counts.get(cuisine, 0) + 1
            
            # Define popular cuisine types and their expected market share
            popular_cuisines = {
                'american': 0.20,
                'italian': 0.15,
                'chinese': 0.12,
                'mexican': 0.10,
                'indian': 0.08,
                'japanese': 0.07,
                'thai': 0.05,
                'mediterranean': 0.05,
                'french': 0.04,
                'korean': 0.03,
                'vietnamese': 0.03,
                'greek': 0.02,
                'middle_eastern': 0.02,
                'ethiopian': 0.01,
                'brazilian': 0.01
            }
            
            total_restaurants = len(restaurants)
            underserved_cuisines = []
            
            for cuisine, expected_share in popular_cuisines.items():
                current_count = cuisine_counts.get(cuisine, 0)
                expected_count = total_restaurants * expected_share
                gap = max(0, expected_count - current_count)
                
                if gap >= 1:  # Significant gap
                    opportunity_score = min(100, gap * 20)  # Scale to 0-100
                    
                    underserved_cuisines.append({
                        'cuisine': cuisine,
                        'current_count': current_count,
                        'expected_count': round(expected_count, 1),
                        'gap': round(gap, 1),
                        'opportunity_score': round(opportunity_score, 1),
                        'estimated_investment': random.randint(100000, 300000),
                        'risk_level': 'low' if gap < 2 else 'medium' if gap < 4 else 'high'
                    })
            
            # Sort by opportunity score
            underserved_cuisines.sort(key=lambda x: x['opportunity_score'], reverse=True)
            
            return {
                'total_restaurants_analyzed': total_restaurants,
                'cuisine_distribution': cuisine_counts,
                'underserved_cuisines': underserved_cuisines[:10],  # Top 10 opportunities
                'market_diversity_score': len(cuisine_counts) / len(popular_cuisines) * 100
            }
            
        except Exception as e:
            raise Exception(f"Cuisine gap analysis failed: {str(e)}")
    
    async def analyze_foot_traffic(
        self,
        latitude: float,
        longitude: float,
        radius_m: int = 500,
        time_period: str = "week"
    ) -> Dict[str, Any]:
        """
        Analyze foot traffic patterns (simulated data for MVP)
        """
        try:
            # In production, this would integrate with foot traffic APIs
            # For MVP, simulate realistic foot traffic data
            
            base_traffic = random.randint(1000, 10000)  # Weekly foot traffic
            
            # Simulate hourly patterns
            hourly_pattern = {}
            for hour in range(24):
                if 6 <= hour <= 9:  # Morning rush
                    multiplier = random.uniform(1.2, 1.8)
                elif 11 <= hour <= 14:  # Lunch rush
                    multiplier = random.uniform(1.5, 2.2)
                elif 17 <= hour <= 20:  # Dinner rush
                    multiplier = random.uniform(1.3, 2.0)
                elif 21 <= hour <= 23:  # Evening
                    multiplier = random.uniform(0.8, 1.2)
                else:  # Off-peak
                    multiplier = random.uniform(0.3, 0.7)
                
                hourly_pattern[f"{hour:02d}:00"] = round(base_traffic / 24 * multiplier)
            
            # Simulate daily patterns
            daily_pattern = {
                'monday': round(base_traffic * random.uniform(0.8, 1.0)),
                'tuesday': round(base_traffic * random.uniform(0.8, 1.0)),
                'wednesday': round(base_traffic * random.uniform(0.9, 1.1)),
                'thursday': round(base_traffic * random.uniform(0.9, 1.1)),
                'friday': round(base_traffic * random.uniform(1.1, 1.3)),
                'saturday': round(base_traffic * random.uniform(1.2, 1.5)),
                'sunday': round(base_traffic * random.uniform(1.0, 1.2))
            }
            
            return {
                'time_period': time_period,
                'total_foot_traffic': base_traffic,
                'daily_average': round(base_traffic / 7),
                'peak_hours': ['12:00-14:00', '18:00-20:00'],
                'hourly_pattern': hourly_pattern,
                'daily_pattern': daily_pattern,
                'traffic_density': 'high' if base_traffic > 7000 else 'medium' if base_traffic > 3000 else 'low',
                'seasonal_trends': {
                    'spring': random.uniform(0.9, 1.1),
                    'summer': random.uniform(1.0, 1.2),
                    'fall': random.uniform(0.9, 1.1),
                    'winter': random.uniform(0.8, 1.0)
                }
            }
            
        except Exception as e:
            raise Exception(f"Foot traffic analysis failed: {str(e)}")
    
    async def analyze_accessibility(
        self,
        latitude: float,
        longitude: float,
        transport_modes: List[str] = ["walking", "driving", "transit"]
    ) -> Dict[str, Any]:
        """
        Analyze location accessibility via different transportation modes
        """
        try:
            # Simulate accessibility analysis
            accessibility_data = {}
            
            for mode in transport_modes:
                if mode == "walking":
                    accessibility_data["walking"] = {
                        "walkability_score": random.randint(60, 95),
                        "pedestrian_infrastructure": random.choice(["excellent", "good", "fair", "poor"]),
                        "safety_score": random.randint(70, 95),
                        "nearby_amenities": random.randint(5, 25)
                    }
                elif mode == "driving":
                    accessibility_data["driving"] = {
                        "parking_availability": random.choice(["abundant", "adequate", "limited", "scarce"]),
                        "traffic_congestion": random.choice(["low", "moderate", "high"]),
                        "road_accessibility": random.randint(70, 95),
                        "highway_access": random.choice(["excellent", "good", "fair", "poor"])
                    }
                elif mode == "transit":
                    accessibility_data["transit"] = {
                        "public_transport_score": random.randint(40, 90),
                        "nearest_station_distance_m": random.randint(100, 1000),
                        "service_frequency": random.choice(["high", "medium", "low"]),
                        "route_connectivity": random.randint(60, 95)
                    }
            
            # Calculate overall accessibility score
            scores = []
            if "walking" in accessibility_data:
                scores.append(accessibility_data["walking"]["walkability_score"])
            if "driving" in accessibility_data:
                scores.append(accessibility_data["driving"]["road_accessibility"])
            if "transit" in accessibility_data:
                scores.append(accessibility_data["transit"]["public_transport_score"])
            
            overall_score = sum(scores) / len(scores) if scores else 0
            
            return {
                "overall_accessibility_score": round(overall_score, 1),
                "transport_modes": accessibility_data,
                "accessibility_grade": (
                    "A" if overall_score >= 85 else
                    "B" if overall_score >= 75 else
                    "C" if overall_score >= 65 else
                    "D" if overall_score >= 55 else "F"
                )
            }
            
        except Exception as e:
            raise Exception(f"Accessibility analysis failed: {str(e)}")
    
    async def _analyze_demographics(self, latitude: float, longitude: float, radius_km: float) -> Dict[str, Any]:
        """Analyze demographic factors for location scoring"""
        demographics = await self.get_demographic_data(latitude, longitude, radius_km)
        
        # Score demographics (0-100)
        population_score = min(100, demographics['population_density'] / 50)  # Higher density = higher score
        income_score = min(100, demographics['median_income'] / 1000)  # Higher income = higher score
        age_score = demographics['age_distribution']['25-34'] + demographics['age_distribution']['35-44']  # Target demographics
        
        overall_score = (population_score * 0.4 + income_score * 0.4 + age_score * 0.2)
        
        return {
            'score': round(overall_score, 1),
            'details': demographics
        }
    
    async def _analyze_competition(
        self, 
        latitude: float, 
        longitude: float, 
        radius_km: float,
        target_cuisine_types: Optional[List[str]] = None,
        target_category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze competitive landscape"""
        # Get all restaurants and filter by distance
        all_restaurants_query = select(Restaurant).where(Restaurant.is_active == True)
        result = await self.db.execute(all_restaurants_query)
        all_restaurants = result.scalars().all()
        
        # Filter by distance
        competitors = []
        for restaurant in all_restaurants:
            distance = self.calculate_distance(latitude, longitude, restaurant.latitude, restaurant.longitude)
            if distance <= radius_km:
                competitors.append(restaurant)
        
        total_competitors = len(competitors)
        area_km2 = math.pi * (radius_km ** 2)
        density = total_competitors / area_km2
        
        # Calculate competition score (lower competition = higher score)
        if density < 5:
            competition_score = 90
        elif density < 10:
            competition_score = 75
        elif density < 20:
            competition_score = 60
        elif density < 30:
            competition_score = 45
        else:
            competition_score = 30
        
        # Analyze direct competitors (same cuisine/category)
        direct_competitors = 0
        if target_cuisine_types or target_category:
            for competitor in competitors:
                is_direct = False
                if target_cuisine_types:
                    competitor_cuisines = self.parse_cuisine_types(competitor.cuisine_types)
                    if any(cuisine in competitor_cuisines for cuisine in target_cuisine_types):
                        is_direct = True
                if target_category and competitor.category == target_category:
                    is_direct = True
                if is_direct:
                    direct_competitors += 1
        
        return {
            'score': round(competition_score, 1),
            'details': {
                'total_competitors': total_competitors,
                'direct_competitors': direct_competitors,
                'competition_density': round(density, 2),
                'market_saturation': 'high' if density > 20 else 'medium' if density > 10 else 'low',
                'average_competitor_rating': round(sum(c.average_rating or 0 for c in competitors) / max(total_competitors, 1), 2)
            }
        }
    
    async def _analyze_accessibility(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Analyze location accessibility"""
        accessibility = await self.analyze_accessibility(latitude, longitude)
        return {
            'score': accessibility['overall_accessibility_score'],
            'details': accessibility
        }
    
    async def _analyze_market_potential(
        self,
        latitude: float,
        longitude: float,
        radius_km: float,
        target_cuisine_types: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Analyze market potential and demand"""
        demographics = await self.get_demographic_data(latitude, longitude, radius_km)
        cuisine_gaps = await self.analyze_cuisine_gaps(latitude, longitude, radius_km)
        
        # Calculate market potential score
        population_factor = min(100, demographics['estimated_population'] / 1000)
        income_factor = min(100, demographics['median_income'] / 1000)
        diversity_factor = cuisine_gaps['market_diversity_score']
        
        # If target cuisine is specified, check for gaps
        cuisine_opportunity = 0
        if target_cuisine_types:
            for cuisine_gap in cuisine_gaps['underserved_cuisines']:
                if cuisine_gap['cuisine'] in target_cuisine_types:
                    cuisine_opportunity = cuisine_gap['opportunity_score']
                    break
        
        market_score = (population_factor * 0.3 + income_factor * 0.3 + diversity_factor * 0.2 + cuisine_opportunity * 0.2)
        
        return {
            'score': round(market_score, 1),
            'details': {
                'estimated_market_size': demographics['estimated_population'],
                'purchasing_power': demographics['median_income'],
                'market_diversity': cuisine_gaps['market_diversity_score'],
                'cuisine_opportunities': cuisine_gaps['underserved_cuisines'][:5]
            }
        }
    
    def _generate_location_insights(self, overall_score, demographic_score, competition_score, accessibility_score, market_potential_score) -> List[str]:
        """Generate actionable insights from analysis"""
        insights = []
        
        if overall_score >= 80:
            insights.append("Excellent location with high success probability")
        elif overall_score >= 60:
            insights.append("Good location with moderate success potential")
        else:
            insights.append("Challenging location requiring careful strategy")
        
        if demographic_score['score'] >= 75:
            insights.append("Strong demographic profile with target customer base")
        
        if competition_score['score'] >= 75:
            insights.append("Low competition environment with market opportunity")
        elif competition_score['score'] <= 40:
            insights.append("High competition market requiring differentiation")
        
        if accessibility_score['score'] >= 80:
            insights.append("Excellent accessibility across transportation modes")
        
        if market_potential_score['score'] >= 75:
            insights.append("High market potential with growth opportunities")
        
        return insights
    
    def _generate_recommendations(self, overall_score: float, insights: List[str]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if overall_score >= 75:
            recommendations.append("Proceed with site development - high success probability")
            recommendations.append("Consider premium positioning to maximize revenue potential")
        elif overall_score >= 60:
            recommendations.append("Viable location with proper execution and marketing")
            recommendations.append("Focus on operational excellence and customer experience")
        else:
            recommendations.append("Consider alternative locations or significant differentiation strategy")
            recommendations.append("Conduct additional market research before proceeding")
        
        return recommendations
    
    def _assess_risks(self, competition_score: Dict, market_potential_score: Dict) -> Dict[str, Any]:
        """Assess business risks for the location"""
        risks = []
        risk_level = "low"
        
        if competition_score['details']['market_saturation'] == 'high':
            risks.append("High market saturation may limit customer acquisition")
            risk_level = "high"
        
        if market_potential_score['score'] < 50:
            risks.append("Limited market potential may constrain growth")
            if risk_level != "high":
                risk_level = "medium"
        
        if competition_score['details']['average_competitor_rating'] > 4.0:
            risks.append("High-quality competition requires exceptional execution")
            if risk_level == "low":
                risk_level = "medium"
        
        return {
            'risk_level': risk_level,
            'risk_factors': risks,
            'mitigation_strategies': self._generate_risk_mitigation(risks)
        }
    
    def _generate_risk_mitigation(self, risks: List[str]) -> List[str]:
        """Generate risk mitigation strategies"""
        strategies = []
        
        if any("saturation" in risk for risk in risks):
            strategies.append("Develop unique value proposition and brand differentiation")
            strategies.append("Focus on underserved customer segments or cuisine gaps")
        
        if any("potential" in risk for risk in risks):
            strategies.append("Implement aggressive marketing and customer acquisition strategy")
            strategies.append("Consider flexible business model with multiple revenue streams")
        
        if any("competition" in risk for risk in risks):
            strategies.append("Invest in superior customer experience and service quality")
            strategies.append("Develop competitive pricing strategy with value-added services")
        
        return strategies
    
    def _calculate_confidence_level(self, overall_score: float) -> str:
        """Calculate confidence level for the analysis"""
        if overall_score >= 80:
            return "high"
        elif overall_score >= 60:
            return "medium"
        else:
            return "low"