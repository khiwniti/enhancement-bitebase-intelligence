"""
Food Cost Analyzer Service for BiteBase Intelligence
Comprehensive food cost analysis with ingredient breakdown and trend tracking
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from typing import List, Optional, Dict, Any, Tuple
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
import logging

from app.models.restaurant import Restaurant, MenuItem
from app.models.product import (
    IngredientCost, MenuItemIngredient, MenuItemCost, 
    PricingHistory, SeasonalTrend
)

logger = logging.getLogger(__name__)


class FoodCostAnalyzer:
    """Service for comprehensive food cost analysis and optimization"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def analyze_food_costs(
        self,
        restaurant_id: str,
        menu_item_id: Optional[str] = None,
        include_trends: bool = True,
        include_breakdown: bool = True
    ) -> Dict[str, Any]:
        """
        Comprehensive food cost analysis for restaurant or specific menu item
        """
        try:
            if menu_item_id:
                return await self._analyze_single_item_costs(
                    restaurant_id, menu_item_id, include_trends, include_breakdown
                )
            else:
                return await self._analyze_restaurant_costs(
                    restaurant_id, include_trends, include_breakdown
                )
                
        except Exception as e:
            logger.error(f"Food cost analysis failed: {str(e)}")
            return {
                "status": "error",
                "message": f"Analysis failed: {str(e)}"
            }
    
    async def _analyze_single_item_costs(
        self,
        restaurant_id: str,
        menu_item_id: str,
        include_trends: bool,
        include_breakdown: bool
    ) -> Dict[str, Any]:
        """Analyze food costs for a single menu item"""
        
        # Get menu item
        item_query = select(MenuItem).where(
            and_(MenuItem.id == menu_item_id, MenuItem.restaurant_id == restaurant_id)
        )
        item_result = await self.db.execute(item_query)
        menu_item = item_result.scalar_one_or_none()
        
        if not menu_item:
            return {
                "status": "error",
                "message": "Menu item not found"
            }
        
        # Get cost analysis
        cost_analysis = await self._get_or_calculate_item_costs(menu_item)
        
        # Get ingredient breakdown if requested
        ingredient_breakdown = []
        if include_breakdown:
            ingredient_breakdown = await self._get_ingredient_breakdown(menu_item_id)
        
        # Get cost trends if requested
        cost_trends = []
        if include_trends:
            cost_trends = await self._get_cost_trends(menu_item_id)
        
        # Calculate optimization recommendations
        recommendations = await self._generate_cost_recommendations(menu_item, cost_analysis)
        
        return {
            "status": "success",
            "menu_item": {
                "id": menu_item.id,
                "name": menu_item.name,
                "price": float(menu_item.price),
                "category": menu_item.category
            },
            "cost_analysis": cost_analysis,
            "ingredient_breakdown": ingredient_breakdown,
            "cost_trends": cost_trends,
            "recommendations": recommendations,
            "analyzed_at": datetime.utcnow().isoformat()
        }
    
    async def _analyze_restaurant_costs(
        self,
        restaurant_id: str,
        include_trends: bool,
        include_breakdown: bool
    ) -> Dict[str, Any]:
        """Analyze food costs for entire restaurant"""
        
        # Get all menu items
        items_query = select(MenuItem).where(MenuItem.restaurant_id == restaurant_id)
        items_result = await self.db.execute(items_query)
        menu_items = items_result.scalars().all()
        
        if not menu_items:
            return {
                "status": "error",
                "message": "No menu items found"
            }
        
        # Analyze each item
        item_analyses = []
        total_food_cost = 0
        total_revenue = 0
        
        for item in menu_items:
            cost_analysis = await self._get_or_calculate_item_costs(item)
            item_analyses.append({
                "item_id": item.id,
                "item_name": item.name,
                "item_price": float(item.price),
                "cost_analysis": cost_analysis
            })
            
            # Accumulate totals (using mock sales data)
            mock_sales = 50  # In production, get from order history
            total_food_cost += cost_analysis["total_cost"] * mock_sales
            total_revenue += float(item.price) * mock_sales
        
        # Calculate overall metrics
        overall_food_cost_percentage = (total_food_cost / total_revenue * 100) if total_revenue > 0 else 0
        
        # Get restaurant-wide trends
        restaurant_trends = []
        if include_trends:
            restaurant_trends = await self._get_restaurant_cost_trends(restaurant_id)
        
        # Generate restaurant-level recommendations
        restaurant_recommendations = self._generate_restaurant_recommendations(
            item_analyses, overall_food_cost_percentage
        )
        
        return {
            "status": "success",
            "restaurant_id": restaurant_id,
            "overall_metrics": {
                "total_menu_items": len(menu_items),
                "overall_food_cost_percentage": round(overall_food_cost_percentage, 2),
                "target_food_cost_percentage": 30.0,  # Industry standard
                "variance_from_target": round(overall_food_cost_percentage - 30.0, 2),
                "total_estimated_food_cost": round(total_food_cost, 2),
                "total_estimated_revenue": round(total_revenue, 2)
            },
            "item_analyses": item_analyses,
            "restaurant_trends": restaurant_trends,
            "recommendations": restaurant_recommendations,
            "analyzed_at": datetime.utcnow().isoformat()
        }
    
    async def _get_or_calculate_item_costs(self, menu_item: MenuItem) -> Dict[str, Any]:
        """Get existing cost analysis or calculate new one"""
        
        # Try to get existing cost analysis
        cost_query = select(MenuItemCost).where(MenuItemCost.menu_item_id == menu_item.id)
        cost_result = await self.db.execute(cost_query)
        cost_analysis = cost_result.scalar_one_or_none()
        
        if cost_analysis:
            return {
                "ingredient_cost": float(cost_analysis.ingredient_cost),
                "labor_cost": float(cost_analysis.labor_cost),
                "overhead_cost": float(cost_analysis.overhead_cost),
                "packaging_cost": float(cost_analysis.packaging_cost),
                "total_cost": float(cost_analysis.total_cost),
                "profit_margin": float(cost_analysis.profit_margin),
                "profit_amount": float(cost_analysis.profit_amount),
                "food_cost_percentage": float(cost_analysis.food_cost_percentage or 30),
                "last_updated": cost_analysis.updated_at.isoformat()
            }
        else:
            # Calculate estimated costs
            return await self._calculate_estimated_costs(menu_item)
    
    async def _calculate_estimated_costs(self, menu_item: MenuItem) -> Dict[str, Any]:
        """Calculate estimated costs using industry standards"""
        
        item_price = float(menu_item.price)
        
        # Industry standard estimates
        estimated_food_cost_percentage = 30.0  # 30% of price
        estimated_labor_percentage = 8.0       # 8% of price
        estimated_overhead_percentage = 5.0    # 5% of price
        estimated_packaging_percentage = 2.0   # 2% of price
        
        ingredient_cost = item_price * (estimated_food_cost_percentage / 100)
        labor_cost = item_price * (estimated_labor_percentage / 100)
        overhead_cost = item_price * (estimated_overhead_percentage / 100)
        packaging_cost = item_price * (estimated_packaging_percentage / 100)
        
        total_cost = ingredient_cost + labor_cost + overhead_cost + packaging_cost
        profit_amount = item_price - total_cost
        profit_margin = (profit_amount / item_price) * 100
        
        return {
            "ingredient_cost": round(ingredient_cost, 2),
            "labor_cost": round(labor_cost, 2),
            "overhead_cost": round(overhead_cost, 2),
            "packaging_cost": round(packaging_cost, 2),
            "total_cost": round(total_cost, 2),
            "profit_margin": round(profit_margin, 2),
            "profit_amount": round(profit_amount, 2),
            "food_cost_percentage": estimated_food_cost_percentage,
            "last_updated": datetime.utcnow().isoformat(),
            "is_estimated": True
        }
    
    async def _get_ingredient_breakdown(self, menu_item_id: str) -> List[Dict[str, Any]]:
        """Get detailed ingredient cost breakdown"""
        
        # Get ingredient relationships
        ingredients_query = select(MenuItemIngredient).where(
            MenuItemIngredient.menu_item_id == menu_item_id
        )
        ingredients_result = await self.db.execute(ingredients_query)
        ingredients = ingredients_result.scalars().all()
        
        breakdown = []
        for ingredient_rel in ingredients:
            # Get ingredient cost details
            cost_query = select(IngredientCost).where(
                IngredientCost.id == ingredient_rel.ingredient_cost_id
            )
            cost_result = await self.db.execute(cost_query)
            ingredient_cost = cost_result.scalar_one_or_none()
            
            if ingredient_cost:
                breakdown.append({
                    "ingredient_name": ingredient_cost.ingredient_name,
                    "quantity_used": float(ingredient_rel.quantity_used),
                    "unit_type": ingredient_rel.unit_type,
                    "cost_per_unit": float(ingredient_cost.cost_per_unit),
                    "cost_per_serving": float(ingredient_rel.cost_per_serving),
                    "waste_percentage": float(ingredient_rel.waste_percentage),
                    "is_primary": ingredient_rel.is_primary_ingredient,
                    "supplier": ingredient_cost.supplier_name,
                    "last_price_update": ingredient_cost.last_price_update.isoformat() if ingredient_cost.last_price_update else None
                })
        
        # Sort by cost per serving (highest first)
        breakdown.sort(key=lambda x: x["cost_per_serving"], reverse=True)
        
        return breakdown
    
    async def _get_cost_trends(self, menu_item_id: str) -> List[Dict[str, Any]]:
        """Get cost trends for menu item over time"""
        
        # Get pricing history
        history_query = select(PricingHistory).where(
            PricingHistory.menu_item_id == menu_item_id
        ).order_by(desc(PricingHistory.effective_date)).limit(12)  # Last 12 changes
        
        history_result = await self.db.execute(history_query)
        pricing_history = history_result.scalars().all()
        
        trends = []
        for history_item in pricing_history:
            trends.append({
                "date": history_item.effective_date.isoformat(),
                "old_price": float(history_item.old_price),
                "new_price": float(history_item.new_price),
                "change_percentage": float(history_item.price_change_percentage),
                "reason": history_item.reason,
                "change_type": history_item.change_type
            })
        
        return trends
    
    async def _get_restaurant_cost_trends(self, restaurant_id: str) -> List[Dict[str, Any]]:
        """Get restaurant-wide cost trends"""
        
        # This would typically aggregate cost data over time
        # For now, return mock trend data
        trends = []
        base_date = datetime.utcnow() - timedelta(days=180)
        
        for i in range(6):  # 6 months of data
            trend_date = base_date + timedelta(days=30 * i)
            trends.append({
                "month": trend_date.strftime("%Y-%m"),
                "average_food_cost_percentage": 28.5 + (i * 0.5),  # Gradual increase
                "total_food_costs": 15000 + (i * 500),
                "total_revenue": 50000 + (i * 1000),
                "items_analyzed": 25 + i
            })
        
        return trends
    
    async def _generate_cost_recommendations(
        self,
        menu_item: MenuItem,
        cost_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate cost optimization recommendations for a menu item"""
        
        recommendations = []
        food_cost_percentage = cost_analysis["food_cost_percentage"]
        
        # High food cost recommendation
        if food_cost_percentage > 35:
            recommendations.append({
                "type": "cost_reduction",
                "priority": "high",
                "title": "Reduce Food Costs",
                "description": f"Food cost is {food_cost_percentage:.1f}%, above the 35% threshold",
                "suggested_actions": [
                    "Review ingredient suppliers for better pricing",
                    "Reduce portion sizes slightly",
                    "Substitute expensive ingredients with alternatives",
                    "Negotiate bulk pricing with suppliers"
                ],
                "potential_savings": f"${(cost_analysis['ingredient_cost'] * 0.1):.2f} per serving"
            })
        
        # Low profit margin recommendation
        if cost_analysis["profit_margin"] < 60:
            recommendations.append({
                "type": "price_increase",
                "priority": "medium",
                "title": "Consider Price Increase",
                "description": f"Profit margin is {cost_analysis['profit_margin']:.1f}%, below optimal 60-70%",
                "suggested_actions": [
                    f"Increase price by $1-2 to improve margins",
                    "Bundle with complementary items",
                    "Reposition as premium offering"
                ],
                "potential_impact": f"${1.50:.2f} additional profit per serving"
            })
        
        return recommendations
    
    def _generate_restaurant_recommendations(
        self,
        item_analyses: List[Dict[str, Any]],
        overall_food_cost_percentage: float
    ) -> List[Dict[str, Any]]:
        """Generate restaurant-level cost recommendations"""
        
        recommendations = []
        
        # Overall food cost recommendation
        if overall_food_cost_percentage > 32:
            high_cost_items = [
                item for item in item_analyses 
                if item["cost_analysis"]["food_cost_percentage"] > 35
            ]
            
            recommendations.append({
                "type": "overall_cost_reduction",
                "priority": "high",
                "title": "Reduce Overall Food Costs",
                "description": f"Restaurant food cost is {overall_food_cost_percentage:.1f}%, above optimal 30-32%",
                "affected_items": len(high_cost_items),
                "suggested_actions": [
                    "Focus on high-cost items first",
                    "Implement portion control training",
                    "Review supplier contracts",
                    "Consider menu engineering to promote profitable items"
                ]
            })
        
        # Menu optimization recommendation
        low_margin_items = [
            item for item in item_analyses 
            if item["cost_analysis"]["profit_margin"] < 60
        ]
        
        if len(low_margin_items) > len(item_analyses) * 0.3:  # More than 30% of items
            recommendations.append({
                "type": "menu_optimization",
                "priority": "medium",
                "title": "Optimize Menu Mix",
                "description": f"{len(low_margin_items)} items have low profit margins",
                "suggested_actions": [
                    "Review pricing strategy",
                    "Consider removing lowest-performing items",
                    "Promote high-margin items",
                    "Redesign low-margin items"
                ]
            })
        
        return recommendations
