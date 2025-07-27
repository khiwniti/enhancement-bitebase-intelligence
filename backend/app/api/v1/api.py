"""
BiteBase Intelligence API v1 Router
Main API router combining all endpoints
"""

from fastapi import APIRouter

from app.api.v1.endpoints import restaurants, locations, menu, analytics, search

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(restaurants.router, prefix="/restaurants", tags=["restaurants"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(menu.router, prefix="/menu", tags=["menu"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(search.router, prefix="/search", tags=["search"])