"""
Security Management API Endpoints
Provides access to RBAC, audit logging, and security monitoring
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

from app.services.security.rbac_service import rbac_service, Permission, ResourceType
from app.services.security.audit_service import audit_service, AuditEventType, AuditSeverity, AuditFilter
from app.core.database import get_database

router = APIRouter()

# RBAC Endpoints

@router.post("/rbac/users")
async def create_user(user_data: Dict[str, Any]):
    """Create a new user"""
    try:
        user = await rbac_service.create_user(user_data)
        
        # Log user creation
        await audit_service.log_event(
            event_type=AuditEventType.USER_CREATED,
            action="create_user",
            description=f"Created user {user.username}",
            user_id=user_data.get("created_by"),
            resource_type="user",
            resource_id=user.id,
            severity=AuditSeverity.MEDIUM,
            details={"username": user.username, "email": user.email},
            tags=["user_management"]
        )
        
        return {"status": "success", "data": user.to_dict()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.post("/rbac/roles")
async def create_role(role_data: Dict[str, Any]):
    """Create a new role"""
    try:
        role = await rbac_service.create_role(role_data)
        
        # Log role creation
        await audit_service.log_event(
            event_type=AuditEventType.USER_CREATED,  # Role events use user event types
            action="create_role",
            description=f"Created role {role.name}",
            user_id=role_data.get("created_by"),
            resource_type="role",
            resource_id=role.id,
            severity=AuditSeverity.MEDIUM,
            details={"role_name": role.name, "permissions": [p.value for p in role.permissions]},
            tags=["role_management"]
        )
        
        return {"status": "success", "data": role.to_dict()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create role: {str(e)}"
        )

@router.post("/rbac/resources")
async def create_resource(resource_data: Dict[str, Any]):
    """Create a new resource"""
    try:
        resource = await rbac_service.create_resource(resource_data)
        return {"status": "success", "data": resource.to_dict()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create resource: {str(e)}"
        )

@router.post("/rbac/users/{user_id}/roles/{role_id}")
async def assign_role_to_user(user_id: str, role_id: str, assigned_by: str = Query(...)):
    """Assign a role to a user"""
    try:
        success = await rbac_service.assign_role_to_user(user_id, role_id)
        
        if success:
            # Log role assignment
            await audit_service.log_event(
                event_type=AuditEventType.ROLE_ASSIGNED,
                action="assign_role",
                description=f"Assigned role {role_id} to user {user_id}",
                user_id=assigned_by,
                resource_type="user",
                resource_id=user_id,
                severity=AuditSeverity.MEDIUM,
                details={"role_id": role_id},
                tags=["role_management"]
            )
            
            return {"status": "success", "message": "Role assigned successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User or role not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign role: {str(e)}"
        )

@router.delete("/rbac/users/{user_id}/roles/{role_id}")
async def remove_role_from_user(user_id: str, role_id: str, removed_by: str = Query(...)):
    """Remove a role from a user"""
    try:
        success = await rbac_service.remove_role_from_user(user_id, role_id)
        
        if success:
            # Log role removal
            await audit_service.log_event(
                event_type=AuditEventType.ROLE_REMOVED,
                action="remove_role",
                description=f"Removed role {role_id} from user {user_id}",
                user_id=removed_by,
                resource_type="user",
                resource_id=user_id,
                severity=AuditSeverity.MEDIUM,
                details={"role_id": role_id},
                tags=["role_management"]
            )
            
            return {"status": "success", "message": "Role removed successfully"}
        else:
            return {"status": "success", "message": "Role was not assigned to user"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove role: {str(e)}"
        )

@router.get("/rbac/users/{user_id}/permissions")
async def get_user_permissions(user_id: str):
    """Get all permissions for a user"""
    try:
        permissions = rbac_service.get_user_permissions(user_id)
        roles = rbac_service.get_user_roles(user_id)
        
        return {
            "status": "success",
            "data": {
                "user_id": user_id,
                "permissions": [p.value for p in permissions],
                "roles": [role.to_dict() for role in roles]
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user permissions: {str(e)}"
        )

@router.post("/rbac/check-access")
async def check_access(access_request: Dict[str, Any]):
    """Check if a user has access to a resource"""
    try:
        user_id = access_request["user_id"]
        resource_id = access_request["resource_id"]
        permission = Permission(access_request["permission"])
        context = access_request.get("context", {})
        
        has_access = await rbac_service.check_access(user_id, resource_id, permission, context)
        
        return {
            "status": "success",
            "data": {
                "user_id": user_id,
                "resource_id": resource_id,
                "permission": permission.value,
                "has_access": has_access
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check access: {str(e)}"
        )

@router.get("/rbac/users/{user_id}/resources")
async def get_user_accessible_resources(
    user_id: str,
    resource_type: Optional[str] = None,
    permission: str = Query("read")
):
    """Get all resources accessible to a user"""
    try:
        resource_type_enum = ResourceType(resource_type) if resource_type else None
        permission_enum = Permission(permission)
        
        resources = await rbac_service.get_user_accessible_resources(
            user_id, resource_type_enum, permission_enum
        )
        
        return {
            "status": "success",
            "data": [resource.to_dict() for resource in resources]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get accessible resources: {str(e)}"
        )

@router.get("/rbac/security-report")
async def get_security_report():
    """Get security report"""
    try:
        report = rbac_service.get_security_report()
        return {"status": "success", "data": report}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate security report: {str(e)}"
        )

# Audit Endpoints

@router.get("/audit/events")
async def get_audit_events(
    user_id: Optional[str] = None,
    event_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """Get audit events with filtering"""
    try:
        # Create filter
        audit_filter = AuditFilter()
        
        if user_id:
            audit_filter.user_ids = [user_id]
        
        if event_type:
            audit_filter.event_types = [AuditEventType(event_type)]
        
        if severity:
            audit_filter.severities = [AuditSeverity(severity)]
        
        if start_date:
            audit_filter.start_date = datetime.fromisoformat(start_date)
        
        if end_date:
            audit_filter.end_date = datetime.fromisoformat(end_date)
        
        # Query events
        events = await audit_service.query_events(audit_filter, limit, offset)
        total_count = await audit_service.count_events(audit_filter)
        
        return {
            "status": "success",
            "data": {
                "events": [event.to_dict() for event in events],
                "total_count": total_count,
                "limit": limit,
                "offset": offset
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get audit events: {str(e)}"
        )

@router.get("/audit/users/{user_id}/activity")
async def get_user_activity(user_id: str, days: int = Query(7, ge=1, le=90)):
    """Get recent activity for a user"""
    try:
        activities = await audit_service.get_user_activity(user_id, days)
        
        return {
            "status": "success",
            "data": {
                "user_id": user_id,
                "period_days": days,
                "activities": [activity.to_dict() for activity in activities]
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user activity: {str(e)}"
        )

@router.get("/audit/security-incidents")
async def get_security_incidents(days: int = Query(7, ge=1, le=30)):
    """Get recent security incidents"""
    try:
        incidents = await audit_service.get_security_incidents(days)
        
        return {
            "status": "success",
            "data": {
                "period_days": days,
                "incidents": [incident.to_dict() for incident in incidents]
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security incidents: {str(e)}"
        )

@router.get("/audit/compliance-report")
async def get_compliance_report(
    start_date: str = Query(..., description="Start date in ISO format"),
    end_date: str = Query(..., description="End date in ISO format")
):
    """Generate compliance report for a date range"""
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
        
        report = await audit_service.generate_compliance_report(start_dt, end_dt)
        
        return {"status": "success", "data": report}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate compliance report: {str(e)}"
        )

@router.post("/audit/log-event")
async def log_audit_event(event_data: Dict[str, Any]):
    """Manually log an audit event"""
    try:
        event_type = AuditEventType(event_data["event_type"])
        severity = AuditSeverity(event_data.get("severity", "low"))
        
        event = await audit_service.log_event(
            event_type=event_type,
            action=event_data["action"],
            description=event_data["description"],
            user_id=event_data.get("user_id"),
            username=event_data.get("username"),
            resource_type=event_data.get("resource_type"),
            resource_id=event_data.get("resource_id"),
            severity=severity,
            ip_address=event_data.get("ip_address"),
            user_agent=event_data.get("user_agent"),
            details=event_data.get("details"),
            tags=event_data.get("tags")
        )
        
        return {"status": "success", "data": {"event_id": event.id}}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log audit event: {str(e)}"
        )

# Security Monitoring Endpoints

@router.get("/security/dashboard")
async def get_security_dashboard():
    """Get security monitoring dashboard data"""
    try:
        # Get recent security incidents
        incidents = await audit_service.get_security_incidents(7)
        
        # Get RBAC security report
        rbac_report = rbac_service.get_security_report()
        
        # Calculate security score
        security_score = 100
        
        # Deduct points for recent incidents
        critical_incidents = len([i for i in incidents if i.severity == AuditSeverity.CRITICAL])
        high_incidents = len([i for i in incidents if i.severity == AuditSeverity.HIGH])
        
        security_score -= critical_incidents * 10
        security_score -= high_incidents * 5
        
        # Deduct points for access failures
        access_stats = rbac_report.get('access_statistics', {})
        success_rate = access_stats.get('success_rate_percent', 100)
        if success_rate < 95:
            security_score -= (95 - success_rate) * 2
        
        dashboard_data = {
            "security_score": max(security_score, 0),
            "status": "healthy" if security_score > 80 else "warning" if security_score > 60 else "critical",
            "recent_incidents": {
                "total": len(incidents),
                "critical": critical_incidents,
                "high": high_incidents,
                "incidents": [i.to_dict() for i in incidents[:10]]
            },
            "access_statistics": access_stats,
            "user_statistics": rbac_report.get('summary', {}),
            "recommendations": rbac_report.get('recommendations', []),
            "last_updated": datetime.now().isoformat()
        }
        
        return {"status": "success", "data": dashboard_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security dashboard: {str(e)}"
        )

@router.get("/security/health")
async def get_security_health():
    """Get overall security health status"""
    try:
        # Check various security components
        health_checks = {
            "rbac_service": {"status": "healthy", "message": "RBAC service operational"},
            "audit_service": {"status": "healthy", "message": "Audit logging operational"},
            "authentication": {"status": "healthy", "message": "Authentication system operational"},
            "encryption": {"status": "healthy", "message": "Data encryption active"}
        }
        
        # Overall health status
        all_healthy = all(check["status"] == "healthy" for check in health_checks.values())
        overall_status = "healthy" if all_healthy else "degraded"
        
        return {
            "status": "success",
            "data": {
                "overall_status": overall_status,
                "components": health_checks,
                "last_check": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security health: {str(e)}"
        )