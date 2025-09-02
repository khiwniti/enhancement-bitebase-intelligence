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
from app.core.enhanced_auth import enhanced_auth, AuthError as EnhancedAuthError, UserRole, create_auth_error_response as enhanced_auth_error
from app.core.enhanced_dependencies import get_current_user, CurrentUser, get_request_info, check_account_lockout
from app.core.security import account_lockout, create_security_audit_log
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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Password reset token")
    password: str = Field(..., min_length=6, description="New password")

class VerifyEmailRequest(BaseModel):
    token: str = Field(..., description="Email verification token")

class UpdateProfileRequest(BaseModel):
    firstName: Optional[str] = Field(None, min_length=1, max_length=50, description="First name")
    lastName: Optional[str] = Field(None, min_length=1, max_length=50, description="Last name")
    company: Optional[str] = Field(None, max_length=100, description="Company name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")

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
    Authenticate user with email and password with enhanced security
    Returns JWT access token and refresh token
    """
    try:
        # Check account lockout first
        await check_account_lockout(request.email)
        
        # Mock user lookup (replace with actual database query)
        # user = await db.execute(
        #     select(User).where(User.email == request.email)
        # )
        # user = user.scalar_one_or_none()
        
        # For demonstration, simulate user lookup
        mock_user_exists = True  # Replace with actual database check
        
        if not mock_user_exists:
            # Record failed attempt
            account_lockout.record_failed_attempt(request.email)
            
            create_security_audit_log(
                user_id=None,
                ip_address="unknown",
                user_agent="",
                action="login_failed_user_not_found",
                resource="/api/auth/login",
                success=False,
                metadata={"email": request.email}
            )
            
            raise enhanced_auth_error(
                EnhancedAuthError.INVALID_CREDENTIALS,
                error_code="INVALID_CREDENTIALS"
            )
        
        # Verify password (replace with actual password verification)
        # password_valid = enhanced_auth.verify_password(request.password, user.password_hash)
        password_valid = True  # Mock password verification
        
        if not password_valid:
            # Record failed attempt
            should_lock = account_lockout.record_failed_attempt(request.email)
            
            create_security_audit_log(
                user_id=None,
                ip_address="unknown",
                user_agent="",
                action="login_failed_invalid_password",
                resource="/api/auth/login",
                success=False,
                metadata={"email": request.email, "account_locked": should_lock}
            )
            
            raise enhanced_auth_error(
                EnhancedAuthError.INVALID_CREDENTIALS,
                error_code="INVALID_CREDENTIALS"
            )
        
        # Clear failed attempts on successful authentication
        account_lockout.clear_failed_attempts(request.email)
        
        # Mock user data (replace with actual user data)
        mock_user = {
            'id': 'user_123',
            'email': request.email,
            'role': UserRole.USER,
            'firstName': 'John',
            'lastName': 'Doe'
        }
        
        # Generate enhanced token pair
        token_data = enhanced_auth.generate_token_pair(
            user_id=mock_user['id'],
            email=mock_user['email'],
            role=mock_user['role'],
            permissions=['read', 'write']  # Replace with actual user permissions
        )
        
        # Log successful authentication
        create_security_audit_log(
            user_id=mock_user['id'],
            ip_address="unknown",
            user_agent="",
            action="login_successful",
            resource="/api/auth/login",
            success=True,
            metadata={"email": request.email, "session_id": token_data['session_id']}
        )
        
        response_data = {
            'user': {
                'id': mock_user['id'],
                'email': mock_user['email'],
                'firstName': mock_user['firstName'],
                'lastName': mock_user['lastName'],
                'role': mock_user['role'].value
            },
            'tokens': {
                'accessToken': token_data['access_token'],
                'refreshToken': token_data['refresh_token'],
                'sessionId': token_data['session_id'],
                'expiresAt': token_data['access_expires_at'],
                'refreshExpiresAt': token_data['refresh_expires_at']
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
    Register new user account with enhanced security validation
    Creates user and returns authentication tokens
    """
    try:
        # Check if user already exists (mock implementation)
        # existing_user = await db.execute(
        #     select(User).where(User.email == request.email)
        # )
        # if existing_user.scalar_one_or_none():
        #     raise enhanced_auth_error("Email already registered", status.HTTP_409_CONFLICT)

        # Mock registration success
        return create_auth_response(
            success=True,
            message="User registered successfully"
        )

    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise create_auth_error_response(
            "Registration failed",
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/signup", response_model=AuthResponse, summary="User signup (alias for register)")
async def signup(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Signup new user account (alias for register endpoint)
    Frontend compatibility endpoint
    """
    return await register(request, db)

@router.post("/refresh", response_model=AuthResponse, summary="Refresh JWT token")
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh JWT access token using refresh token with enhanced security
    """
    try:
        from app.core.enhanced_auth import TokenType

        # Verify refresh token with enhanced validation
        token_payload = enhanced_auth.verify_token(
            request.refreshToken,
            TokenType.REFRESH,
            check_blacklist=True
        )

        if not token_payload:
            create_security_audit_log(
                user_id=None,
                ip_address="unknown",
                user_agent="",
                action="token_refresh_failed_invalid_token",
                resource="/api/auth/refresh",
                success=False
            )

            raise enhanced_auth_error(
                "Invalid refresh token",
                status.HTTP_401_UNAUTHORIZED,
                error_code="INVALID_REFRESH_TOKEN"
            )

        # Mock token refresh success
        return create_auth_response(
            success=True,
            message="Token refreshed successfully"
        )

    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
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
    Logout user and invalidate tokens with enhanced security
    """
    try:
        # Revoke current session
        enhanced_auth.revoke_session(current_user.session_id)
        
        # In production, also revoke all refresh tokens for the user
        # await db.execute(
        #     delete(RefreshToken).where(RefreshToken.user_id == current_user.id)
        # )
        # await db.commit()
        
        # Log successful logout
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=current_user.ip_address,
            user_agent="",
            action="logout_successful",
            resource="/api/auth/logout",
            success=True,
            metadata={"session_id": current_user.session_id}
        )
        
        return create_auth_response(
            success=True,
            message="Logout successful"
        )
        
    except Exception as e:
        raise create_auth_error_response(
            "Logout failed",
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/logout", response_model=AuthResponse, summary="User logout")
async def logout(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout user and invalidate tokens with enhanced security
    """
    try:
        # Revoke current session
        enhanced_auth.revoke_session(current_user.session_id)
        
        # In production, also revoke all refresh tokens for the user
        # await db.execute(
        #     delete(RefreshToken).where(RefreshToken.user_id == current_user.id)
        # )
        # await db.commit()
        
        # Log successful logout
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=current_user.ip_address,
            user_agent="",
            action="logout_successful",
            resource="/api/auth/logout",
            success=True,
            metadata={"session_id": current_user.session_id}
        )
        
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
    Get current authenticated user information with enhanced security context
    """
    try:
        # Get full user details from database (mock implementation)
        # user = await db.execute(
        #     select(User).where(User.id == current_user.id)
        # )
        # user = user.scalar_one_or_none()
        # if not user:
        #     raise enhanced_auth_error("User not found", status.HTTP_404_NOT_FOUND)
        
        # Log user info access
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=current_user.ip_address,
            user_agent="",
            action="user_info_accessed",
            resource="/api/auth/me",
            success=True,
            metadata={"session_id": current_user.session_id}
        )
        
        # Enhanced user data with security context
        user_data = {
            'id': current_user.id,
            'email': current_user.email,
            'role': current_user.role.value,
            'permissions': current_user.permissions,
            'securityLevel': current_user.security_level.value,
            'sessionId': current_user.session_id,
            'lastActivity': current_user.last_activity,
            'firstName': 'John',  # Replace with actual database data
            'lastName': 'Doe',    # Replace with actual database data
            'company': 'BiteBase' # Replace with actual database data
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
    Verify JWT token validity with enhanced security validation
    """
    # Log token verification
    create_security_audit_log(
        user_id=current_user.id,
        ip_address=current_user.ip_address,
        user_agent="",
        action="token_verification",
        resource="/api/auth/verify",
        success=True,
        metadata={"session_id": current_user.session_id}
    )
    
    return create_auth_response(
        success=True,
        message="Token is valid",
        data={
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'role': current_user.role.value,
                'permissions': current_user.permissions,
                'securityLevel': current_user.security_level.value,
                'sessionId': current_user.session_id
            },
            'tokenInfo': {
                'lastActivity': current_user.last_activity,
                'ipAddress': current_user.ip_address
            }
        }
    )

