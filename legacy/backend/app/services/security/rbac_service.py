"""
Role-Based Access Control (RBAC) Service
Implements comprehensive enterprise security with granular permissions
"""

from typing import Dict, List, Optional, Set, Any, Union
from enum import Enum
from datetime import datetime, timedelta
import json
import hashlib
from dataclasses import dataclass, asdict
from abc import ABC, abstractmethod

class ResourceType(Enum):
    DASHBOARD = "dashboard"
    WIDGET = "widget"
    DATA_SOURCE = "data_source"
    REPORT = "report"
    USER = "user"
    ROLE = "role"
    SYSTEM = "system"

class Permission(Enum):
    # Basic CRUD permissions
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    
    # Advanced permissions
    SHARE = "share"
    EXPORT = "export"
    ADMIN = "admin"
    COLLABORATE = "collaborate"
    
    # System-level permissions
    MANAGE_USERS = "manage_users"
    MANAGE_ROLES = "manage_roles"
    MANAGE_SYSTEM = "manage_system"
    VIEW_ANALYTICS = "view_analytics"
    
    # Data-specific permissions
    ACCESS_SENSITIVE_DATA = "access_sensitive_data"
    BULK_OPERATIONS = "bulk_operations"

@dataclass
class Resource:
    """Represents a system resource with access control"""
    id: str
    type: ResourceType
    owner_id: str
    created_at: datetime
    metadata: Dict[str, Any]
    sensitivity_level: str = "standard"  # standard, sensitive, confidential
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            'type': self.type.value,
            'created_at': self.created_at.isoformat()
        }

@dataclass
class Role:
    """Represents a user role with permissions"""
    id: str
    name: str
    description: str
    permissions: Set[Permission]
    resource_restrictions: Dict[ResourceType, Dict[str, Any]]
    created_at: datetime
    is_system_role: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'permissions': [p.value for p in self.permissions],
            'resource_restrictions': {k.value: v for k, v in self.resource_restrictions.items()},
            'created_at': self.created_at.isoformat(),
            'is_system_role': self.is_system_role
        }

@dataclass
class User:
    """Represents a system user"""
    id: str
    username: str
    email: str
    roles: Set[str]  # Role IDs
    department: Optional[str]
    created_at: datetime
    last_login: Optional[datetime]
    is_active: bool = True
    metadata: Dict[str, Any] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'roles': list(self.roles),
            'department': self.department,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
            'metadata': self.metadata or {}
        }

@dataclass
class AccessRequest:
    """Represents an access request for auditing"""
    user_id: str
    resource_id: str
    resource_type: ResourceType
    permission: Permission
    timestamp: datetime
    granted: bool
    reason: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            'resource_type': self.resource_type.value,
            'permission': self.permission.value,
            'timestamp': self.timestamp.isoformat()
        }

class AccessPolicy(ABC):
    """Abstract base class for access policies"""
    
    @abstractmethod
    def evaluate(self, user: User, resource: Resource, permission: Permission, 
                context: Dict[str, Any] = None) -> bool:
        """Evaluate if access should be granted"""
        pass

class OwnershipPolicy(AccessPolicy):
    """Policy that grants access to resource owners"""
    
    def evaluate(self, user: User, resource: Resource, permission: Permission, 
                context: Dict[str, Any] = None) -> bool:
        return user.id == resource.owner_id

class DepartmentPolicy(AccessPolicy):
    """Policy that grants access based on department"""
    
    def __init__(self, allowed_departments: List[str]):
        self.allowed_departments = allowed_departments
    
    def evaluate(self, user: User, resource: Resource, permission: Permission, 
                context: Dict[str, Any] = None) -> bool:
        return user.department in self.allowed_departments

class SensitivityPolicy(AccessPolicy):
    """Policy that restricts access based on data sensitivity"""
    
    def evaluate(self, user: User, resource: Resource, permission: Permission, 
                context: Dict[str, Any] = None) -> bool:
        if resource.sensitivity_level == "confidential":
            return Permission.ACCESS_SENSITIVE_DATA in self._get_user_permissions(user)
        return True
    
    def _get_user_permissions(self, user: User) -> Set[Permission]:
        # This would normally query the role system
        # For now, return empty set - will be integrated with RBACService
        return set()

