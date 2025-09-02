"""
Enhanced Dependencies for BiteBase Intelligence API
Secure request validation and authentication middleware
"""

from typing import Optional, Dict, Any, List
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.core.enhanced_auth import (
    enhanced_auth, 
    AuthError, 
    TokenType, 
    UserRole, 
    TokenPayload,
    create_auth_error_response
)
from app.core.security import (
    security_validator,
    create_security_audit_log,
    SecurityLevel,
    rate_limiter,
    account_lockout
)
from app.core.config import settings

security = HTTPBearer(auto_error=False)

class CurrentUser(BaseModel):
    """Current authenticated user information"""
    id: str
    email: str
    role: UserRole
    permissions: List[str] = []
    session_id: str
    security_level: SecurityLevel = SecurityLevel.MEDIUM
    ip_address: str
    last_activity: str

class SecurityContext(BaseModel):
    """Security context for requests"""
    user: Optional[CurrentUser]
    ip_address: str
    user_agent: str
    request_id: str
    risk_score: float = 0.0
    suspicious_activity: bool = False

async def get_request_info(request: Request) -> Dict[str, str]:
    """Extract request information for security validation"""
    # Get client IP address with proxy support
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        ip_address = forwarded_for.split(",")[0].strip()
    else:
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            ip_address = real_ip
        else:
            ip_address = request.client.host if request.client else "unknown"
    
    user_agent = request.headers.get("user-agent", "")
    request_id = request.headers.get("x-request-id", "unknown")
    
    return {
        "ip_address": ip_address,
        "user_agent": user_agent,
        "request_id": request_id
    }

async def verify_rate_limit(request: Request) -> None:
    """Verify request doesn't exceed rate limits"""
    if not settings.RATE_LIMIT_ENABLED:
        return
    
    allowed, rate_info = rate_limiter.is_allowed(request)
    if not allowed:
        # Log rate limit violation
        request_info = await get_request_info(request)
        create_security_audit_log(
            user_id=None,
            ip_address=request_info["ip_address"],
            user_agent=request_info["user_agent"],
            action="rate_limit_exceeded",
            resource=request.url.path,
            success=False,
            metadata=rate_info
        )
        
        retry_after = rate_info.get('retry_after', 60)
        raise create_auth_error_response(
            "Rate limit exceeded", 
            status.HTTP_429_TOO_MANY_REQUESTS,
            error_code="RATE_LIMIT_EXCEEDED",
            retry_after=retry_after
        )

async def check_account_lockout(identifier: str) -> None:
    """Check if account is locked due to failed attempts"""
    is_locked, seconds_remaining = account_lockout.is_locked(identifier)
    if is_locked:
        raise create_auth_error_response(
            AuthError.ACCOUNT_LOCKED,
            status.HTTP_423_LOCKED,
            error_code="ACCOUNT_LOCKED",
            retry_after=seconds_remaining
        )

