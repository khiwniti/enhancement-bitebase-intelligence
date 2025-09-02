"""
BiteBase Intelligence API v1 Router
Main API router combining all endpoints
"""

from fastapi import APIRouter

from app.api.v1.endpoints import restaurants, restaurant_management, campaign_management, pos_integration, locations, menu, analytics, search, enhanced_dashboards, dashboards, nl_query, insights, connectors, collaboration, performance, security, ai, payments, admin, notifications, reports, location_intelligence, api_proxy, product_intelligence, place_intelligence, price_intelligence, promotion_intelligence, realtime_analytics, advanced_ai, multi_location, websocket
from app.api.auth import router as auth_router

api_router = APIRouter()

# Include authentication router (not versioned as it's common across versions)
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])

# Include all endpoint routers
api_router.include_router(ai.router, prefix="/ai", tags=["ai-analytics"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(restaurants.router, prefix="/restaurants", tags=["restaurants"])
api_router.include_router(restaurant_management.router, prefix="/restaurant-management", tags=["restaurant-management"])
api_router.include_router(campaign_management.router, prefix="/campaign-management", tags=["campaign-management"])
api_router.include_router(pos_integration.router, prefix="/pos-integration", tags=["pos-integration"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(menu.router, prefix="/menu", tags=["menu"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(enhanced_dashboards.router, prefix="/enhanced-dashboards", tags=["enhanced-dashboards"])
api_router.include_router(dashboards.router, prefix="/dashboards", tags=["dashboards"])
api_router.include_router(nl_query.router, prefix="/nl-query", tags=["natural-language"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(connectors.router, prefix="/connectors", tags=["data-connectors"])
api_router.include_router(collaboration.router, prefix="/collaboration", tags=["collaboration"])
api_router.include_router(performance.router, prefix="/performance", tags=["performance"])
api_router.include_router(security.router, prefix="/security", tags=["security"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(location_intelligence.router, prefix="/location-intelligence", tags=["location-intelligence"])
api_router.include_router(api_proxy.router, prefix="/proxy", tags=["api-proxy"])

# 4P Framework Intelligence APIs
api_router.include_router(product_intelligence.router, prefix="/product-intelligence", tags=["4p-product"])
api_router.include_router(place_intelligence.router, prefix="/place-intelligence", tags=["4p-place"])
api_router.include_router(price_intelligence.router, prefix="/price-intelligence", tags=["4p-price"])
api_router.include_router(promotion_intelligence.router, prefix="/promotion-intelligence", tags=["4p-promotion"])

# Real-time Analytics API
api_router.include_router(realtime_analytics.router, prefix="/realtime-analytics", tags=["realtime-analytics"])

# Advanced AI/ML Pipeline API
api_router.include_router(advanced_ai.router, prefix="/advanced-ai", tags=["advanced-ai"])

# Multi-Location Management API
api_router.include_router(multi_location.router, prefix="/multi-location", tags=["multi-location"])

# General WebSocket API
api_router.include_router(websocket.router, prefix="/websocket", tags=["websocket"])