class TimeBasedPolicy(AccessPolicy):
    """Policy that restricts access based on time"""
    
    def __init__(self, allowed_hours: tuple = (9, 17)):  # 9 AM to 5 PM
        self.allowed_hours = allowed_hours
    
    def evaluate(self, user: User, resource: Resource, permission: Permission, 
                context: Dict[str, Any] = None) -> bool:
        current_hour = datetime.now().hour
        return self.allowed_hours[0] <= current_hour <= self.allowed_hours[1]

class RBACService:
    """Main Role-Based Access Control service"""
    
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.roles: Dict[str, Role] = {}
        self.resources: Dict[str, Resource] = {}
        self.access_log: List[AccessRequest] = []
        self.policies: List[AccessPolicy] = [
            OwnershipPolicy(),
            SensitivityPolicy(),
        ]
        
        # Initialize default roles
        self._initialize_default_roles()
    
    def _initialize_default_roles(self):
        """Initialize system default roles"""
        # Admin role - full access
        admin_role = Role(
            id="admin",
            name="Administrator",
            description="Full system access",
            permissions=set(Permission),
            resource_restrictions={},
            created_at=datetime.now(),
            is_system_role=True
        )
        self.roles["admin"] = admin_role
        
        # Editor role - can create and edit
        editor_role = Role(
            id="editor",
            name="Editor",
            description="Can create and edit content",
            permissions={
                Permission.CREATE, Permission.READ, Permission.UPDATE,
                Permission.SHARE, Permission.COLLABORATE
            },
            resource_restrictions={},
            created_at=datetime.now(),
            is_system_role=True
        )
        self.roles["editor"] = editor_role
        
        # Viewer role - read-only access
        viewer_role = Role(
            id="viewer",
            name="Viewer",
            description="Read-only access",
            permissions={Permission.READ},
            resource_restrictions={},
            created_at=datetime.now(),
            is_system_role=True
        )
        self.roles["viewer"] = viewer_role
        
        # Analyst role - analytics and reporting
        analyst_role = Role(
            id="analyst",
            name="Analyst",
            description="Analytics and reporting access",
            permissions={
                Permission.READ, Permission.VIEW_ANALYTICS,
                Permission.EXPORT, Permission.CREATE
            },
            resource_restrictions={
                ResourceType.DASHBOARD: {"can_create": True},
                ResourceType.REPORT: {"can_create": True}
            },
            created_at=datetime.now(),
            is_system_role=True
        )
        self.roles["analyst"] = analyst_role
    
    async def create_user(self, user_data: Dict[str, Any]) -> User:
        """Create a new user"""
        user = User(
            id=user_data["id"],
            username=user_data["username"],
            email=user_data["email"],
            roles=set(user_data.get("roles", ["viewer"])),
            department=user_data.get("department"),
            created_at=datetime.now(),
            last_login=None,
            is_active=user_data.get("is_active", True),
            metadata=user_data.get("metadata", {})
        )
        
        self.users[user.id] = user
        return user
    
    async def create_role(self, role_data: Dict[str, Any]) -> Role:
        """Create a new role"""
        role = Role(
            id=role_data["id"],
            name=role_data["name"],
            description=role_data["description"],
            permissions=set(Permission(p) for p in role_data.get("permissions", [])),
            resource_restrictions={
                ResourceType(k): v for k, v in role_data.get("resource_restrictions", {}).items()
            },
            created_at=datetime.now(),
            is_system_role=role_data.get("is_system_role", False)
        )
        
        self.roles[role.id] = role
        return role
    
    async def create_resource(self, resource_data: Dict[str, Any]) -> Resource:
        """Create a new resource"""
        resource = Resource(
            id=resource_data["id"],
            type=ResourceType(resource_data["type"]),
            owner_id=resource_data["owner_id"],
            created_at=datetime.now(),
            metadata=resource_data.get("metadata", {}),
            sensitivity_level=resource_data.get("sensitivity_level", "standard")
        )
        
        self.resources[resource.id] = resource
        return resource
    
    async def assign_role_to_user(self, user_id: str, role_id: str) -> bool:
        """Assign a role to a user"""
        if user_id not in self.users or role_id not in self.roles:
            return False
        
        self.users[user_id].roles.add(role_id)
        return True
    
    async def remove_role_from_user(self, user_id: str, role_id: str) -> bool:
        """Remove a role from a user"""
        if user_id not in self.users:
            return False
        
        self.users[user_id].roles.discard(role_id)
        return True
    
    def get_user_permissions(self, user_id: str) -> Set[Permission]:
        """Get all permissions for a user"""
        if user_id not in self.users:
            return set()
        
        user = self.users[user_id]
        permissions = set()
        
        for role_id in user.roles:
            if role_id in self.roles:
                permissions.update(self.roles[role_id].permissions)
        
        return permissions
    
    def get_user_roles(self, user_id: str) -> List[Role]:
        """Get all roles for a user"""
        if user_id not in self.users:
            return []
        
        user = self.users[user_id]
        return [self.roles[role_id] for role_id in user.roles if role_id in self.roles]
    
    async def check_access(self, user_id: str, resource_id: str, permission: Permission,
                          context: Dict[str, Any] = None) -> bool:
        """Check if a user has access to a resource"""
        if user_id not in self.users or resource_id not in self.resources:
            return False
        
        user = self.users[user_id]
        resource = self.resources[resource_id]
        
        # Check if user is active
        if not user.is_active:
            self._log_access_attempt(user_id, resource_id, resource.type, permission, False, "User inactive")
            return False
        
        # Get user permissions
        user_permissions = self.get_user_permissions(user_id)
        
        # Check if user has the required permission
        if permission not in user_permissions:
            self._log_access_attempt(user_id, resource_id, resource.type, permission, False, "Permission denied")
            return False
        
        # Apply additional policies
        for policy in self.policies:
            if not policy.evaluate(user, resource, permission, context):
                self._log_access_attempt(user_id, resource_id, resource.type, permission, False, "Policy violation")
                return False
        
        # Check resource-specific restrictions
        if not self._check_resource_restrictions(user, resource, permission):
            self._log_access_attempt(user_id, resource_id, resource.type, permission, False, "Resource restriction")
            return False
        
        self._log_access_attempt(user_id, resource_id, resource.type, permission, True, "Access granted")
        return True
    
    def _check_resource_restrictions(self, user: User, resource: Resource, permission: Permission) -> bool:
        """Check resource-specific restrictions from user roles"""
        for role_id in user.roles:
            if role_id not in self.roles:
                continue
            
            role = self.roles[role_id]
            restrictions = role.resource_restrictions.get(resource.type, {})
            
            # Check specific restrictions
            if restrictions:
                # Example: Check if user can create this type of resource
                if permission == Permission.CREATE and not restrictions.get("can_create", True):
                    return False
                
                # Example: Check department restrictions
                if "allowed_departments" in restrictions:
                    if user.department not in restrictions["allowed_departments"]:
                        return False
                
                # Example: Check sensitivity level restrictions
                if "max_sensitivity" in restrictions:
                    sensitivity_levels = ["standard", "sensitive", "confidential"]
                    max_level = restrictions["max_sensitivity"]
                    if sensitivity_levels.index(resource.sensitivity_level) > sensitivity_levels.index(max_level):
                        return False
        
        return True
    
    def _log_access_attempt(self, user_id: str, resource_id: str, resource_type: ResourceType,
                           permission: Permission, granted: bool, reason: str,
                           ip_address: str = None, user_agent: str = None):
        """Log access attempt for auditing"""
        access_request = AccessRequest(
            user_id=user_id,
            resource_id=resource_id,
            resource_type=resource_type,
            permission=permission,
            timestamp=datetime.now(),
            granted=granted,
            reason=reason,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        self.access_log.append(access_request)
        
        # Keep only last 10000 entries to prevent memory issues
        if len(self.access_log) > 10000:
            self.access_log = self.access_log[-10000:]
    
    async def get_user_accessible_resources(self, user_id: str, resource_type: ResourceType = None,
                                          permission: Permission = Permission.READ) -> List[Resource]:
        """Get all resources accessible to a user"""
        if user_id not in self.users:
            return []
        
        accessible_resources = []
        
        for resource in self.resources.values():
            if resource_type and resource.type != resource_type:
                continue
            
            if await self.check_access(user_id, resource.id, permission):
                accessible_resources.append(resource)
        
        return accessible_resources
    
    def get_access_audit_log(self, user_id: str = None, resource_id: str = None,
                           start_date: datetime = None, end_date: datetime = None,
                           granted_only: bool = None) -> List[AccessRequest]:
        """Get audit log with optional filtering"""
        filtered_log = self.access_log
        
        if user_id:
            filtered_log = [req for req in filtered_log if req.user_id == user_id]
        
        if resource_id:
            filtered_log = [req for req in filtered_log if req.resource_id == resource_id]
        
        if start_date:
            filtered_log = [req for req in filtered_log if req.timestamp >= start_date]
        
        if end_date:
            filtered_log = [req for req in filtered_log if req.timestamp <= end_date]
        
        if granted_only is not None:
            filtered_log = [req for req in filtered_log if req.granted == granted_only]
        
        return sorted(filtered_log, key=lambda x: x.timestamp, reverse=True)
    
    def get_security_report(self) -> Dict[str, Any]:
        """Generate security report"""
        total_users = len(self.users)
        active_users = len([u for u in self.users.values() if u.is_active])
        total_roles = len(self.roles)
        total_resources = len(self.resources)
        
        # Access statistics
        recent_log = [req for req in self.access_log if req.timestamp > datetime.now() - timedelta(days=7)]
        total_access_attempts = len(recent_log)
        granted_attempts = len([req for req in recent_log if req.granted])
        denied_attempts = total_access_attempts - granted_attempts
        
        # Security incidents (denied access attempts)
        security_incidents = [req for req in recent_log if not req.granted]
        
        # Role distribution
        role_distribution = {}
        for user in self.users.values():
            for role_id in user.roles:
                role_name = self.roles[role_id].name if role_id in self.roles else role_id
                role_distribution[role_name] = role_distribution.get(role_name, 0) + 1
        
        return {
            'summary': {
                'total_users': total_users,
                'active_users': active_users,
                'total_roles': total_roles,
                'total_resources': total_resources
            },
            'access_statistics': {
                'total_attempts_last_7_days': total_access_attempts,
                'granted_attempts': granted_attempts,
                'denied_attempts': denied_attempts,
                'success_rate_percent': round(granted_attempts / total_access_attempts * 100, 2) if total_access_attempts > 0 else 0
            },
            'role_distribution': role_distribution,
            'recent_security_incidents': [req.to_dict() for req in security_incidents[:10]],
            'recommendations': self._get_security_recommendations()
        }
    
    def _get_security_recommendations(self) -> List[str]:
        """Get security recommendations"""
        recommendations = []
        
        # Check for users with too many roles
        users_with_many_roles = [u for u in self.users.values() if len(u.roles) > 3]
        if users_with_many_roles:
            recommendations.append(f"{len(users_with_many_roles)} users have more than 3 roles - review for least privilege")
        
        # Check for unused roles
        used_roles = set()
        for user in self.users.values():
            used_roles.update(user.roles)
        unused_roles = set(self.roles.keys()) - used_roles
        if unused_roles:
            recommendations.append(f"{len(unused_roles)} roles are not assigned to any users - consider removing")
        
        # Check for resources without proper ownership
        orphaned_resources = [r for r in self.resources.values() if r.owner_id not in self.users]
        if orphaned_resources:
            recommendations.append(f"{len(orphaned_resources)} resources have invalid owners - review ownership")
        
        # Check access failure rate
        recent_log = [req for req in self.access_log if req.timestamp > datetime.now() - timedelta(days=7)]
        if recent_log:
            failure_rate = len([req for req in recent_log if not req.granted]) / len(recent_log)
            if failure_rate > 0.1:  # More than 10% failures
                recommendations.append(f"High access failure rate ({failure_rate:.1%}) - review permissions")
        
        return recommendations

# Global RBAC service instance
rbac_service = RBACService()