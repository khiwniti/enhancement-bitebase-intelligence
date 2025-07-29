"""
BiteBase Intelligence Enterprise RBAC System
Advanced role-based access control with fine-grained permissions and enterprise features
"""

import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Any, Tuple
from enum import Enum
from dataclasses import dataclass, field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
import json

logger = logging.getLogger(__name__)

class EnterprisePermission(str, Enum):
    """Enterprise-grade permission system"""
    
    # System Administration
    SYSTEM_ADMIN = "system:admin"
    SYSTEM_CONFIG = "system:config"
    SYSTEM_MONITOR = "system:monitor"
    SYSTEM_BACKUP = "system:backup"
    
    # User Management
    USER_CREATE = "user:create"
    USER_READ = "user:read"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"
    USER_IMPERSONATE = "user:impersonate"
    
    # Role Management
    ROLE_CREATE = "role:create"
    ROLE_READ = "role:read"
    ROLE_UPDATE = "role:update"
    ROLE_DELETE = "role:delete"
    ROLE_ASSIGN = "role:assign"
    
    # Restaurant Management
    RESTAURANT_CREATE = "restaurant:create"
    RESTAURANT_READ = "restaurant:read"
    RESTAURANT_UPDATE = "restaurant:update"
    RESTAURANT_DELETE = "restaurant:delete"
    RESTAURANT_MANAGE_ALL = "restaurant:manage_all"
    
    # Location Management
    LOCATION_CREATE = "location:create"
    LOCATION_READ = "location:read"
    LOCATION_UPDATE = "location:update"
    LOCATION_DELETE = "location:delete"
    LOCATION_ANALYTICS = "location:analytics"
    
    # Financial Data
    FINANCIAL_READ = "financial:read"
    FINANCIAL_UPDATE = "financial:update"
    FINANCIAL_EXPORT = "financial:export"
    FINANCIAL_SENSITIVE = "financial:sensitive"
    
    # Analytics & Reports
    ANALYTICS_READ = "analytics:read"
    ANALYTICS_EXPORT = "analytics:export"
    ANALYTICS_ADVANCED = "analytics:advanced"
    ANALYTICS_REALTIME = "analytics:realtime"
    
    # AI/ML Features
    AI_ACCESS = "ai:access"
    AI_CONFIGURE = "ai:configure"
    AI_TRAIN_MODELS = "ai:train_models"
    AI_EXPORT_DATA = "ai:export_data"
    
    # Security & Audit
    SECURITY_READ = "security:read"
    SECURITY_CONFIGURE = "security:configure"
    AUDIT_READ = "audit:read"
    AUDIT_EXPORT = "audit:export"
    
    # API Access
    API_READ = "api:read"
    API_WRITE = "api:write"
    API_ADMIN = "api:admin"
    API_RATE_LIMIT_EXEMPT = "api:rate_limit_exempt"

class ResourceScope(str, Enum):
    """Resource access scope"""
    GLOBAL = "global"
    ORGANIZATION = "organization"
    RESTAURANT = "restaurant"
    LOCATION = "location"
    PERSONAL = "personal"

@dataclass
class EnterpriseRole:
    """Enterprise role with advanced features"""
    id: str
    name: str
    description: str
    permissions: Set[EnterprisePermission]
    scope: ResourceScope
    resource_restrictions: Dict[str, Any] = field(default_factory=dict)
    conditions: Dict[str, Any] = field(default_factory=dict)
    is_system_role: bool = False
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class EnterpriseUser:
    """Enterprise user with enhanced security features"""
    id: str
    email: str
    first_name: str
    last_name: str
    roles: Set[str] = field(default_factory=set)
    organization_id: Optional[str] = None
    department: Optional[str] = None
    manager_id: Optional[str] = None
    security_clearance: str = "standard"
    is_active: bool = True
    is_locked: bool = False
    failed_login_attempts: int = 0
    last_login: Optional[datetime] = None
    password_expires_at: Optional[datetime] = None
    mfa_enabled: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class AccessContext:
    """Context for access control decisions"""
    user_id: str
    resource_id: str
    resource_type: str
    action: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    location: Optional[str] = None
    time_of_access: datetime = field(default_factory=datetime.utcnow)
    additional_context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AccessDecision:
    """Result of access control evaluation"""
    granted: bool
    reason: str
    policies_evaluated: List[str]
    conditions_met: List[str]
    conditions_failed: List[str]
    risk_score: float = 0.0
    requires_additional_auth: bool = False

