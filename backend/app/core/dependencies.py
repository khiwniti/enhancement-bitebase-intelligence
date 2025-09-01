"""
FastAPI dependencies for authentication and authorization
Based on Express.js middleware patterns from bitebase-backend-express
"""

from typing import Optional, List
from fastapi import Depends, HTTPException, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.auth import AuthUtils, AuthError, create_auth_error_response

# Security scheme for OpenAPI documentation
security = HTTPBearer()

class CurrentUser:
    """User information from JWT token"""
    def __init__(self, user_id: str, email: str, role: str):
        self.id = user_id
        self.email = email
        self.role = role

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> CurrentUser:
    """
    Dependency to get current authenticated user
    Equivalent to Express authenticate middleware
    
    Args:
        credentials: JWT credentials from Authorization header
        
    Returns:
        CurrentUser object with user information
        
    Raises:
        HTTPException: If authentication fails
    """
    if not credentials or not credentials.credentials:
        raise create_auth_error_response(AuthError.NO_TOKEN, status.HTTP_401_UNAUTHORIZED)
    
    token = credentials.credentials
    decoded = AuthUtils.verify_token(token)
    
    if not decoded:
        raise create_auth_error_response(AuthError.INVALID_TOKEN, status.HTTP_401_UNAUTHORIZED)
    
    # Validate required fields
    if not all(key in decoded for key in ['id', 'email']):
        raise create_auth_error_response(AuthError.INVALID_TOKEN, status.HTTP_401_UNAUTHORIZED)
    
    return CurrentUser(
        user_id=decoded['id'],
        email=decoded['email'],
        role=decoded.get('role', 'user')
    )

async def get_optional_user(
    authorization: Optional[str] = Header(None)
) -> Optional[CurrentUser]:
    """
    Dependency for optional authentication
    Equivalent to Express optionalAuth middleware
    
    Args:
        authorization: Authorization header (optional)
        
    Returns:
        CurrentUser object if valid token provided, None otherwise
    """
    if not authorization:
        return None
    
    token = AuthUtils.extract_token_from_header(authorization)
    if not token:
        return None
    
    decoded = AuthUtils.verify_token(token)
    if not decoded or not all(key in decoded for key in ['id', 'email']):
        return None
    
    return CurrentUser(
        user_id=decoded['id'],
        email=decoded['email'],
        role=decoded.get('role', 'user')
    )

def require_roles(*roles: str):
    """
    Dependency factory for role-based authorization
    Equivalent to Express authorize middleware
    
    Args:
        *roles: Required roles for access
        
    Returns:
        Dependency function that checks user roles
    """
    def role_checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in roles:
            raise create_auth_error_response(
                AuthError.INSUFFICIENT_PERMISSIONS, 
                status.HTTP_403_FORBIDDEN
            )
        return current_user
    
    return role_checker

def require_admin(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """
    Dependency to require admin role
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        CurrentUser if admin, raises exception otherwise
    """
    if current_user.role != 'admin':
        raise create_auth_error_response(
            AuthError.INSUFFICIENT_PERMISSIONS,
            status.HTTP_403_FORBIDDEN
        )
    return current_user

def require_any_role(*roles: str):
    """
    Dependency factory requiring any of the specified roles
    
    Args:
        *roles: Any of these roles grants access
        
    Returns:
        Dependency function that checks for any matching role
    """
    return require_roles(*roles)

def require_all_roles(*roles: str):
    """
    Dependency factory requiring all specified roles
    Note: This is for future extensibility when users might have multiple roles
    
    Args:
        *roles: All roles must be present
        
    Returns:
        Dependency function that checks for all roles
    """
    def role_checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        user_roles = [current_user.role]  # Currently single role, but extensible
        if not all(role in user_roles for role in roles):
            raise create_auth_error_response(
                AuthError.INSUFFICIENT_PERMISSIONS,
                status.HTTP_403_FORBIDDEN
            )
        return current_user
    
    return role_checker

# Common role dependencies for convenience
RequireUser = Depends(get_current_user)
RequireAdmin = Depends(require_admin)
RequireManagerOrAdmin = require_any_role('manager', 'admin')
RequireModeratorOrAdmin = require_any_role('moderator', 'admin')
OptionalAuth = Depends(get_optional_user)