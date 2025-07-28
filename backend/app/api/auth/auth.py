"""
Authentication endpoints for BiteBase Intelligence API
FastAPI implementation based on Express.js patterns from bitebase-backend-express
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthUtils, AuthError, create_auth_response, create_auth_error_response
from app.core.dependencies import get_current_user, CurrentUser
from app.core.database import get_db

router = APIRouter()

# Request Models
class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")

class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")
    firstName: str = Field(..., min_length=1, max_length=50, description="First name")
    lastName: str = Field(..., min_length=1, max_length=50, description="Last name")
    company: Optional[str] = Field(None, max_length=100, description="Company name")

class RefreshTokenRequest(BaseModel):
    refreshToken: str = Field(..., description="Refresh token")

# Response Models
class AuthResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    timestamp: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    data: dict
    timestamp: str

@router.post("/login", response_model=LoginResponse, summary="User login")
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user with email and password
    Returns JWT access token and refresh token
    """
    try:
        # Note: This is a simplified implementation
        # In production, you would:
        # 1. Query user from database by email
        # 2. Verify password against stored hash
        # 3. Handle account lockout, rate limiting, etc.
        
        # Mock user lookup (replace with actual database query)
        # user = db.query(User).filter(User.email == request.email).first()
        # if not user or not AuthUtils.verify_password(request.password, user.password_hash):
        #     raise create_auth_error_response(AuthError.INVALID_CREDENTIALS)
        
        # Mock user for demonstration (replace with actual user data)
        mock_user = {
            'id': 'user_123',
            'email': request.email,
            'role': 'user',
            'firstName': 'John',
            'lastName': 'Doe'
        }
        
        # Generate tokens
        access_token = AuthUtils.generate_token(
            user_id=mock_user['id'],
            email=mock_user['email'],
            role=mock_user['role']
        )
        
        refresh_token = AuthUtils.generate_refresh_token(mock_user['id'])
        
        response_data = {
            'user': {
                'id': mock_user['id'],
                'email': mock_user['email'],
                'firstName': mock_user['firstName'],
                'lastName': mock_user['lastName'],
                'role': mock_user['role']
            },
            'tokens': {
                'accessToken': access_token,
                'refreshToken': refresh_token,
                'expiresIn': '7d'
            }
        }
        
        return create_auth_response(
            success=True,
            message="Login successful",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise create_auth_error_response(
            AuthError.AUTHENTICATION_FAILED,
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/register", response_model=AuthResponse, summary="User registration")
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Register new user account
    Creates user and returns authentication tokens
    """
    try:
        # Note: This is a simplified implementation
        # In production, you would:
        # 1. Check if email already exists
        # 2. Validate password strength
        # 3. Hash password before storage
        # 4. Send email verification
        # 5. Create user record in database
        
        # Check if user already exists (mock implementation)
        # existing_user = db.query(User).filter(User.email == request.email).first()
        # if existing_user:
        #     raise create_auth_error_response("Email already registered", status.HTTP_409_CONFLICT)
        
        # Hash password
        password_hash = AuthUtils.hash_password(request.password)
        
        # Create user (mock implementation)
        # new_user = User(
        #     email=request.email,
        #     password_hash=password_hash,
        #     first_name=request.firstName,
        #     last_name=request.lastName,
        #     company=request.company,
        #     role='user',
        #     created_at=datetime.now(timezone.utc)
        # )
        # db.add(new_user)
        # db.commit()
        # db.refresh(new_user)
        
        # Mock user creation
        mock_user = {
            'id': 'user_new_123',
            'email': request.email,
            'firstName': request.firstName,
            'lastName': request.lastName,
            'company': request.company,
            'role': 'user'
        }
        
        # Generate tokens for new user
        access_token = AuthUtils.generate_token(
            user_id=mock_user['id'],
            email=mock_user['email'],
            role=mock_user['role']
        )
        
        refresh_token = AuthUtils.generate_refresh_token(mock_user['id'])
        
        response_data = {
            'user': {
                'id': mock_user['id'],
                'email': mock_user['email'],
                'firstName': mock_user['firstName'],
                'lastName': mock_user['lastName'],
                'role': mock_user['role']
            },
            'tokens': {
                'accessToken': access_token,
                'refreshToken': refresh_token,
                'expiresIn': '7d'
            }
        }
        
        return create_auth_response(
            success=True,
            message="Registration successful",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise create_auth_error_response(
            "Registration failed",
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/refresh", response_model=AuthResponse, summary="Refresh JWT token")
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh JWT access token using refresh token
    """
    try:
        # Verify refresh token
        decoded = AuthUtils.verify_token(request.refreshToken)
        
        if not decoded or decoded.get('type') != 'refresh':
            raise create_auth_error_response(
                "Invalid refresh token",
                status.HTTP_401_UNAUTHORIZED
            )
        
        user_id = decoded.get('id')
        if not user_id:
            raise create_auth_error_response(
                "Invalid refresh token",
                status.HTTP_401_UNAUTHORIZED
            )
        
        # Get user from database (mock implementation)
        # user = db.query(User).filter(User.id == user_id).first()
        # if not user:
        #     raise create_auth_error_response("User not found", status.HTTP_404_NOT_FOUND)
        
        # Mock user lookup
        mock_user = {
            'id': user_id,
            'email': 'user@example.com',
            'role': 'user'
        }
        
        # Generate new access token
        new_access_token = AuthUtils.generate_token(
            user_id=mock_user['id'],
            email=mock_user['email'],
            role=mock_user['role']
        )
        
        # Optionally generate new refresh token (rotation)
        new_refresh_token = AuthUtils.generate_refresh_token(user_id)
        
        response_data = {
            'tokens': {
                'accessToken': new_access_token,
                'refreshToken': new_refresh_token,
                'expiresIn': '7d'
            }
        }
        
        return create_auth_response(
            success=True,
            message="Token refreshed successfully",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise create_auth_error_response(
            "Token refresh failed",
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/logout", response_model=AuthResponse, summary="User logout")
async def logout(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout user and invalidate tokens
    In production, you would add token to blacklist
    """
    try:
        # In production, add token to blacklist or revoke refresh tokens
        # token_blacklist.add(current_token)
        # db.query(RefreshToken).filter(RefreshToken.user_id == current_user.id).delete()
        # db.commit()
        
        return create_auth_response(
            success=True,
            message="Logout successful"
        )
        
    except Exception as e:
        raise create_auth_error_response(
            "Logout failed",
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.get("/me", response_model=AuthResponse, summary="Get current user")
async def get_current_user_info(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current authenticated user information
    """
    try:
        # Get full user details from database (mock implementation)
        # user = db.query(User).filter(User.id == current_user.id).first()
        # if not user:
        #     raise create_auth_error_response("User not found", status.HTTP_404_NOT_FOUND)
        
        # Mock user data
        user_data = {
            'id': current_user.id,
            'email': current_user.email,
            'role': current_user.role,
            'firstName': 'John',
            'lastName': 'Doe',
            'company': 'BiteBase'
        }
        
        return create_auth_response(
            success=True,
            message="User retrieved successfully",
            data={'user': user_data}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise create_auth_error_response(
            "Failed to retrieve user",
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/verify", response_model=AuthResponse, summary="Verify JWT token")
async def verify_token(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Verify JWT token validity
    """
    return create_auth_response(
        success=True,
        message="Token is valid",
        data={
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'role': current_user.role
            }
        }
    )