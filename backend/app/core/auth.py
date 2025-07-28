"""
Authentication utilities for BiteBase Intelligence API
FastAPI implementation based on Express.js patterns from bitebase-backend-express
"""

import os
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from passlib.context import CryptContext

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRES_IN = timedelta(days=7)
REFRESH_TOKEN_EXPIRES_IN = timedelta(days=30)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthUtils:
    """Authentication utilities class for JWT and password management"""
    
    @staticmethod
    def generate_token(user_id: str, email: str, role: str = 'user') -> str:
        """
        Generate JWT access token
        
        Args:
            user_id: User ID
            email: User email
            role: User role (default: 'user')
            
        Returns:
            JWT token string
        """
        payload = {
            'id': user_id,
            'email': email,
            'role': role,
            'iat': datetime.now(timezone.utc),
            'exp': datetime.now(timezone.utc) + JWT_EXPIRES_IN
        }
        
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    @staticmethod
    def generate_refresh_token(user_id: str) -> str:
        """
        Generate JWT refresh token
        
        Args:
            user_id: User ID
            
        Returns:
            Refresh token string
        """
        payload = {
            'id': user_id,
            'type': 'refresh',
            'iat': datetime.now(timezone.utc),
            'exp': datetime.now(timezone.utc) + REFRESH_TOKEN_EXPIRES_IN
        }
        
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verify JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token payload or None if invalid
        """
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.PyJWTError:
            return None
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash password using bcrypt
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password string
        """
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """
        Verify password against hash
        
        Args:
            password: Plain text password
            hashed_password: Hashed password from database
            
        Returns:
            True if password matches, False otherwise
        """
        return pwd_context.verify(password, hashed_password)
    
    @staticmethod
    def extract_token_from_header(authorization: Optional[str]) -> Optional[str]:
        """
        Extract token from Authorization header
        
        Args:
            authorization: Authorization header value
            
        Returns:
            Token string or None if invalid format
        """
        if not authorization or not authorization.startswith('Bearer '):
            return None
        return authorization[7:]  # Remove 'Bearer ' prefix

class AuthError:
    """Authentication error messages"""
    NO_TOKEN = "No token provided"
    INVALID_TOKEN = "Invalid or expired token"
    AUTHENTICATION_FAILED = "Authentication failed"
    INSUFFICIENT_PERMISSIONS = "Insufficient permissions"
    AUTHENTICATION_REQUIRED = "Authentication required"

def create_auth_response(success: bool, message: str, data: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Create standardized authentication response
    
    Args:
        success: Operation success status
        message: Response message
        data: Optional response data
        
    Returns:
        Formatted response dictionary
    """
    response = {
        'success': success,
        'message': message,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }
    
    if data:
        response['data'] = data
        
    return response

def create_auth_error_response(message: str, status_code: int = 401) -> HTTPException:
    """
    Create standardized authentication error response
    
    Args:
        message: Error message
        status_code: HTTP status code
        
    Returns:
        HTTPException with formatted error
    """
    return HTTPException(
        status_code=status_code,
        detail=create_auth_response(False, message)
    )