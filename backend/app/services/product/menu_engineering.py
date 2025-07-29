"""
Menu Engineering Service for BiteBase Intelligence
Implements the classic menu engineering matrix (Star/Dog/Plow Horse/Puzzle classification)
Based on menu item popularity and profitability analysis
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from typing import List, Optional, Dict, Any, Tuple
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
import logging

from app.models.restaurant import Restaurant, MenuItem
from app.models.product import MenuItemCost, MenuItemIngredient, IngredientCost

logger = logging.getLogger(__name__)


class MenuEngineeringService:
    """Service for menu engineering analysis and classification"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def classify_menu_items(
        self,
        restaurant_id: str,
        analysis_period_days: int = 30
    ) -> Dict[str, Any]:
        """
        Classify menu items using the menu engineering matrix
        Returns items classified as Star, Dog, Plow Horse, or Puzzle
        """
        try:
            # Get menu items with sales and cost data
            menu_items = await self._get_menu_items_with_metrics(
                restaurant_id, analysis_period_days
            )
            
            if not menu_items:
                return {
                    "status": "error",
                    "message": "No menu items found with sufficient data",
                    "classifications": {}
                }
            
            # Calculate popularity and profitability thresholds
            popularity_threshold = self._calculate_popularity_threshold(menu_items)
            profitability_threshold = self._calculate_profitability_threshold(menu_items)
            
            # Classify each menu item
            classifications = {}
            for item in menu_items:
                classification = self._classify_item(
                    item, popularity_threshold, profitability_threshold
                )
                classifications[item["id"]] = classification
            
            # Generate summary statistics
            summary = self._generate_classification_summary(classifications)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(
                restaurant_id, classifications, menu_items
            )
            
            return {
                "status": "success",
                "restaurant_id": restaurant_id,
                "analysis_period_days": analysis_period_days,
                "thresholds": {
                    "popularity": popularity_threshold,
                    "profitability": profitability_threshold
                },
                "classifications": classifications,
                "summary": summary,
                "recommendations": recommendations,
                "analyzed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Menu engineering classification failed: {str(e)}")
            return {
                "status": "error",
                "message": f"Classification failed: {str(e)}",
                "classifications": {}
            }
    
    async def _get_menu_items_with_metrics(
        self,
        restaurant_id: str,
        analysis_period_days: int
    ) -> List[Dict[str, Any]]:
        """Get menu items with sales and profitability metrics"""
        
        # For now, we'll use mock data since we don't have order history
        # In production, this would query actual sales data
        query = select(MenuItem).where(MenuItem.restaurant_id == restaurant_id)
        result = await self.db.execute(query)
        menu_items = result.scalars().all()
        
        items_with_metrics = []
        for item in menu_items:
            # Mock sales data - in production this would come from order history
            mock_sales = self._generate_mock_sales_data(item)
            
            # Calculate profitability metrics
            profitability = await self._calculate_item_profitability(item)
            
            items_with_metrics.append({
                "id": item.id,
                "name": item.name,
                "price": float(item.price),
                "category": item.category,
                "sales_count": mock_sales["sales_count"],
                "revenue": mock_sales["revenue"],
                "profit_margin": profitability["profit_margin"],
                "profit_amount": profitability["profit_amount"],
                "food_cost_percentage": profitability["food_cost_percentage"],
                "popularity_score": mock_sales["popularity_score"],
                "profitability_score": profitability["profitability_score"]
            })
        
        return items_with_metrics
    
    def _generate_mock_sales_data(self, item: MenuItem) -> Dict[str, Any]:
        """Generate mock sales data for demonstration"""
        # This would be replaced with actual sales data in production
        import random
        
        base_sales = random.randint(10, 200)  # Sales count for the period
        revenue = base_sales * float(item.price)
        
        # Popularity score based on sales relative to price point
        popularity_score = min(100, (base_sales / max(float(item.price), 1)) * 10)
        
        return {
            "sales_count": base_sales,
            "revenue": revenue,
            "popularity_score": popularity_score
        }
    
    async def _calculate_item_profitability(self, item: MenuItem) -> Dict[str, Any]:
        """Calculate profitability metrics for a menu item"""
        try:
            # Try to get cost analysis data
            cost_query = select(MenuItemCost).where(MenuItemCost.menu_item_id == item.id)
            cost_result = await self.db.execute(cost_query)
            cost_analysis = cost_result.scalar_one_or_none()
            
            if cost_analysis:
                profit_margin = float(cost_analysis.profit_margin)
                profit_amount = float(cost_analysis.profit_amount)
                food_cost_percentage = float(cost_analysis.food_cost_percentage or 30)
            else:
                # Use industry standard estimates
                estimated_food_cost = float(item.price) * 0.30  # 30% food cost
                profit_amount = float(item.price) - estimated_food_cost
                profit_margin = (profit_amount / float(item.price)) * 100
                food_cost_percentage = 30.0
            
            # Profitability score (0-100 scale)
            profitability_score = min(100, max(0, profit_margin))
            
            return {
                "profit_margin": profit_margin,
                "profit_amount": profit_amount,
                "food_cost_percentage": food_cost_percentage,
                "profitability_score": profitability_score
            }
            
        except Exception as e:
            logger.warning(f"Could not calculate profitability for item {item.id}: {str(e)}")
            # Return default values
            return {
                "profit_margin": 70.0,
                "profit_amount": float(item.price) * 0.7,
                "food_cost_percentage": 30.0,
                "profitability_score": 70.0
            }
    
    def _calculate_popularity_threshold(self, menu_items: List[Dict[str, Any]]) -> float:
        """Calculate the popularity threshold (median popularity score)"""
        popularity_scores = [item["popularity_score"] for item in menu_items]
        popularity_scores.sort()
        n = len(popularity_scores)
        
        if n % 2 == 0:
            return (popularity_scores[n//2 - 1] + popularity_scores[n//2]) / 2
        else:
            return popularity_scores[n//2]
    
    def _calculate_profitability_threshold(self, menu_items: List[Dict[str, Any]]) -> float:
        """Calculate the profitability threshold (median profitability score)"""
        profitability_scores = [item["profitability_score"] for item in menu_items]
        profitability_scores.sort()
        n = len(profitability_scores)
        
        if n % 2 == 0:
            return (profitability_scores[n//2 - 1] + profitability_scores[n//2]) / 2
        else:
            return profitability_scores[n//2]
    
    def _classify_item(
        self,
        item: Dict[str, Any],
        popularity_threshold: float,
        profitability_threshold: float
    ) -> Dict[str, Any]:
        """Classify a menu item using the menu engineering matrix"""
        
        is_popular = item["popularity_score"] >= popularity_threshold
        is_profitable = item["profitability_score"] >= profitability_threshold
        
        if is_popular and is_profitable:
            classification = "star"
            description = "High popularity, high profitability - promote and maintain"
            color = "#4CAF50"  # Green
        elif is_popular and not is_profitable:
            classification = "plow_horse"
            description = "High popularity, low profitability - reduce costs or increase price"
            color = "#FF9800"  # Orange
        elif not is_popular and is_profitable:
            classification = "puzzle"
            description = "Low popularity, high profitability - promote or reposition"
            color = "#2196F3"  # Blue
        else:
            classification = "dog"
            description = "Low popularity, low profitability - consider removing"
            color = "#F44336"  # Red
        
        return {
            "classification": classification,
            "description": description,
            "color": color,
            "popularity_score": item["popularity_score"],
            "profitability_score": item["profitability_score"],
            "is_popular": is_popular,
            "is_profitable": is_profitable,
            "item_name": item["name"],
            "item_price": item["price"],
            "sales_count": item["sales_count"],
            "profit_margin": item["profit_margin"]
        }
    
    def _generate_classification_summary(self, classifications: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary statistics for the classification results"""
        
        counts = {"star": 0, "plow_horse": 0, "puzzle": 0, "dog": 0}
        total_items = len(classifications)
        
        for item_classification in classifications.values():
            classification = item_classification["classification"]
            counts[classification] += 1
        
        percentages = {
            classification: (count / total_items) * 100 if total_items > 0 else 0
            for classification, count in counts.items()
        }
        
        return {
            "total_items": total_items,
            "counts": counts,
            "percentages": percentages,
            "health_score": self._calculate_menu_health_score(percentages)
        }
    
    def _calculate_menu_health_score(self, percentages: Dict[str, float]) -> float:
        """Calculate overall menu health score (0-100)"""
        # Ideal distribution: 20% stars, 70% plow horses/puzzles, 10% dogs
        star_score = min(100, percentages["star"] * 5)  # Stars are good
        dog_penalty = percentages["dog"] * 2  # Dogs are bad
        balance_score = 100 - abs(percentages["plow_horse"] + percentages["puzzle"] - 70)
        
        health_score = max(0, (star_score + balance_score - dog_penalty) / 2)
        return round(health_score, 1)
    
    async def _generate_recommendations(
        self,
        restaurant_id: str,
        classifications: Dict[str, Dict[str, Any]],
        menu_items: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate actionable recommendations based on classification results"""
        
        recommendations = []
        
        # Analyze each classification group
        for item_id, classification in classifications.items():
            item_data = next((item for item in menu_items if item["id"] == item_id), None)
            if not item_data:
                continue
            
            recommendation = self._get_item_recommendation(classification, item_data)
            if recommendation:
                recommendations.append(recommendation)
        
        # Sort by priority (stars first, then dogs to remove)
        priority_order = {"star": 1, "puzzle": 2, "plow_horse": 3, "dog": 4}
        recommendations.sort(key=lambda x: priority_order.get(x["classification"], 5))
        
        return recommendations[:10]  # Return top 10 recommendations
    
    def _get_item_recommendation(
        self,
        classification: Dict[str, Any],
        item_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Get specific recommendation for a menu item based on its classification"""
        
        classification_type = classification["classification"]
        
        if classification_type == "star":
            return {
                "item_id": item_data["id"],
                "item_name": item_data["name"],
                "classification": classification_type,
                "priority": "high",
                "action": "promote",
                "recommendation": f"Promote '{item_data['name']}' - it's a star performer! Consider featuring it prominently.",
                "expected_impact": "Increased revenue and customer satisfaction"
            }
        
        elif classification_type == "dog":
            return {
                "item_id": item_data["id"],
                "item_name": item_data["name"],
                "classification": classification_type,
                "priority": "high",
                "action": "remove_or_redesign",
                "recommendation": f"Consider removing '{item_data['name']}' or completely redesigning it. Low popularity and profitability.",
                "expected_impact": "Reduced menu complexity and improved overall profitability"
            }
        
        elif classification_type == "puzzle":
            return {
                "item_id": item_data["id"],
                "item_name": item_data["name"],
                "classification": classification_type,
                "priority": "medium",
                "action": "promote",
                "recommendation": f"Promote '{item_data['name']}' more aggressively - it's profitable but not popular enough.",
                "expected_impact": "Increased sales of high-margin items"
            }
        
        elif classification_type == "plow_horse":
            return {
                "item_id": item_data["id"],
                "item_name": item_data["name"],
                "classification": classification_type,
                "priority": "medium",
                "action": "optimize_costs",
                "recommendation": f"Reduce costs for '{item_data['name']}' or slightly increase price. Popular but not profitable enough.",
                "expected_impact": "Improved profitability while maintaining popularity"
            }
        
        return None