async def get_current_user_optional(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[CurrentUser]:
    """Get current user information (optional authentication)"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(request, credentials)
    except HTTPException:
        return None

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> CurrentUser:
    """Get current authenticated user with comprehensive validation"""
    
    # Verify rate limits first
    await verify_rate_limit(request)
    
    # Get request information
    request_info = await get_request_info(request)
    
    if not credentials:
        create_security_audit_log(
            user_id=None,
            ip_address=request_info["ip_address"],
            user_agent=request_info["user_agent"],
            action="no_token_provided",
            resource=request.url.path,
            success=False
        )
        raise create_auth_error_response(
            AuthError.NO_TOKEN,
            error_code="NO_TOKEN"
        )
    
    # Verify token format
    token = enhanced_auth.extract_token_from_header(f"Bearer {credentials.credentials}")
    if not token:
        create_security_audit_log(
            user_id=None,
            ip_address=request_info["ip_address"],
            user_agent=request_info["user_agent"],
            action="malformed_token",
            resource=request.url.path,
            success=False
        )
        raise create_auth_error_response(
            AuthError.MALFORMED_TOKEN,
            error_code="MALFORMED_TOKEN"
        )
    
    # Verify and decode token
    token_payload = enhanced_auth.verify_token(token, TokenType.ACCESS)
    if not token_payload:
        create_security_audit_log(
            user_id=None,
            ip_address=request_info["ip_address"],
            user_agent=request_info["user_agent"],
            action="invalid_token",
            resource=request.url.path,
            success=False,
            metadata={"token_length": len(token)}
        )
        raise create_auth_error_response(
            AuthError.INVALID_TOKEN,
            error_code="INVALID_TOKEN"
        )
    
    # Check account lockout
    await check_account_lockout(token_payload.email)
    
    # Validate session
    if not enhanced_auth.validate_session(token_payload.session_id, request_info["ip_address"]):
        create_security_audit_log(
            user_id=token_payload.sub,
            ip_address=request_info["ip_address"],
            user_agent=request_info["user_agent"],
            action="invalid_session",
            resource=request.url.path,
            success=False,
            metadata={"session_id": token_payload.session_id}
        )
        raise create_auth_error_response(
            AuthError.SESSION_INVALID,
            error_code="SESSION_INVALID"
        )
    
    # Calculate security risk score
    risk_score = security_validator.calculate_risk_score(
        token_payload.sub,
        request_info["ip_address"],
        request_info["user_agent"],
        request.url.path
    )
    
    # Check for high-risk activities
    if risk_score > 75.0:
        create_security_audit_log(
            user_id=token_payload.sub,
            ip_address=request_info["ip_address"],
            user_agent=request_info["user_agent"],
            action="high_risk_activity",
            resource=request.url.path,
            success=False,
            metadata={"risk_score": risk_score}
        )
        
        # For very high risk, require additional verification
        if risk_score > 90.0:
            raise create_auth_error_response(
                AuthError.SUSPICIOUS_ACTIVITY,
                status.HTTP_403_FORBIDDEN,
                error_code="SUSPICIOUS_ACTIVITY"
            )
    
    # Log successful authentication
    create_security_audit_log(
        user_id=token_payload.sub,
        ip_address=request_info["ip_address"],
        user_agent=request_info["user_agent"],
        action="successful_authentication",
        resource=request.url.path,
        success=True,
        metadata={"risk_score": risk_score}
    )
    
    return CurrentUser(
        id=token_payload.sub,
        email=token_payload.email,
        role=token_payload.role,
        permissions=token_payload.permissions,
        session_id=token_payload.session_id,
        security_level=SecurityLevel.MEDIUM,
        ip_address=request_info["ip_address"],
        last_activity=token_payload.iat.isoformat()
    )

def require_role(required_role: UserRole):
    """Dependency to require specific user role"""
    async def role_checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        # Define role hierarchy
        role_hierarchy = {
            UserRole.GUEST: 0,
            UserRole.USER: 1,
            UserRole.MANAGER: 2,
            UserRole.ADMIN: 3
        }
        
        user_level = role_hierarchy.get(current_user.role, 0)
        required_level = role_hierarchy.get(required_role, 0)
        
        if user_level < required_level:
            create_security_audit_log(
                user_id=current_user.id,
                ip_address=current_user.ip_address,
                user_agent="",
                action="insufficient_permissions",
                resource="role_check",
                success=False,
                metadata={
                    "required_role": required_role.value,
                    "user_role": current_user.role.value
                }
            )
            raise create_auth_error_response(
                AuthError.INSUFFICIENT_PERMISSIONS,
                status.HTTP_403_FORBIDDEN,
                error_code="INSUFFICIENT_PERMISSIONS"
            )
        
        return current_user
    
    return role_checker

def require_permission(required_permission: str):
    """Dependency to require specific permission"""
    async def permission_checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if required_permission not in current_user.permissions:
            # Check if admin role bypasses permission checks
            if current_user.role != UserRole.ADMIN:
                create_security_audit_log(
                    user_id=current_user.id,
                    ip_address=current_user.ip_address,
                    user_agent="",
                    action="insufficient_permissions",
                    resource="permission_check",
                    success=False,
                    metadata={
                        "required_permission": required_permission,
                        "user_permissions": current_user.permissions
                    }
                )
                raise create_auth_error_response(
                    AuthError.INSUFFICIENT_PERMISSIONS,
                    status.HTTP_403_FORBIDDEN,
                    error_code="INSUFFICIENT_PERMISSIONS"
                )
        
        return current_user
    
    return permission_checker

async def get_security_context(
    request: Request,
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional)
) -> SecurityContext:
    """Get comprehensive security context for the request"""
    request_info = await get_request_info(request)
    
    # Calculate risk score
    risk_score = 0.0
    if current_user:
        risk_score = security_validator.calculate_risk_score(
            current_user.id,
            request_info["ip_address"],
            request_info["user_agent"],
            request.url.path
        )
    else:
        # Anonymous request risk assessment
        risk_score = security_validator.calculate_risk_score(
            None,
            request_info["ip_address"],
            request_info["user_agent"],
            request.url.path
        )
    
    return SecurityContext(
        user=current_user,
        ip_address=request_info["ip_address"],
        user_agent=request_info["user_agent"],
        request_id=request_info["request_id"],
        risk_score=risk_score,
        suspicious_activity=risk_score > 75.0
    )

# Role-based dependencies
require_admin = require_role(UserRole.ADMIN)
require_manager = require_role(UserRole.MANAGER)
require_user = require_role(UserRole.USER)

# Common permission dependencies
def require_read_access():
    return require_permission("read")

def require_write_access():
    return require_permission("write")

def require_admin_access():
    return require_permission("admin")

def require_analytics_access():
    return require_permission("analytics")

def require_ai_access():
    return require_permission("ai")