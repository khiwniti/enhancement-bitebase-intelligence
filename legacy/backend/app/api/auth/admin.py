"""
Admin endpoints for BiteBase Intelligence API
Enhanced security with role-based access control and comprehensive audit logging
"""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enhanced_auth import enhanced_auth, UserRole, create_auth_error_response
from app.core.enhanced_dependencies import (
    get_current_user, 
    CurrentUser, 
    require_admin, 
    require_manager,
    require_admin_access,
    get_security_context,
    SecurityContext
)
from app.core.security import create_security_audit_log
from app.core.database import get_db

router = APIRouter()

# Request Models
class UserManagementRequest(BaseModel):
    user_id: str = Field(..., description="Target user ID")
    action: str = Field(..., description="Management action")
    reason: Optional[str] = Field(None, description="Reason for action")

class RoleUpdateRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    new_role: UserRole = Field(..., description="New user role")
    reason: str = Field(..., description="Reason for role change")

class PermissionUpdateRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    permissions: List[str] = Field(..., description="New permissions list")
    reason: str = Field(..., description="Reason for permission change")

class SessionManagementRequest(BaseModel):
    user_id: Optional[str] = Field(None, description="User ID (optional)")
    session_id: Optional[str] = Field(None, description="Session ID (optional)")
    action: str = Field(..., description="Session action: revoke, revoke_all")

# Response Models
class AdminResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    timestamp: str
    security_context: dict

@router.get("/users", response_model=AdminResponse, summary="List all users")
async def list_users(
    request: Request,
    current_user: CurrentUser = Depends(require_admin),
    security_context: SecurityContext = Depends(get_security_context),
    db: AsyncSession = Depends(get_db)
):
    """
    List all users in the system (Admin only)
    Includes comprehensive security audit logging
    """
    try:
        # Log admin access
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=security_context.ip_address,
            user_agent=security_context.user_agent,
            action="admin_list_users",
            resource="/api/auth/admin/users",
            success=True,
            metadata={
                "admin_user": current_user.email,
                "security_level": current_user.security_level.value,
                "risk_score": security_context.risk_score
            }
        )
        
        # Get users from database (mock implementation)
        # users = await db.execute(select(User))
        # users_list = users.scalars().all()
        
        # Mock users data
        users_data = [
            {
                "id": "user_123",
                "email": "user1@example.com",
                "role": UserRole.USER.value,
                "firstName": "John",
                "lastName": "Doe",
                "active": True,
                "lastLogin": "2024-01-15T10:30:00Z"
            },
            {
                "id": "user_456",
                "email": "manager@example.com",
                "role": UserRole.MANAGER.value,
                "firstName": "Jane",
                "lastName": "Smith",
                "active": True,
                "lastLogin": "2024-01-16T09:15:00Z"
            }
        ]
        
        return {
            "success": True,
            "message": "Users retrieved successfully",
            "data": {"users": users_data, "total": len(users_data)},
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "security_context": {
                "admin_id": current_user.id,
                "risk_score": security_context.risk_score,
                "session_id": current_user.session_id
            }
        }
        
    except Exception as e:
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=security_context.ip_address,
            user_agent=security_context.user_agent,
            action="admin_list_users_failed",
            resource="/api/auth/admin/users",
            success=False,
            metadata={"error": str(e)}
        )
        
        raise create_auth_error_response(
            "Failed to retrieve users",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="ADMIN_OPERATION_FAILED"
        )

