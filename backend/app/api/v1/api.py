"""
BiteBase Intelligence API v1 Router
Main API router combining all endpoints
"""

from fastapi import APIRouter

from app.api.v1.endpoints import restaurants, locations, menu, analytics, search, enhanced_dashboards, nl_query, insights, connectors, collaboration, performance, security

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(restaurants.router, prefix="/restaurants", tags=["restaurants"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(menu.router, prefix="/menu", tags=["menu"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(enhanced_dashboards.router, prefix="/dashboards", tags=["enhanced-dashboards"])
api_router.include_router(nl_query.router, prefix="/nl-query", tags=["natural-language"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(connectors.router, prefix="/connectors", tags=["data-connectors"])
api_router.include_router(collaboration.router, prefix="/collaboration", tags=["collaboration"])
api_router.include_router(performance.router, prefix="/performance", tags=["performance"])
api_router.include_router(security.router, prefix="/security", tags=["security"])