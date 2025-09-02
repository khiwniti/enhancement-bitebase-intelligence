"""
Authentication module for BiteBase Intelligence API
Provides JWT-based authentication and authorization
"""

from fastapi import APIRouter
from .auth import router as auth_router
from .admin import router as admin_router

# Main auth router
router = APIRouter()
router.include_router(auth_router, tags=["authentication"])
router.include_router(admin_router, prefix="/admin", tags=["administration"])