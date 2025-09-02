"""
Enhanced Authentication System for BiteBase Intelligence API
Secure JWT implementation with comprehensive security features
"""

import secrets
import json
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status, Request
from passlib.context import CryptContext
from pydantic import BaseModel
from enum import Enum
import redis

from app.core.config import settings
from app.core.security import (
    security_validator, 
    create_security_audit_log, 
    SecurityLevel
)

# Enhanced password hashing context
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__rounds=12  # Stronger hashing
)

# Token blacklist (in production, use Redis or database)
token_blacklist: set = set()

# Redis connection for token management
try:
    redis_client = redis.from_url(settings.get_redis_url())
except Exception:
    redis_client = None

class TokenType(str, Enum):
    """Types of JWT tokens"""
    ACCESS = "access"
    REFRESH = "refresh"
    PASSWORD_RESET = "password_reset"
    EMAIL_VERIFICATION = "email_verification"

class UserRole(str, Enum):
    """User roles with permission levels"""
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    GUEST = "guest"

class TokenPayload(BaseModel):
    """JWT token payload structure"""
    sub: str  # Subject (user ID)
    email: str
    role: UserRole
    token_type: TokenType
    session_id: str
    permissions: List[str] = []
    iat: datetime
    exp: datetime
    jti: Optional[str] = None  # JWT ID for revocation

class AuthSession(BaseModel):
    """User authentication session"""
    session_id: str
    user_id: str
    ip_address: str
    user_agent: str
    created_at: datetime
    last_activity: datetime
    is_active: bool = True
    security_level: SecurityLevel = SecurityLevel.MEDIUM