@router.put("/users/{user_id}/role", response_model=AdminResponse, summary="Update user role")
async def update_user_role(
    user_id: str,
    request: RoleUpdateRequest,
    current_user: CurrentUser = Depends(require_admin),
    security_context: SecurityContext = Depends(get_security_context),
    db: AsyncSession = Depends(get_db)
):
    """
    Update user role (Admin only)
    Requires comprehensive audit logging and validation
    """
    try:
        # Prevent self-role modification
        if user_id == current_user.id:
            create_security_audit_log(
                user_id=current_user.id,
                ip_address=security_context.ip_address,
                user_agent=security_context.user_agent,
                action="admin_self_role_change_attempted",
                resource=f"/api/auth/admin/users/{user_id}/role",
                success=False,
                metadata={"attempted_role": request.new_role.value}
            )
            
            raise create_auth_error_response(
                "Cannot modify your own role",
                status.HTTP_403_FORBIDDEN,
                error_code="SELF_ROLE_MODIFICATION"
            )
        
        # Get target user (mock implementation)
        # target_user = await db.execute(
        #     select(User).where(User.id == user_id)
        # )
        # target_user = target_user.scalar_one_or_none()
        # if not target_user:
        #     raise create_auth_error_response("User not found", status.HTTP_404_NOT_FOUND)
        
        # Mock user lookup
        target_user_exists = True  # Replace with actual database check
        if not target_user_exists:
            raise create_auth_error_response(
                "User not found", 
                status.HTTP_404_NOT_FOUND,
                error_code="USER_NOT_FOUND"
            )
        
        # Update user role (mock implementation)
        # target_user.role = request.new_role
        # await db.commit()
        
        # Log role change
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=security_context.ip_address,
            user_agent=security_context.user_agent,
            action="admin_role_change",
            resource=f"/api/auth/admin/users/{user_id}/role",
            success=True,
            metadata={
                "admin_user": current_user.email,
                "target_user_id": user_id,
                "new_role": request.new_role.value,
                "reason": request.reason,
                "risk_score": security_context.risk_score
            }
        )
        
        return {
            "success": True,
            "message": f"User role updated to {request.new_role.value}",
            "data": {
                "user_id": user_id,
                "new_role": request.new_role.value,
                "updated_by": current_user.email,
                "reason": request.reason
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "security_context": {
                "admin_id": current_user.id,
                "risk_score": security_context.risk_score
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=security_context.ip_address,
            user_agent=security_context.user_agent,
            action="admin_role_change_failed",
            resource=f"/api/auth/admin/users/{user_id}/role",
            success=False,
            metadata={"error": str(e), "target_user_id": user_id}
        )
        
        raise create_auth_error_response(
            "Failed to update user role",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="ROLE_UPDATE_FAILED"
        )

@router.post("/sessions/revoke", response_model=AdminResponse, summary="Revoke user sessions")
async def revoke_sessions(
    request: SessionManagementRequest,
    current_user: CurrentUser = Depends(require_admin),
    security_context: SecurityContext = Depends(get_security_context),
    db: AsyncSession = Depends(get_db)
):
    """
    Revoke user sessions (Admin only)
    Can revoke specific session or all sessions for a user
    """
    try:
        revoked_count = 0
        
        if request.action == "revoke" and request.session_id:
            # Revoke specific session
            revoked_count = enhanced_auth.revoke_session(request.session_id)
            action_description = f"Revoked session {request.session_id}"
            
        elif request.action == "revoke_all" and request.user_id:
            # Revoke all sessions for user (implementation would query all sessions)
            # sessions = await db.execute(
            #     select(AuthSession).where(AuthSession.user_id == request.user_id)
            # )
            # for session in sessions.scalars():
            #     enhanced_auth.revoke_session(session.session_id)
            #     revoked_count += 1
            
            # Mock implementation
            revoked_count = 3  # Simulating 3 revoked sessions
            action_description = f"Revoked all sessions for user {request.user_id}"
            
        else:
            raise create_auth_error_response(
                "Invalid session management request",
                status.HTTP_400_BAD_REQUEST,
                error_code="INVALID_REQUEST"
            )
        
        # Log session revocation
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=security_context.ip_address,
            user_agent=security_context.user_agent,
            action="admin_session_revoke",
            resource="/api/auth/admin/sessions/revoke",
            success=True,
            metadata={
                "admin_user": current_user.email,
                "target_user_id": request.user_id,
                "target_session_id": request.session_id,
                "action": request.action,
                "revoked_count": revoked_count,
                "risk_score": security_context.risk_score
            }
        )
        
        return {
            "success": True,
            "message": action_description,
            "data": {
                "revoked_count": revoked_count,
                "action": request.action,
                "target_user_id": request.user_id,
                "target_session_id": request.session_id
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "security_context": {
                "admin_id": current_user.id,
                "risk_score": security_context.risk_score
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=security_context.ip_address,
            user_agent=security_context.user_agent,
            action="admin_session_revoke_failed",
            resource="/api/auth/admin/sessions/revoke",
            success=False,
            metadata={"error": str(e)}
        )
        
        raise create_auth_error_response(
            "Failed to revoke sessions",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="SESSION_REVOKE_FAILED"
        )

@router.get("/audit-logs", response_model=AdminResponse, summary="Get security audit logs")
async def get_audit_logs(
    limit: int = 100,
    offset: int = 0,
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    current_user: CurrentUser = Depends(require_admin),
    security_context: SecurityContext = Depends(get_security_context),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve security audit logs (Admin only)
    Supports filtering by user_id and action type
    """
    try:
        # Log audit log access
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=security_context.ip_address,
            user_agent=security_context.user_agent,
            action="admin_audit_logs_access",
            resource="/api/auth/admin/audit-logs",
            success=True,
            metadata={
                "admin_user": current_user.email,
                "filters": {"user_id": user_id, "action": action},
                "limit": limit,
                "offset": offset,
                "risk_score": security_context.risk_score
            }
        )
        
        # Get audit logs from database (mock implementation)
        # query = select(SecurityAuditLog).order_by(SecurityAuditLog.timestamp.desc())
        # if user_id:
        #     query = query.where(SecurityAuditLog.user_id == user_id)
        # if action:
        #     query = query.where(SecurityAuditLog.action == action)
        # 
        # query = query.offset(offset).limit(limit)
        # logs = await db.execute(query)
        # logs_list = logs.scalars().all()
        
        # Mock audit logs
        mock_logs = [
            {
                "id": "log_1",
                "timestamp": "2024-01-16T10:30:00Z",
                "user_id": "user_123",
                "ip_address": "192.168.1.100",
                "action": "login_successful",
                "resource": "/api/auth/login",
                "success": True,
                "metadata": {"session_id": "sess_123"}
            },
            {
                "id": "log_2",
                "timestamp": "2024-01-16T10:25:00Z",
                "user_id": None,
                "ip_address": "192.168.1.200",
                "action": "login_failed_invalid_password",
                "resource": "/api/auth/login",
                "success": False,
                "metadata": {"email": "attacker@evil.com"}
            }
        ]
        
        return {
            "success": True,
            "message": "Audit logs retrieved successfully",
            "data": {
                "logs": mock_logs,
                "total": len(mock_logs),
                "limit": limit,
                "offset": offset
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "security_context": {
                "admin_id": current_user.id,
                "risk_score": security_context.risk_score
            }
        }
        
    except Exception as e:
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=security_context.ip_address,
            user_agent=security_context.user_agent,
            action="admin_audit_logs_access_failed",
            resource="/api/auth/admin/audit-logs",
            success=False,
            metadata={"error": str(e)}
        )
        
        raise create_auth_error_response(
            "Failed to retrieve audit logs",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="AUDIT_LOGS_FAILED"
        )

@router.get("/security-status", response_model=AdminResponse, summary="Get system security status")
async def get_security_status(
    current_user: CurrentUser = Depends(require_manager),  # Managers can view security status
    security_context: SecurityContext = Depends(get_security_context),
    db: AsyncSession = Depends(get_db)
):
    """
    Get comprehensive security status (Manager+ only)
    Includes active sessions, failed attempts, and system health
    """
    try:
        # Log security status access
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=security_context.ip_address,
            user_agent=security_context.user_agent,
            action="security_status_accessed",
            resource="/api/auth/admin/security-status",
            success=True,
            metadata={
                "user": current_user.email,
                "role": current_user.role.value,
                "risk_score": security_context.risk_score
            }
        )
        
        # Gather security metrics (mock implementation)
        # In production, query actual database for these metrics
        security_status = {
            "active_sessions": 15,
            "failed_login_attempts_24h": 3,
            "locked_accounts": 0,
            "high_risk_activities_24h": 1,
            "system_health": "good",
            "security_level": "high",
            "last_security_scan": "2024-01-16T08:00:00Z",
            "metrics": {
                "average_risk_score": 12.5,
                "suspicious_ips_blocked": 2,
                "rate_limit_violations_24h": 5
            }
        }
        
        return {
            "success": True,
            "message": "Security status retrieved successfully",
            "data": security_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "security_context": {
                "accessor_id": current_user.id,
                "accessor_role": current_user.role.value,
                "risk_score": security_context.risk_score
            }
        }
        
    except Exception as e:
        create_security_audit_log(
            user_id=current_user.id,
            ip_address=security_context.ip_address,
            user_agent=security_context.user_agent,
            action="security_status_access_failed",
            resource="/api/auth/admin/security-status",
            success=False,
            metadata={"error": str(e)}
        )
        
        raise create_auth_error_response(
            "Failed to retrieve security status",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="SECURITY_STATUS_FAILED"
        )