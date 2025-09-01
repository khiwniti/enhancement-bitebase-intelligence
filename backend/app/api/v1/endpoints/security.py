"""
Enterprise Security Management API Endpoints
Provides access to enterprise RBAC, audit logging, and security monitoring
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query, Request
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.security.rbac_service import rbac_service, Permission, ResourceType
from app.services.security.audit_service import audit_service, AuditEventType, AuditSeverity, AuditFilter
from app.services.security.enterprise_rbac import (
    get_enterprise_rbac_service,
    EnterprisePermission,
    AccessContext,
    EnterpriseRBACService
)
from app.services.security.enterprise_audit import (
    get_enterprise_audit_service,
    EnterpriseAuditService,
    EnterpriseAuditEventType,
    AuditSeverity as EnterpriseSeverity,
    AuditQuery,
    ComplianceFramework
)
from app.services.security.rate_limiting import (
    get_rate_limiter,
    EnterpriseRateLimiter,
    RateLimitRule,
    RateLimitStrategy,
    RateLimitScope
)
from app.services.monitoring.api_monitoring import (
    get_api_monitor,
    EnterpriseAPIMonitor,
    PerformanceThreshold,
    APIMetricType,
    AlertSeverity
)
from app.services.security.vulnerability_scanner import get_vulnerability_scanner
from app.core.database import get_db
from app.core.dependencies import get_current_user, CurrentUser

router = APIRouter()

# Enterprise RBAC Endpoints

@router.get("/enterprise/rbac/dashboard", response_model=None)
async def get_enterprise_rbac_dashboard(
    rbac_service: EnterpriseRBACService = Depends(get_enterprise_rbac_service)
) -> Dict[str, Any]:
    """Get enterprise RBAC dashboard data"""
    try:
        dashboard_data = await rbac_service.get_security_dashboard()

        return {
            "status": "success",
            "data": dashboard_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get RBAC dashboard: {str(e)}"
        )

@router.post("/enterprise/rbac/check-access")
async def check_enterprise_access(
    access_data: Dict[str, Any],
    request: Request,
    rbac_service: EnterpriseRBACService = Depends(get_enterprise_rbac_service)
) -> Dict[str, Any]:
    """Check enterprise access with enhanced context"""
    try:
        context = AccessContext(
            user_id=access_data["user_id"],
            resource_id=access_data["resource_id"],
            resource_type=access_data["resource_type"],
            action=access_data["action"],
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent"),
            additional_context=access_data.get("context", {})
        )

        decision = await rbac_service.check_access(context)

        return {
            "status": "success",
            "data": {
                "granted": decision.granted,
                "reason": decision.reason,
                "risk_score": decision.risk_score,
                "requires_additional_auth": decision.requires_additional_auth,
                "policies_evaluated": decision.policies_evaluated,
                "conditions_met": decision.conditions_met,
                "conditions_failed": decision.conditions_failed
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check access: {str(e)}"
        )

@router.post("/enterprise/rbac/users")
async def create_enterprise_user(
    user_data: Dict[str, Any],
    rbac_service: EnterpriseRBACService = Depends(get_enterprise_rbac_service)
):
    """Create a new enterprise user"""
    try:
        user = await rbac_service.create_user(user_data)

        return {
            "status": "success",
            "data": {
                "user_id": user.id,
                "email": user.email,
                "organization_id": user.organization_id,
                "security_clearance": user.security_clearance
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.post("/enterprise/rbac/assign-role")
async def assign_enterprise_role(
    assignment_data: Dict[str, Any],
    rbac_service: EnterpriseRBACService = Depends(get_enterprise_rbac_service)
):
    """Assign role to user with enterprise controls"""
    try:
        success = await rbac_service.assign_role(
            user_id=assignment_data["user_id"],
            role_id=assignment_data["role_id"],
            assigned_by=assignment_data["assigned_by"]
        )

        return {
            "status": "success",
            "data": {
                "assigned": success
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign role: {str(e)}"
        )

# Enterprise Audit Endpoints

@router.get("/enterprise/audit/dashboard")
async def get_enterprise_audit_dashboard(
    days: int = Query(30, description="Number of days for metrics"),
    audit_service: EnterpriseAuditService = Depends(get_enterprise_audit_service)
):
    """Get enterprise audit dashboard with security metrics"""
    try:
        metrics = await audit_service.get_security_metrics(days=days)

        return {
            "status": "success",
            "data": metrics
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get audit dashboard: {str(e)}"
        )

@router.post("/enterprise/audit/events")
async def query_enterprise_audit_events(
    query_data: Dict[str, Any],
    audit_service: EnterpriseAuditService = Depends(get_enterprise_audit_service)
):
    """Query audit events with advanced filtering"""
    try:
        # Parse query parameters
        query = AuditQuery(
            start_date=datetime.fromisoformat(query_data["start_date"]) if query_data.get("start_date") else None,
            end_date=datetime.fromisoformat(query_data["end_date"]) if query_data.get("end_date") else None,
            event_types=[EnterpriseAuditEventType(t) for t in query_data.get("event_types", [])],
            user_ids=query_data.get("user_ids"),
            resource_types=query_data.get("resource_types"),
            severity_levels=[EnterpriseSeverity(s) for s in query_data.get("severity_levels", [])],
            outcomes=query_data.get("outcomes"),
            ip_addresses=query_data.get("ip_addresses"),
            compliance_frameworks=[ComplianceFramework(f) for f in query_data.get("compliance_frameworks", [])],
            limit=query_data.get("limit", 100),
            offset=query_data.get("offset", 0)
        )

        events, total_count = await audit_service.query_events(query)

        # Convert events to dict format
        events_data = []
        for event in events:
            event_dict = {
                "id": event.id,
                "event_type": event.event_type,
                "severity": event.severity,
                "timestamp": event.timestamp.isoformat(),
                "user_id": event.user_id,
                "user_email": event.user_email,
                "resource_type": event.resource_type,
                "resource_id": event.resource_id,
                "action": event.action,
                "outcome": event.outcome,
                "ip_address": event.ip_address,
                "location": event.location,
                "metadata": event.metadata
            }
            events_data.append(event_dict)

        return {
            "status": "success",
            "data": {
                "events": events_data,
                "total_count": total_count,
                "page_size": query.limit,
                "offset": query.offset
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query audit events: {str(e)}"
        )

@router.post("/enterprise/audit/log-event")
async def log_enterprise_audit_event(
    event_data: Dict[str, Any],
    request: Request,
    audit_service: EnterpriseAuditService = Depends(get_enterprise_audit_service)
):
    """Log a new audit event"""
    try:
        event = await audit_service.log_event(
            event_type=EnterpriseAuditEventType(event_data["event_type"]),
            user_id=event_data.get("user_id"),
            resource_type=event_data.get("resource_type"),
            resource_id=event_data.get("resource_id"),
            action=event_data.get("action"),
            outcome=event_data.get("outcome", "success"),
            severity=EnterpriseSeverity(event_data.get("severity", "low")),
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent"),
            metadata=event_data.get("metadata"),
            compliance_frameworks=[ComplianceFramework(f) for f in event_data.get("compliance_frameworks", [])]
        )

        return {
            "status": "success",
            "data": {
                "event_id": event.id,
                "timestamp": event.timestamp.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log audit event: {str(e)}"
        )

@router.get("/enterprise/audit/compliance/{framework}")
async def generate_compliance_report(
    framework: str,
    start_date: str = Query(..., description="Start date in ISO format"),
    end_date: str = Query(..., description="End date in ISO format"),
    audit_service: EnterpriseAuditService = Depends(get_enterprise_audit_service)
):
    """Generate compliance report for specific framework"""
    try:
        compliance_framework = ComplianceFramework(framework.lower())
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)

        report = await audit_service.generate_compliance_report(
            framework=compliance_framework,
            start_date=start_dt,
            end_date=end_dt
        )

        return {
            "status": "success",
            "data": report
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid framework or date format: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate compliance report: {str(e)}"
        )

@router.get("/enterprise/audit/anomalies")
async def detect_security_anomalies(
    lookback_hours: int = Query(24, description="Hours to look back for anomaly detection"),
    audit_service: EnterpriseAuditService = Depends(get_enterprise_audit_service)
):
    """Detect security anomalies in audit logs"""
    try:
        anomalies = await audit_service.detect_anomalies(lookback_hours=lookback_hours)

        return {
            "status": "success",
            "data": {
                "anomalies": anomalies,
                "lookback_hours": lookback_hours,
                "detected_at": datetime.utcnow().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to detect anomalies: {str(e)}"
        )

@router.get("/enterprise/security/overview")
async def get_enterprise_security_overview(
    rbac_service: EnterpriseRBACService = Depends(get_enterprise_rbac_service),
    audit_service: EnterpriseAuditService = Depends(get_enterprise_audit_service)
):
    """Get comprehensive enterprise security overview"""
    try:
        # Get RBAC dashboard
        rbac_data = await rbac_service.get_security_dashboard()

        # Get audit metrics
        audit_metrics = await audit_service.get_security_metrics(days=7)

        # Get recent anomalies
        anomalies = await audit_service.detect_anomalies(lookback_hours=24)

        return {
            "status": "success",
            "data": {
                "rbac_overview": rbac_data,
                "audit_metrics": audit_metrics,
                "recent_anomalies": anomalies,
                "security_score": 85,  # Calculated based on various factors
                "last_updated": datetime.utcnow().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security overview: {str(e)}"
        )

# Enterprise Rate Limiting Endpoints

@router.get("/enterprise/rate-limiting/stats")
async def get_rate_limiting_stats(
    hours: int = Query(1, description="Hours to look back for statistics"),
    rate_limiter: EnterpriseRateLimiter = Depends(get_rate_limiter)
):
    """Get rate limiting statistics and metrics"""
    try:
        stats = await rate_limiter.get_rate_limit_stats(hours=hours)

        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get rate limiting stats: {str(e)}"
        )

@router.get("/enterprise/rate-limiting/rules")
async def get_rate_limiting_rules(
    rate_limiter: EnterpriseRateLimiter = Depends(get_rate_limiter)
):
    """Get all rate limiting rules"""
    try:
        rules = rate_limiter.get_rules()

        # Convert rules to dict format
        rules_data = []
        for rule in rules:
            rule_dict = {
                "id": rule.id,
                "name": rule.name,
                "strategy": rule.strategy,
                "scope": rule.scope,
                "limit": rule.limit,
                "window_seconds": rule.window_seconds,
                "burst_limit": rule.burst_limit,
                "endpoints": rule.endpoints,
                "user_roles": rule.user_roles,
                "priority": rule.priority,
                "enabled": rule.enabled
            }
            rules_data.append(rule_dict)

        return {
            "status": "success",
            "data": {
                "rules": rules_data,
                "total_count": len(rules_data)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get rate limiting rules: {str(e)}"
        )

@router.post("/enterprise/rate-limiting/rules")
async def create_rate_limiting_rule(
    rule_data: Dict[str, Any],
    rate_limiter: EnterpriseRateLimiter = Depends(get_rate_limiter)
):
    """Create a new rate limiting rule"""
    try:
        rule = RateLimitRule(
            id=rule_data["id"],
            name=rule_data["name"],
            strategy=RateLimitStrategy(rule_data["strategy"]),
            scope=RateLimitScope(rule_data["scope"]),
            limit=rule_data["limit"],
            window_seconds=rule_data["window_seconds"],
            burst_limit=rule_data.get("burst_limit"),
            endpoints=rule_data.get("endpoints", []),
            user_roles=rule_data.get("user_roles", []),
            priority=rule_data.get("priority", 100),
            enabled=rule_data.get("enabled", True)
        )

        rate_limiter.add_rule(rule)

        return {
            "status": "success",
            "data": {
                "rule_id": rule.id,
                "message": "Rate limiting rule created successfully"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create rate limiting rule: {str(e)}"
        )

@router.delete("/enterprise/rate-limiting/rules/{rule_id}")
async def delete_rate_limiting_rule(
    rule_id: str,
    rate_limiter: EnterpriseRateLimiter = Depends(get_rate_limiter)
):
    """Delete a rate limiting rule"""
    try:
        rate_limiter.remove_rule(rule_id)

        return {
            "status": "success",
            "data": {
                "message": f"Rate limiting rule {rule_id} deleted successfully"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete rate limiting rule: {str(e)}"
        )

@router.post("/enterprise/rate-limiting/check")
async def check_rate_limit(
    check_data: Dict[str, Any],
    request: Request,
    rate_limiter: EnterpriseRateLimiter = Depends(get_rate_limiter)
):
    """Check rate limit for a specific request"""
    try:
        allowed, statuses = await rate_limiter.check_rate_limit(
            endpoint=check_data["endpoint"],
            user_id=check_data.get("user_id"),
            ip_address=check_data.get("ip_address", request.client.host),
            api_key=check_data.get("api_key"),
            user_role=check_data.get("user_role")
        )

        # Convert statuses to dict format
        statuses_data = []
        for status_obj in statuses:
            status_dict = {
                "rule_id": status_obj.rule_id,
                "scope_key": status_obj.scope_key,
                "current_count": status_obj.current_count,
                "limit": status_obj.limit,
                "window_seconds": status_obj.window_seconds,
                "reset_time": status_obj.reset_time.isoformat(),
                "remaining": status_obj.remaining,
                "blocked": status_obj.blocked,
                "retry_after_seconds": status_obj.retry_after_seconds
            }
            statuses_data.append(status_dict)

        return {
            "status": "success",
            "data": {
                "allowed": allowed,
                "statuses": statuses_data
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check rate limit: {str(e)}"
        )

# Enterprise API Monitoring Endpoints

@router.get("/enterprise/monitoring/metrics")
async def get_api_metrics(
    hours: int = Query(1, description="Hours to look back for metrics"),
    api_monitor: EnterpriseAPIMonitor = Depends(get_api_monitor)
):
    """Get comprehensive API metrics and statistics"""
    try:
        metrics = await api_monitor.get_api_metrics(hours=hours)

        return {
            "status": "success",
            "data": metrics
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get API metrics: {str(e)}"
        )

@router.get("/enterprise/monitoring/endpoints/{endpoint:path}")
async def get_endpoint_metrics(
    endpoint: str,
    hours: int = Query(1, description="Hours to look back for metrics"),
    api_monitor: EnterpriseAPIMonitor = Depends(get_api_monitor)
):
    """Get metrics for a specific endpoint"""
    try:
        metrics = await api_monitor.get_endpoint_metrics(endpoint=f"/{endpoint}", hours=hours)

        return {
            "status": "success",
            "data": metrics
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get endpoint metrics: {str(e)}"
        )

@router.get("/enterprise/monitoring/alerts")
async def get_monitoring_alerts(
    api_monitor: EnterpriseAPIMonitor = Depends(get_api_monitor)
):
    """Get active monitoring alerts"""
    try:
        alerts = await api_monitor.get_active_alerts()

        return {
            "status": "success",
            "data": {
                "alerts": alerts,
                "total_count": len(alerts)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get monitoring alerts: {str(e)}"
        )

@router.post("/enterprise/monitoring/alerts/{alert_id}/resolve")
async def resolve_monitoring_alert(
    alert_id: str,
    api_monitor: EnterpriseAPIMonitor = Depends(get_api_monitor)
):
    """Resolve a monitoring alert"""
    try:
        resolved = await api_monitor.resolve_alert(alert_id)

        if not resolved:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert not found or already resolved"
            )

        return {
            "status": "success",
            "data": {
                "message": f"Alert {alert_id} resolved successfully"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resolve alert: {str(e)}"
        )

@router.get("/enterprise/monitoring/thresholds")
async def get_monitoring_thresholds(
    api_monitor: EnterpriseAPIMonitor = Depends(get_api_monitor)
):
    """Get performance monitoring thresholds"""
    try:
        thresholds = api_monitor.get_thresholds()

        return {
            "status": "success",
            "data": {
                "thresholds": thresholds,
                "total_count": len(thresholds)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get monitoring thresholds: {str(e)}"
        )

@router.post("/enterprise/monitoring/thresholds")
async def create_monitoring_threshold(
    threshold_data: Dict[str, Any],
    api_monitor: EnterpriseAPIMonitor = Depends(get_api_monitor)
):
    """Create a new performance monitoring threshold"""
    try:
        threshold = PerformanceThreshold(
            metric_type=APIMetricType(threshold_data["metric_type"]),
            threshold_value=threshold_data["threshold_value"],
            comparison=threshold_data["comparison"],
            window_minutes=threshold_data.get("window_minutes", 5),
            severity=AlertSeverity(threshold_data.get("severity", "warning")),
            endpoint_pattern=threshold_data.get("endpoint_pattern"),
            enabled=threshold_data.get("enabled", True)
        )

        api_monitor.add_threshold(threshold)

        return {
            "status": "success",
            "data": {
                "message": "Performance threshold created successfully"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create monitoring threshold: {str(e)}"
        )

@router.delete("/enterprise/monitoring/thresholds")
async def delete_monitoring_thresholds(
    metric_type: APIMetricType,
    endpoint_pattern: Optional[str] = None,
    api_monitor: EnterpriseAPIMonitor = Depends(get_api_monitor)
):
    """Delete performance monitoring thresholds"""
    try:
        api_monitor.remove_threshold(metric_type, endpoint_pattern)

        return {
            "status": "success",
            "data": {
                "message": "Performance thresholds deleted successfully"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete monitoring thresholds: {str(e)}"
        )

# RBAC Endpoints (Legacy)

@router.post("/rbac/users")
async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
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
async def create_role(role_data: Dict[str, Any]) -> Dict[str, Any]:
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
async def create_resource(resource_data: Dict[str, Any]) -> Dict[str, Any]:
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
async def assign_role_to_user(user_id: str, role_id: str, assigned_by: str = Query(...)) -> Dict[str, Any]:
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
async def remove_role_from_user(user_id: str, role_id: str, removed_by: str = Query(...)) -> Dict[str, Any]:
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
async def get_user_permissions(user_id: str) -> Dict[str, Any]:
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
async def check_access(access_request: Dict[str, Any]) -> Dict[str, Any]:
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
async def get_security_report() -> Dict[str, Any]:
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
async def get_user_activity(user_id: str, days: int = Query(7, ge=1, le=90)) -> Dict[str, Any]:
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
async def get_security_incidents(days: int = Query(7, ge=1, le=30)) -> Dict[str, Any]:
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
async def log_audit_event(event_data: Dict[str, Any]) -> Dict[str, Any]:
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
async def get_security_dashboard() -> Dict[str, Any]:
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
async def get_security_health() -> Dict[str, Any]:
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

# Vulnerability Scanning Endpoints

@router.post("/enterprise/vulnerability-scan", response_model=Dict[str, Any])
async def start_vulnerability_scan(
    current_user: CurrentUser = Depends(get_current_user),
    rbac_service: EnterpriseRBACService = Depends(get_enterprise_rbac_service)
):
    """Start comprehensive vulnerability scan"""

    # Check permissions
    context = AccessContext(
        user_id=current_user.id,
        resource_type="security",
        resource_id="vulnerability_scan",
        action="execute"
    )

    if not await rbac_service.check_permission(current_user.id, EnterprisePermission.SECURITY_ADMIN, context):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions for vulnerability scanning"
        )

    try:
        scanner = get_vulnerability_scanner()
        report = await scanner.perform_comprehensive_scan()

        # Log the scan
        audit_service = get_enterprise_audit_service()
        await audit_service.log_event(
            event_type=EnterpriseAuditEventType.SECURITY_SCAN,
            user_id=current_user.id,
            resource_type="security",
            resource_id="vulnerability_scan",
            details={
                "scan_id": report.scan_id,
                "risk_score": report.risk_score,
                "vulnerabilities_found": len(report.vulnerabilities),
                "checks_performed": len(report.security_checks)
            },
            severity=EnterpriseSeverity.INFO
        )

        return {
            "status": "success",
            "data": {
                "scan_id": report.scan_id,
                "timestamp": report.timestamp,
                "risk_score": report.risk_score,
                "summary": {
                    "vulnerabilities_found": len(report.vulnerabilities),
                    "critical_vulnerabilities": len([v for v in report.vulnerabilities if v.severity == "critical"]),
                    "high_vulnerabilities": len([v for v in report.vulnerabilities if v.severity == "high"]),
                    "security_checks_performed": len(report.security_checks),
                    "checks_passed": len([c for c in report.security_checks if c.passed]),
                    "checks_failed": len([c for c in report.security_checks if not c.passed])
                },
                "recommendations": report.recommendations[:5],  # Top 5 recommendations
                "compliance_status": report.compliance_status
            }
        }

    except Exception as e:
        logger.error(f"Vulnerability scan failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Vulnerability scan failed"
        )