class EnhancedAuthUtils:
    """Enhanced authentication utilities with comprehensive security features"""
    
    def __init__(self):
        self.active_sessions: Dict[str, AuthSession] = {}
        self.token_cache: Dict[str, TokenPayload] = {}
    
    def generate_session_id(self) -> str:
        """Generate secure session identifier"""
        return secrets.token_urlsafe(32)
    
    def generate_token(
        self, 
        user_id: str, 
        email: str, 
        role: UserRole = UserRole.USER,
        permissions: List[str] = None,
        token_type: TokenType = TokenType.ACCESS,
        session_id: str = None
    ) -> Dict[str, Any]:
        """
        Generate enhanced JWT token with security features
        
        Args:
            user_id: User ID
            email: User email
            role: User role
            permissions: List of permissions
            token_type: Type of token to generate
            session_id: Session identifier
            
        Returns:
            Dictionary with token and metadata
        """
        now = datetime.now(timezone.utc)
        session_id = session_id or self.generate_session_id()
        jti = secrets.token_urlsafe(16)  # JWT ID for revocation
        
        # Determine expiration based on token type
        if token_type == TokenType.ACCESS:
            expires_in = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        elif token_type == TokenType.REFRESH:
            expires_in = timedelta(minutes=settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES)
        elif token_type == TokenType.PASSWORD_RESET:
            expires_in = timedelta(hours=1)
        elif token_type == TokenType.EMAIL_VERIFICATION:
            expires_in = timedelta(days=7)
        else:
            expires_in = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        
        exp = now + expires_in
        
        payload = {
            'sub': user_id,
            'email': email,
            'role': role.value,
            'token_type': token_type.value,
            'session_id': session_id,
            'permissions': permissions or [],
            'iat': int(now.timestamp()),
            'exp': int(exp.timestamp()),
            'jti': jti,
            'iss': 'bitebase-intelligence',  # Issuer
            'aud': 'bitebase-api'  # Audience
        }
        
        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        
        # Cache token payload
        token_payload = TokenPayload(
            sub=user_id,
            email=email,
            role=role,
            token_type=token_type,
            session_id=session_id,
            permissions=permissions or [],
            iat=now,
            exp=exp,
            jti=jti
        )
        
        self.token_cache[jti] = token_payload
        
        # Store in Redis if available
        if redis_client:
            try:
                redis_client.setex(
                    f"token:{jti}",
                    int(expires_in.total_seconds()),
                    json.dumps({
                        'user_id': user_id,
                        'session_id': session_id,
                        'token_type': token_type.value,
                        'created_at': now.isoformat()
                    })
                )
            except Exception:
                pass  # Fallback to memory cache
        
        return {
            'token': token,
            'expires_at': exp.isoformat(),
            'expires_in': int(expires_in.total_seconds()),
            'token_type': token_type.value,
            'session_id': session_id,
            'jti': jti
        }
    
    def generate_token_pair(
        self, 
        user_id: str, 
        email: str, 
        role: UserRole = UserRole.USER,
        permissions: List[str] = None,
        session_id: str = None
    ) -> Dict[str, Any]:
        """Generate access and refresh token pair"""
        session_id = session_id or self.generate_session_id()
        
        access_token = self.generate_token(
            user_id, email, role, permissions, TokenType.ACCESS, session_id
        )
        refresh_token = self.generate_token(
            user_id, email, role, permissions, TokenType.REFRESH, session_id
        )
        
        return {
            'access_token': access_token['token'],
            'refresh_token': refresh_token['token'],
            'access_expires_at': access_token['expires_at'],
            'refresh_expires_at': refresh_token['expires_at'],
            'session_id': session_id,
            'token_type': 'Bearer'
        }
    
    def verify_token(
        self, 
        token: str, 
        expected_type: TokenType = TokenType.ACCESS,
        check_blacklist: bool = True
    ) -> Optional[TokenPayload]:
        """
        Enhanced token verification with security checks
        
        Args:
            token: JWT token string
            expected_type: Expected token type
            check_blacklist: Whether to check token blacklist
            
        Returns:
            Decoded token payload or None if invalid
        """
        try:
            # Decode token
            payload = jwt.decode(
                token, 
                settings.JWT_SECRET_KEY, 
                algorithms=[settings.JWT_ALGORITHM],
                audience='bitebase-api',
                issuer='bitebase-intelligence'
            )
            
            # Check token type
            if payload.get('token_type') != expected_type.value:
                return None
            
            # Check if token is blacklisted
            if check_blacklist:
                jti = payload.get('jti')
                if jti:
                    if jti in token_blacklist:
                        return None
                    
                    # Check Redis blacklist
                    if redis_client:
                        try:
                            if redis_client.get(f"blacklist:{jti}"):
                                return None
                        except Exception:
                            pass
            
            # Convert to TokenPayload
            token_payload = TokenPayload(
                sub=payload['sub'],
                email=payload['email'],
                role=UserRole(payload['role']),
                token_type=TokenType(payload['token_type']),
                session_id=payload['session_id'],
                permissions=payload.get('permissions', []),
                iat=datetime.fromtimestamp(payload['iat'], tz=timezone.utc),
                exp=datetime.fromtimestamp(payload['exp'], tz=timezone.utc),
                jti=payload.get('jti')
            )
            
            # Check if token is expired
            if token_payload.exp < datetime.now(timezone.utc):
                return None
            
            return token_payload
            
        except JWTError:
            return None
        except (ValueError, KeyError):
            return None
    
    def hash_password(self, password: str) -> str:
        """
        Enhanced password hashing with validation
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password string
            
        Raises:
            HTTPException: If password doesn't meet security requirements
        """
        # Validate password strength
        validation_result = security_validator.validate_password_strength(password)
        if not validation_result['valid']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    'error': 'Password does not meet security requirements',
                    'issues': validation_result['issues'],
                    'strength_score': validation_result['score']
                }
            )
        
        return pwd_context.hash(password)
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """
        Verify password against hash with timing attack protection
        
        Args:
            password: Plain text password
            hashed_password: Hashed password from database
            
        Returns:
            True if password matches, False otherwise
        """
        try:
            return pwd_context.verify(password, hashed_password)
        except Exception:
            # If verification fails, still perform a dummy hash to prevent timing attacks
            pwd_context.hash("dummy_password")
            return False
    
    def extract_token_from_header(self, authorization: Optional[str]) -> Optional[str]:
        """
        Extract token from Authorization header with enhanced validation
        
        Args:
            authorization: Authorization header value
            
        Returns:
            Token string or None if invalid format
        """
        if not authorization:
            return None
        
        # Check for Bearer token format
        if not authorization.startswith('Bearer '):
            return None
        
        token = authorization[7:]  # Remove 'Bearer ' prefix
        
        # Basic token format validation
        if not token or len(token) < 10:  # JWT tokens should be much longer
            return None
        
        # Check for suspicious patterns
        if any(char in token for char in [' ', '\n', '\r', '\t']):
            return None
        
        return token
    
    def revoke_token(self, token: str) -> bool:
        """
        Revoke a token by adding it to blacklist
        
        Args:
            token: JWT token to revoke
            
        Returns:
            True if successfully revoked
        """
        try:
            payload = jwt.decode(
                token, 
                settings.JWT_SECRET_KEY, 
                algorithms=[settings.JWT_ALGORITHM],
                options={"verify_exp": False}  # Allow expired tokens for revocation
            )
            
            jti = payload.get('jti')
            if not jti:
                return False
            
            # Add to memory blacklist
            token_blacklist.add(jti)
            
            # Add to Redis blacklist if available
            if redis_client:
                try:
                    # Store with original expiration time
                    exp_timestamp = payload.get('exp', 0)
                    current_timestamp = int(datetime.now(timezone.utc).timestamp())
                    ttl = max(1, exp_timestamp - current_timestamp)
                    
                    redis_client.setex(f"blacklist:{jti}", ttl, "revoked")
                except Exception:
                    pass
            
            return True
            
        except Exception:
            return False
    
    def revoke_session(self, session_id: str) -> int:
        """
        Revoke all tokens for a specific session
        
        Args:
            session_id: Session ID to revoke
            
        Returns:
            Number of tokens revoked
        """
        revoked_count = 0
        
        # Remove from active sessions
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
        
        # Mark session as revoked in Redis
        if redis_client:
            try:
                redis_client.setex(f"revoked_session:{session_id}", 86400, "revoked")
            except Exception:
                pass
        
        return revoked_count
    
    def create_session(
        self, 
        user_id: str, 
        ip_address: str, 
        user_agent: str,
        security_level: SecurityLevel = SecurityLevel.MEDIUM
    ) -> AuthSession:
        """
        Create new authentication session
        
        Args:
            user_id: User ID
            ip_address: Client IP address
            user_agent: Client user agent
            security_level: Required security level
            
        Returns:
            New authentication session
        """
        session_id = self.generate_session_id()
        now = datetime.now(timezone.utc)
        
        session = AuthSession(
            session_id=session_id,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=now,
            last_activity=now,
            security_level=security_level
        )
        
        self.active_sessions[session_id] = session
        
        # Store in Redis if available
        if redis_client:
            try:
                redis_client.setex(
                    f"session:{session_id}",
                    settings.SESSION_EXPIRE_MINUTES * 60,
                    json.dumps({
                        'user_id': user_id,
                        'ip_address': ip_address,
                        'user_agent': user_agent,
                        'created_at': now.isoformat(),
                        'security_level': security_level.value
                    })
                )
            except Exception:
                pass
        
        return session
    
    def validate_session(self, session_id: str, ip_address: str) -> bool:
        """
        Validate session and check for security issues
        
        Args:
            session_id: Session ID to validate
            ip_address: Current client IP
            
        Returns:
            True if session is valid
        """
        # Check if session is revoked
        if redis_client:
            try:
                if redis_client.get(f"revoked_session:{session_id}"):
                    return False
            except Exception:
                pass
        
        session = self.active_sessions.get(session_id)
        if not session or not session.is_active:
            return False
        
        # Check for IP address change (potential session hijacking)
        if session.ip_address != ip_address:
            # Log security event
            create_security_audit_log(
                user_id=session.user_id,
                ip_address=ip_address,
                user_agent="",
                action="ip_address_change",
                resource="session",
                success=False,
                metadata={
                    'session_id': session_id,
                    'original_ip': session.ip_address,
                    'new_ip': ip_address
                }
            )
            
            # Revoke session for security
            self.revoke_session(session_id)
            return False
        
        # Update last activity
        session.last_activity = datetime.now(timezone.utc)
        return True