@router.post("/forgot-password", response_model=AuthResponse, summary="Request password reset")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset email
    """
    try:
        # In production, check if user exists and send reset email
        # For now, return success regardless to prevent email enumeration

        # Mock implementation - in production:
        # 1. Check if user exists
        # 2. Generate secure reset token
        # 3. Store token with expiration
        # 4. Send email with reset link

        create_security_audit_log(
            user_id=None,
            ip_address="unknown",
            user_agent="",
            action="password_reset_requested",
            resource="/api/auth/forgot-password",
            success=True,
            metadata={"email": request.email}
        )

        return create_auth_response(
            success=True,
            message="If an account with this email exists, a password reset link has been sent"
        )

    except Exception as e:
        logger.error(f"Forgot password error: {str(e)}")
        raise create_auth_error_response(
            "Failed to process password reset request",
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/reset-password", response_model=AuthResponse, summary="Reset password")
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset password using reset token
    """
    try:
        # In production:
        # 1. Verify reset token
        # 2. Check token expiration
        # 3. Update user password
        # 4. Invalidate all user sessions

        # Mock implementation
        mock_token_valid = True  # Replace with actual token verification

        if not mock_token_valid:
            raise create_auth_error_response(
                "Invalid or expired reset token",
                status.HTTP_400_BAD_REQUEST
            )

        # Mock password update
        # hashed_password = enhanced_auth.hash_password(request.password)
        # await db.execute(
        #     update(User)
        #     .where(User.id == user_id_from_token)
        #     .values(password_hash=hashed_password)
        # )

        create_security_audit_log(
            user_id="mock_user_id",
            ip_address="unknown",
            user_agent="",
            action="password_reset_completed",
            resource="/api/auth/reset-password",
            success=True,
            metadata={"token_used": True}
        )

        return create_auth_response(
            success=True,
            message="Password has been reset successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password error: {str(e)}")
        raise create_auth_error_response(
            "Failed to reset password",
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/verify-email", response_model=AuthResponse, summary="Verify email address")
async def verify_email(
    request: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify user email address using verification token
    """
    try:
        # In production:
        # 1. Verify email verification token
        # 2. Check token expiration
        # 3. Mark user email as verified

        # Mock implementation
        mock_token_valid = True  # Replace with actual token verification

        if not mock_token_valid:
            raise create_auth_error_response(
                "Invalid or expired verification token",
                status.HTTP_400_BAD_REQUEST
            )

        # Mock email verification
        # await db.execute(
        #     update(User)
        #     .where(User.id == user_id_from_token)
        #     .values(email_verified=True, email_verified_at=datetime.utcnow())
        # )

        create_security_audit_log(
            user_id="mock_user_id",
            ip_address="unknown",
            user_agent="",
            action="email_verified",
            resource="/api/auth/verify-email",
            success=True,
            metadata={"token_used": True}
        )

        return create_auth_response(
            success=True,
            message="Email has been verified successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification error: {str(e)}")
        raise create_auth_error_response(
            "Failed to verify email",
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.get("/profile", response_model=AuthResponse, summary="Get user profile")
async def get_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user profile information
    """
    try:
        # In production, get full user details from database
        # user = await db.execute(
        #     select(User).where(User.id == current_user.id)
        # )
        # user = user.scalar_one_or_none()

        # Mock user profile data
        profile_data = {
            'id': current_user.id,
            'email': current_user.email,
            'firstName': 'John',  # Replace with actual data
            'lastName': 'Doe',    # Replace with actual data
            'company': 'BiteBase', # Replace with actual data
            'phone': '+1234567890', # Replace with actual data
            'role': current_user.role.value,
            'emailVerified': True,  # Replace with actual data
            'createdAt': '2024-01-01T00:00:00Z',  # Replace with actual data
            'lastLoginAt': current_user.last_activity
        }

        return create_auth_response(
            success=True,
            message="Profile retrieved successfully",
            data={'profile': profile_data}
        )

    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        raise create_auth_error_response(
            "Failed to retrieve profile",
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.patch("/profile", response_model=AuthResponse, summary="Update user profile")
async def update_profile(
    request: UpdateProfileRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user profile information
    """
    try:
        # In production, update user details in database
        update_data = {}
        if request.firstName is not None:
            update_data['first_name'] = request.firstName
        if request.lastName is not None:
            update_data['last_name'] = request.lastName
        if request.company is not None:
            update_data['company'] = request.company
        if request.phone is not None:
            update_data['phone'] = request.phone

        # Mock update implementation
        # if update_data:
        #     await db.execute(
        #         update(User)
        #         .where(User.id == current_user.id)
        #         .values(**update_data)
        #     )
        #     await db.commit()

        # Mock updated profile data
        updated_profile = {
            'id': current_user.id,
            'email': current_user.email,
            'firstName': request.firstName or 'John',
            'lastName': request.lastName or 'Doe',
            'company': request.company or 'BiteBase',
            'phone': request.phone or '+1234567890',
            'role': current_user.role.value,
            'emailVerified': True,
            'updatedAt': datetime.utcnow().isoformat()
        }

        create_security_audit_log(
            user_id=current_user.id,
            ip_address=current_user.ip_address,
            user_agent="",
            action="profile_updated",
            resource="/api/auth/profile",
            success=True,
            metadata={"fields_updated": list(update_data.keys())}
        )

        return create_auth_response(
            success=True,
            message="Profile updated successfully",
            data={'profile': updated_profile}
        )

    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        raise create_auth_error_response(
            "Failed to update profile",
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )