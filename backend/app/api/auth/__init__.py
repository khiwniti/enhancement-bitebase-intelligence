"""
Authentication module for BiteBase Intelligence API
Provides JWT-based authentication and authorization
"""

from fastapi import APIRouter
from .auth import router as auth_router

# Main auth router
router = APIRouter()
router.include_router(auth_router, tags=["authentication"])