class AuthError:
    """Enhanced authentication error messages"""
    NO_TOKEN = "No authentication token provided"
    INVALID_TOKEN = "Invalid or expired token"
    MALFORMED_TOKEN = "Malformed authentication token"
    TOKEN_EXPIRED = "Authentication token has expired"
    TOKEN_REVOKED = "Authentication token has been revoked"
    INVALID_CREDENTIALS = "Invalid email or password"
    ACCOUNT_LOCKED = "Account is temporarily locked due to failed login attempts"
    ACCOUNT_DISABLED = "Account has been disabled"
    AUTHENTICATION_FAILED = "Authentication failed"
    INSUFFICIENT_PERMISSIONS = "Insufficient permissions for this operation"
    AUTHENTICATION_REQUIRED = "Authentication required"
    SESSION_INVALID = "Invalid or expired session"
    SESSION_HIJACKED = "Potential session hijacking detected"
    PASSWORD_WEAK = "Password does not meet security requirements"
    IP_NOT_ALLOWED = "Access from this IP address is not allowed"
    SUSPICIOUS_ACTIVITY = "Suspicious activity detected"

def create_auth_response(
    success: bool, 
    message: str, 
    data: Optional[Dict] = None,
    metadata: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Create standardized authentication response with enhanced metadata
    
    Args:
        success: Operation success status
        message: Response message
        data: Optional response data
        metadata: Optional metadata (security info, etc.)
        
    Returns:
        Formatted response dictionary
    """
    response = {
        'success': success,
        'message': message,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'version': '2.0'  # API version for client compatibility
    }
    
    if data:
        response['data'] = data
    
    if metadata:
        response['metadata'] = metadata
        
    return response

def create_auth_error_response(
    message: str, 
    status_code: int = 401, 
    error_code: str = None,
    retry_after: int = None
) -> HTTPException:
    """
    Create enhanced authentication error response
    
    Args:
        message: Error message
        status_code: HTTP status code
        error_code: Specific error code for client handling
        retry_after: Seconds to wait before retry
        
    Returns:
        HTTPException with formatted error
    """
    error_detail = create_auth_response(
        False, 
        message,
        metadata={
            'error_code': error_code,
            'retry_after': retry_after
        } if error_code or retry_after else None
    )
    
    headers = {}
    if retry_after:
        headers['Retry-After'] = str(retry_after)
    
    return HTTPException(
        status_code=status_code,
        detail=error_detail,
        headers=headers if headers else None
    )

# Global enhanced auth utilities instance
enhanced_auth = EnhancedAuthUtils()