class EnterpriseRBACService:
    """Enterprise-grade RBAC service with advanced security features"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users: Dict[str, EnterpriseUser] = {}
        self.roles: Dict[str, EnterpriseRole] = {}
        self.access_log: List[Dict[str, Any]] = []
        self.policy_cache: Dict[str, Any] = {}
        
        # Initialize system roles
        self._initialize_enterprise_roles()
    
    def _initialize_enterprise_roles(self):
        """Initialize enterprise system roles"""
        
        # Super Administrator
        super_admin = EnterpriseRole(
            id="super_admin",
            name="Super Administrator",
            description="Full system access with all permissions",
            permissions=set(EnterprisePermission),
            scope=ResourceScope.GLOBAL,
            is_system_role=True
        )
        
        # Organization Administrator
        org_admin = EnterpriseRole(
            id="org_admin",
            name="Organization Administrator",
            description="Full access within organization scope",
            permissions={
                EnterprisePermission.USER_CREATE,
                EnterprisePermission.USER_READ,
                EnterprisePermission.USER_UPDATE,
                EnterprisePermission.ROLE_READ,
                EnterprisePermission.ROLE_ASSIGN,
                EnterprisePermission.RESTAURANT_CREATE,
                EnterprisePermission.RESTAURANT_READ,
                EnterprisePermission.RESTAURANT_UPDATE,
                EnterprisePermission.RESTAURANT_DELETE,
                EnterprisePermission.LOCATION_CREATE,
                EnterprisePermission.LOCATION_READ,
                EnterprisePermission.LOCATION_UPDATE,
                EnterprisePermission.LOCATION_DELETE,
                EnterprisePermission.LOCATION_ANALYTICS,
                EnterprisePermission.FINANCIAL_READ,
                EnterprisePermission.FINANCIAL_UPDATE,
                EnterprisePermission.ANALYTICS_READ,
                EnterprisePermission.ANALYTICS_EXPORT,
                EnterprisePermission.ANALYTICS_ADVANCED,
                EnterprisePermission.AI_ACCESS,
                EnterprisePermission.SECURITY_READ,
                EnterprisePermission.AUDIT_READ,
                EnterprisePermission.API_READ,
                EnterprisePermission.API_WRITE
            },
            scope=ResourceScope.ORGANIZATION
        )
        
        # Restaurant Manager
        restaurant_manager = EnterpriseRole(
            id="restaurant_manager",
            name="Restaurant Manager",
            description="Full access to assigned restaurants",
            permissions={
                EnterprisePermission.RESTAURANT_READ,
                EnterprisePermission.RESTAURANT_UPDATE,
                EnterprisePermission.LOCATION_READ,
                EnterprisePermission.LOCATION_UPDATE,
                EnterprisePermission.LOCATION_ANALYTICS,
                EnterprisePermission.FINANCIAL_READ,
                EnterprisePermission.ANALYTICS_READ,
                EnterprisePermission.ANALYTICS_EXPORT,
                EnterprisePermission.AI_ACCESS,
                EnterprisePermission.API_READ,
                EnterprisePermission.API_WRITE
            },
            scope=ResourceScope.RESTAURANT
        )
        
        # Location Manager
        location_manager = EnterpriseRole(
            id="location_manager",
            name="Location Manager",
            description="Access to specific location data",
            permissions={
                EnterprisePermission.LOCATION_READ,
                EnterprisePermission.LOCATION_UPDATE,
                EnterprisePermission.ANALYTICS_READ,
                EnterprisePermission.AI_ACCESS,
                EnterprisePermission.API_READ
            },
            scope=ResourceScope.LOCATION
        )
        
        # Analyst
        analyst = EnterpriseRole(
            id="analyst",
            name="Data Analyst",
            description="Read-only access to analytics and reports",
            permissions={
                EnterprisePermission.RESTAURANT_READ,
                EnterprisePermission.LOCATION_READ,
                EnterprisePermission.ANALYTICS_READ,
                EnterprisePermission.ANALYTICS_EXPORT,
                EnterprisePermission.ANALYTICS_ADVANCED,
                EnterprisePermission.AI_ACCESS,
                EnterprisePermission.API_READ
            },
            scope=ResourceScope.ORGANIZATION
        )
        
        # Viewer
        viewer = EnterpriseRole(
            id="viewer",
            name="Viewer",
            description="Read-only access to basic data",
            permissions={
                EnterprisePermission.RESTAURANT_READ,
                EnterprisePermission.LOCATION_READ,
                EnterprisePermission.ANALYTICS_READ,
                EnterprisePermission.API_READ
            },
            scope=ResourceScope.RESTAURANT
        )
        
        # Store roles
        for role in [super_admin, org_admin, restaurant_manager, location_manager, analyst, viewer]:
            self.roles[role.id] = role
    
    async def create_user(self, user_data: Dict[str, Any]) -> EnterpriseUser:
        """Create a new enterprise user"""
        user = EnterpriseUser(
            id=str(uuid.uuid4()),
            email=user_data["email"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            organization_id=user_data.get("organization_id"),
            department=user_data.get("department"),
            security_clearance=user_data.get("security_clearance", "standard")
        )
        
        self.users[user.id] = user
        
        # Log user creation
        await self._log_security_event(
            event_type="user_created",
            user_id=user.id,
            details={"email": user.email, "organization_id": user.organization_id}
        )
        
        return user
    
    async def assign_role(self, user_id: str, role_id: str, assigned_by: str) -> bool:
        """Assign a role to a user"""
        if user_id not in self.users or role_id not in self.roles:
            return False
        
        user = self.users[user_id]
        role = self.roles[role_id]
        
        # Check if assigner has permission
        if not await self._can_assign_role(assigned_by, role_id):
            await self._log_security_event(
                event_type="unauthorized_role_assignment",
                user_id=assigned_by,
                details={"target_user": user_id, "role": role_id}
            )
            return False
        
        user.roles.add(role_id)
        user.updated_at = datetime.utcnow()
        
        # Log role assignment
        await self._log_security_event(
            event_type="role_assigned",
            user_id=assigned_by,
            details={"target_user": user_id, "role": role_id}
        )
        
        return True
    
    async def check_access(self, context: AccessContext) -> AccessDecision:
        """Comprehensive access control check"""
        user = self.users.get(context.user_id)
        if not user:
            return AccessDecision(
                granted=False,
                reason="User not found",
                policies_evaluated=["user_existence"],
                conditions_met=[],
                conditions_failed=["user_exists"]
            )
        
        # Check if user is active and not locked
        if not user.is_active or user.is_locked:
            return AccessDecision(
                granted=False,
                reason="User account is inactive or locked",
                policies_evaluated=["user_status"],
                conditions_met=[],
                conditions_failed=["user_active"]
            )
        
        # Get user permissions
        user_permissions = self._get_user_permissions(user)
        required_permission = self._map_action_to_permission(context.action, context.resource_type)
        
        if required_permission not in user_permissions:
            return AccessDecision(
                granted=False,
                reason=f"Missing required permission: {required_permission}",
                policies_evaluated=["permission_check"],
                conditions_met=[],
                conditions_failed=["has_permission"]
            )
        
        # Evaluate additional policies
        policies_evaluated = ["user_existence", "user_status", "permission_check"]
        conditions_met = ["user_exists", "user_active", "has_permission"]
        conditions_failed = []
        
        # Time-based access control
        if not self._check_time_restrictions(user, context):
            conditions_failed.append("time_restriction")
        else:
            conditions_met.append("time_allowed")
        
        # Location-based access control
        if not self._check_location_restrictions(user, context):
            conditions_failed.append("location_restriction")
        else:
            conditions_met.append("location_allowed")
        
        # Risk assessment
        risk_score = self._calculate_risk_score(user, context)
        
        # Determine if additional authentication is required
        requires_additional_auth = risk_score > 0.7 or self._requires_step_up_auth(context)
        
        granted = len(conditions_failed) == 0
        
        # Log access attempt
        await self._log_access_attempt(context, granted, risk_score)
        
        return AccessDecision(
            granted=granted,
            reason="Access granted" if granted else f"Conditions failed: {', '.join(conditions_failed)}",
            policies_evaluated=policies_evaluated,
            conditions_met=conditions_met,
            conditions_failed=conditions_failed,
            risk_score=risk_score,
            requires_additional_auth=requires_additional_auth
        )
    
    def _get_user_permissions(self, user: EnterpriseUser) -> Set[EnterprisePermission]:
        """Get all permissions for a user"""
        permissions = set()
        
        for role_id in user.roles:
            if role_id in self.roles:
                role = self.roles[role_id]
                permissions.update(role.permissions)
        
        return permissions
    
    def _map_action_to_permission(self, action: str, resource_type: str) -> EnterprisePermission:
        """Map action and resource type to required permission"""
        mapping = {
            ("read", "restaurant"): EnterprisePermission.RESTAURANT_READ,
            ("update", "restaurant"): EnterprisePermission.RESTAURANT_UPDATE,
            ("create", "restaurant"): EnterprisePermission.RESTAURANT_CREATE,
            ("delete", "restaurant"): EnterprisePermission.RESTAURANT_DELETE,
            ("read", "location"): EnterprisePermission.LOCATION_READ,
            ("update", "location"): EnterprisePermission.LOCATION_UPDATE,
            ("read", "analytics"): EnterprisePermission.ANALYTICS_READ,
            ("export", "analytics"): EnterprisePermission.ANALYTICS_EXPORT,
            ("read", "financial"): EnterprisePermission.FINANCIAL_READ,
            ("access", "ai"): EnterprisePermission.AI_ACCESS,
        }
        
        return mapping.get((action, resource_type), EnterprisePermission.API_READ)
    
    def _check_time_restrictions(self, user: EnterpriseUser, context: AccessContext) -> bool:
        """Check time-based access restrictions"""
        # Example: Business hours restriction
        current_hour = context.time_of_access.hour
        if user.security_clearance == "standard" and (current_hour < 6 or current_hour > 22):
            return False
        return True
    
    def _check_location_restrictions(self, user: EnterpriseUser, context: AccessContext) -> bool:
        """Check location-based access restrictions"""
        # Example: IP whitelist check
        if context.ip_address and user.security_clearance == "high":
            # In production, this would check against a whitelist
            return True
        return True
    
    def _calculate_risk_score(self, user: EnterpriseUser, context: AccessContext) -> float:
        """Calculate risk score for access attempt"""
        risk_score = 0.0
        
        # Failed login attempts
        if user.failed_login_attempts > 3:
            risk_score += 0.3
        
        # Time since last login
        if user.last_login:
            days_since_login = (datetime.utcnow() - user.last_login).days
            if days_since_login > 30:
                risk_score += 0.2
        
        # Unusual access time
        current_hour = context.time_of_access.hour
        if current_hour < 6 or current_hour > 22:
            risk_score += 0.1
        
        # High-privilege actions
        if context.action in ["delete", "export", "admin"]:
            risk_score += 0.2
        
        return min(risk_score, 1.0)
    
    def _requires_step_up_auth(self, context: AccessContext) -> bool:
        """Determine if step-up authentication is required"""
        sensitive_actions = ["delete", "export", "admin", "financial"]
        return any(action in context.action for action in sensitive_actions)
    
    async def _can_assign_role(self, assigner_id: str, role_id: str) -> bool:
        """Check if user can assign a specific role"""
        assigner = self.users.get(assigner_id)
        if not assigner:
            return False
        
        assigner_permissions = self._get_user_permissions(assigner)
        return EnterprisePermission.ROLE_ASSIGN in assigner_permissions
    
    async def _log_security_event(self, event_type: str, user_id: str, details: Dict[str, Any]):
        """Log security events for audit trail"""
        event = {
            "id": str(uuid.uuid4()),
            "event_type": event_type,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details
        }
        
        self.access_log.append(event)
        logger.info(f"Security event: {event_type} by user {user_id}")
    
    async def _log_access_attempt(self, context: AccessContext, granted: bool, risk_score: float):
        """Log access attempts for audit trail"""
        event = {
            "id": str(uuid.uuid4()),
            "event_type": "access_attempt",
            "user_id": context.user_id,
            "resource_id": context.resource_id,
            "resource_type": context.resource_type,
            "action": context.action,
            "granted": granted,
            "risk_score": risk_score,
            "ip_address": context.ip_address,
            "user_agent": context.user_agent,
            "timestamp": context.time_of_access.isoformat()
        }
        
        self.access_log.append(event)
    
    async def get_security_dashboard(self) -> Dict[str, Any]:
        """Get security dashboard data"""
        total_users = len(self.users)
        active_users = len([u for u in self.users.values() if u.is_active])
        locked_users = len([u for u in self.users.values() if u.is_locked])
        
        # Recent access attempts
        recent_attempts = [
            event for event in self.access_log[-100:]
            if event["event_type"] == "access_attempt"
        ]
        
        failed_attempts = len([a for a in recent_attempts if not a["granted"]])
        success_rate = ((len(recent_attempts) - failed_attempts) / len(recent_attempts) * 100) if recent_attempts else 100
        
        return {
            "user_statistics": {
                "total_users": total_users,
                "active_users": active_users,
                "locked_users": locked_users,
                "inactive_users": total_users - active_users
            },
            "access_statistics": {
                "recent_attempts": len(recent_attempts),
                "failed_attempts": failed_attempts,
                "success_rate": round(success_rate, 2)
            },
            "security_alerts": self._get_security_alerts(),
            "role_distribution": self._get_role_distribution(),
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def _get_security_alerts(self) -> List[Dict[str, Any]]:
        """Get current security alerts"""
        alerts = []
        
        # Check for users with too many failed login attempts
        for user in self.users.values():
            if user.failed_login_attempts > 5:
                alerts.append({
                    "type": "high_failed_logins",
                    "severity": "high",
                    "user_id": user.id,
                    "message": f"User {user.email} has {user.failed_login_attempts} failed login attempts"
                })
        
        # Check for locked users
        locked_users = [u for u in self.users.values() if u.is_locked]
        if locked_users:
            alerts.append({
                "type": "locked_accounts",
                "severity": "medium",
                "count": len(locked_users),
                "message": f"{len(locked_users)} user accounts are currently locked"
            })
        
        return alerts
    
    def _get_role_distribution(self) -> Dict[str, int]:
        """Get distribution of roles across users"""
        role_counts = {}
        
        for user in self.users.values():
            for role_id in user.roles:
                if role_id in self.roles:
                    role_name = self.roles[role_id].name
                    role_counts[role_name] = role_counts.get(role_name, 0) + 1
        
        return role_counts

# Global enterprise RBAC service instance
enterprise_rbac_service = None

def get_enterprise_rbac_service() -> EnterpriseRBACService:
    """Get enterprise RBAC service instance"""
    global enterprise_rbac_service
    if enterprise_rbac_service is None:
        # Create a mock service for now since we don't have a real database session
        enterprise_rbac_service = EnterpriseRBACService(None)
    return enterprise_rbac_service
