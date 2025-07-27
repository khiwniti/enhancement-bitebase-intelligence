"""
Comprehensive Audit Logging Service
Tracks all user activities and system events for compliance and security
"""

import json
import hashlib
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict
import traceback
import sys
import os

class AuditEventType(Enum):
    # Authentication events
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    
    # User management events
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    USER_ACTIVATED = "user_activated"
    USER_DEACTIVATED = "user_deactivated"
    
    # Role and permission events
    ROLE_ASSIGNED = "role_assigned"
    ROLE_REMOVED = "role_removed"
    PERMISSION_GRANTED = "permission_granted"
    PERMISSION_DENIED = "permission_denied"
    
    # Data access events
    DATA_READ = "data_read"
    DATA_CREATED = "data_created"
    DATA_UPDATED = "data_updated"
    DATA_DELETED = "data_deleted"
    DATA_EXPORTED = "data_exported"
    
    # Dashboard events
    DASHBOARD_VIEWED = "dashboard_viewed"
    DASHBOARD_CREATED = "dashboard_created"
    DASHBOARD_UPDATED = "dashboard_updated"
    DASHBOARD_DELETED = "dashboard_deleted"
    DASHBOARD_SHARED = "dashboard_shared"
    
    # System events
    SYSTEM_ERROR = "system_error"
    SYSTEM_WARNING = "system_warning"
    CONFIG_CHANGED = "config_changed"
    BACKUP_CREATED = "backup_created"
    BACKUP_RESTORED = "backup_restored"
    
    # Security events
    SECURITY_VIOLATION = "security_violation"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    UNAUTHORIZED_ACCESS = "unauthorized_access"

class AuditSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class AuditEvent:
    """Represents an audit event"""
    id: str
    event_type: AuditEventType
    severity: AuditSeverity
    timestamp: datetime
    user_id: Optional[str]
    username: Optional[str]
    resource_type: Optional[str]
    resource_id: Optional[str]
    action: str
    description: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    session_id: Optional[str]
    request_id: Optional[str]
    details: Dict[str, Any]
    tags: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            'event_type': self.event_type.value,
            'severity': self.severity.value,
            'timestamp': self.timestamp.isoformat()
        }
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str)

class AuditFilter:
    """Filter for audit log queries"""
    
    def __init__(self):
        self.user_ids: Optional[List[str]] = None
        self.event_types: Optional[List[AuditEventType]] = None
        self.severities: Optional[List[AuditSeverity]] = None
        self.start_date: Optional[datetime] = None
        self.end_date: Optional[datetime] = None
        self.resource_types: Optional[List[str]] = None
        self.resource_ids: Optional[List[str]] = None
        self.tags: Optional[List[str]] = None
        self.search_text: Optional[str] = None
        self.ip_addresses: Optional[List[str]] = None
    
    def matches(self, event: AuditEvent) -> bool:
        """Check if an event matches this filter"""
        if self.user_ids and event.user_id not in self.user_ids:
            return False
        
        if self.event_types and event.event_type not in self.event_types:
            return False
        
        if self.severities and event.severity not in self.severities:
            return False
        
        if self.start_date and event.timestamp < self.start_date:
            return False
        
        if self.end_date and event.timestamp > self.end_date:
            return False
        
        if self.resource_types and event.resource_type not in self.resource_types:
            return False
        
        if self.resource_ids and event.resource_id not in self.resource_ids:
            return False
        
        if self.tags and not any(tag in event.tags for tag in self.tags):
            return False
        
        if self.search_text:
            search_lower = self.search_text.lower()
            if not any(search_lower in str(field).lower() for field in [
                event.action, event.description, event.username
            ]):
                return False
        
        if self.ip_addresses and event.ip_address not in self.ip_addresses:
            return False
        
        return True

class AuditStorage:
    """Base class for audit storage backends"""
    
    async def store_event(self, event: AuditEvent) -> bool:
        raise NotImplementedError
    
    async def query_events(self, filter: AuditFilter, limit: int = 100, offset: int = 0) -> List[AuditEvent]:
        raise NotImplementedError
    
    async def count_events(self, filter: AuditFilter) -> int:
        raise NotImplementedError

class InMemoryAuditStorage(AuditStorage):
    """In-memory storage for audit events (for development/testing)"""
    
    def __init__(self, max_events: int = 10000):
        self.events: List[AuditEvent] = []
        self.max_events = max_events
    
    async def store_event(self, event: AuditEvent) -> bool:
        self.events.append(event)
        
        # Keep only the most recent events
        if len(self.events) > self.max_events:
            self.events = self.events[-self.max_events:]
        
        return True
    
    async def query_events(self, filter: AuditFilter, limit: int = 100, offset: int = 0) -> List[AuditEvent]:
        # Filter events
        filtered_events = [event for event in self.events if filter.matches(event)]
        
        # Sort by timestamp (newest first)
        filtered_events.sort(key=lambda e: e.timestamp, reverse=True)
        
        # Apply pagination
        return filtered_events[offset:offset + limit]
    
    async def count_events(self, filter: AuditFilter) -> int:
        return len([event for event in self.events if filter.matches(event)])

class FileAuditStorage(AuditStorage):
    """File-based storage for audit events"""
    
    def __init__(self, log_file_path: str = "audit.log", max_file_size: int = 100 * 1024 * 1024):
        self.log_file_path = log_file_path
        self.max_file_size = max_file_size
        self.events_cache: List[AuditEvent] = []
        self.cache_loaded = False
    
    async def store_event(self, event: AuditEvent) -> bool:
        try:
            # Write to file
            with open(self.log_file_path, 'a', encoding='utf-8') as f:
                f.write(event.to_json() + '\n')
            
            # Add to cache
            self.events_cache.append(event)
            
            # Rotate log file if it gets too large
            if os.path.getsize(self.log_file_path) > self.max_file_size:
                await self._rotate_log_file()
            
            return True
        except Exception as e:
            print(f"Failed to store audit event: {e}")
            return False
    
    async def _rotate_log_file(self):
        """Rotate log file when it gets too large"""
        try:
            # Move current log to backup
            backup_path = f"{self.log_file_path}.{int(datetime.now().timestamp())}"
            os.rename(self.log_file_path, backup_path)
            
            # Clear cache to force reload
            self.events_cache = []
            self.cache_loaded = False
            
        except Exception as e:
            print(f"Failed to rotate audit log file: {e}")
    
    async def _load_events_from_file(self):
        """Load events from file into cache"""
        if self.cache_loaded:
            return
        
        self.events_cache = []
        
        if not os.path.exists(self.log_file_path):
            self.cache_loaded = True
            return
        
        try:
            with open(self.log_file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    try:
                        event_data = json.loads(line.strip())
                        # Reconstruct AuditEvent object
                        event = AuditEvent(
                            id=event_data['id'],
                            event_type=AuditEventType(event_data['event_type']),
                            severity=AuditSeverity(event_data['severity']),
                            timestamp=datetime.fromisoformat(event_data['timestamp']),
                            user_id=event_data.get('user_id'),
                            username=event_data.get('username'),
                            resource_type=event_data.get('resource_type'),
                            resource_id=event_data.get('resource_id'),
                            action=event_data['action'],
                            description=event_data['description'],
                            ip_address=event_data.get('ip_address'),
                            user_agent=event_data.get('user_agent'),
                            session_id=event_data.get('session_id'),
                            request_id=event_data.get('request_id'),
                            details=event_data.get('details', {}),
                            tags=event_data.get('tags', [])
                        )
                        self.events_cache.append(event)
                    except Exception as e:
                        print(f"Failed to parse audit event line: {e}")
            
            self.cache_loaded = True
            
        except Exception as e:
            print(f"Failed to load audit events from file: {e}")
            self.cache_loaded = True
    
    async def query_events(self, filter: AuditFilter, limit: int = 100, offset: int = 0) -> List[AuditEvent]:
        await self._load_events_from_file()
        
        # Filter events
        filtered_events = [event for event in self.events_cache if filter.matches(event)]
        
        # Sort by timestamp (newest first)
        filtered_events.sort(key=lambda e: e.timestamp, reverse=True)
        
        # Apply pagination
        return filtered_events[offset:offset + limit]
    
    async def count_events(self, filter: AuditFilter) -> int:
        await self._load_events_from_file()
        return len([event for event in self.events_cache if filter.matches(event)])

class AuditService:
    """Main audit service"""
    
    def __init__(self, storage: AuditStorage = None):
        self.storage = storage or InMemoryAuditStorage()
        self.event_listeners: Dict[AuditEventType, List[callable]] = {}
        self.auto_archive_enabled = True
        self.archive_after_days = 90
        
    def add_event_listener(self, event_type: AuditEventType, callback: callable):
        """Add a listener for specific audit events"""
        if event_type not in self.event_listeners:
            self.event_listeners[event_type] = []
        self.event_listeners[event_type].append(callback)
    
    def remove_event_listener(self, event_type: AuditEventType, callback: callable):
        """Remove an event listener"""
        if event_type in self.event_listeners:
            self.event_listeners[event_type].remove(callback)
    
    async def log_event(self, event_type: AuditEventType, action: str, description: str,
                       user_id: str = None, username: str = None,
                       resource_type: str = None, resource_id: str = None,
                       severity: AuditSeverity = AuditSeverity.LOW,
                       ip_address: str = None, user_agent: str = None,
                       session_id: str = None, request_id: str = None,
                       details: Dict[str, Any] = None, tags: List[str] = None) -> AuditEvent:
        """Log an audit event"""
        
        # Generate unique event ID
        event_id = hashlib.md5(
            f"{datetime.now().isoformat()}{user_id}{action}{resource_id}".encode()
        ).hexdigest()
        
        event = AuditEvent(
            id=event_id,
            event_type=event_type,
            severity=severity,
            timestamp=datetime.now(),
            user_id=user_id,
            username=username,
            resource_type=resource_type,
            resource_id=resource_id,
            action=action,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id,
            request_id=request_id,
            details=details or {},
            tags=tags or []
        )
        
        # Store the event
        await self.storage.store_event(event)
        
        # Notify listeners
        if event_type in self.event_listeners:
            for callback in self.event_listeners[event_type]:
                try:
                    if callable(callback):
                        await callback(event) if hasattr(callback, '__call__') else callback(event)
                except Exception as e:
                    print(f"Error in audit event listener: {e}")
        
        return event
    
    async def log_user_login(self, user_id: str, username: str, success: bool,
                           ip_address: str = None, user_agent: str = None,
                           failure_reason: str = None):
        """Log user login attempt"""
        if success:
            await self.log_event(
                event_type=AuditEventType.LOGIN_SUCCESS,
                action="user_login",
                description=f"User {username} logged in successfully",
                user_id=user_id,
                username=username,
                severity=AuditSeverity.LOW,
                ip_address=ip_address,
                user_agent=user_agent,
                tags=["authentication", "login"]
            )
        else:
            await self.log_event(
                event_type=AuditEventType.LOGIN_FAILURE,
                action="user_login_failed",
                description=f"Failed login attempt for user {username}: {failure_reason}",
                user_id=user_id,
                username=username,
                severity=AuditSeverity.MEDIUM,
                ip_address=ip_address,
                user_agent=user_agent,
                details={"failure_reason": failure_reason},
                tags=["authentication", "login", "security"]
            )
    
    async def log_data_access(self, user_id: str, username: str, resource_type: str,
                            resource_id: str, action: str, success: bool = True,
                            ip_address: str = None, details: Dict[str, Any] = None):
        """Log data access event"""
        event_type_map = {
            "read": AuditEventType.DATA_READ,
            "create": AuditEventType.DATA_CREATED,
            "update": AuditEventType.DATA_UPDATED,
            "delete": AuditEventType.DATA_DELETED,
            "export": AuditEventType.DATA_EXPORTED
        }
        
        event_type = event_type_map.get(action.lower(), AuditEventType.DATA_READ)
        severity = AuditSeverity.HIGH if action.lower() in ["delete", "export"] else AuditSeverity.LOW
        
        await self.log_event(
            event_type=event_type,
            action=f"data_{action}",
            description=f"User {username} performed {action} on {resource_type} {resource_id}",
            user_id=user_id,
            username=username,
            resource_type=resource_type,
            resource_id=resource_id,
            severity=severity,
            ip_address=ip_address,
            details=details,
            tags=["data_access", action.lower()]
        )
    
    async def log_security_event(self, event_type: AuditEventType, description: str,
                                user_id: str = None, username: str = None,
                                ip_address: str = None, severity: AuditSeverity = AuditSeverity.HIGH,
                                details: Dict[str, Any] = None):
        """Log security-related event"""
        await self.log_event(
            event_type=event_type,
            action="security_event",
            description=description,
            user_id=user_id,
            username=username,
            severity=severity,
            ip_address=ip_address,
            details=details,
            tags=["security"]
        )
    
    async def log_system_error(self, error: Exception, context: str = None,
                             user_id: str = None, request_id: str = None):
        """Log system error"""
        error_details = {
            "error_type": type(error).__name__,
            "error_message": str(error),
            "traceback": traceback.format_exc(),
            "context": context
        }
        
        await self.log_event(
            event_type=AuditEventType.SYSTEM_ERROR,
            action="system_error",
            description=f"System error occurred: {type(error).__name__}: {str(error)}",
            user_id=user_id,
            severity=AuditSeverity.HIGH,
            request_id=request_id,
            details=error_details,
            tags=["error", "system"]
        )
    
    async def query_events(self, filter: AuditFilter = None, limit: int = 100, 
                          offset: int = 0) -> List[AuditEvent]:
        """Query audit events"""
        if filter is None:
            filter = AuditFilter()
        
        return await self.storage.query_events(filter, limit, offset)
    
    async def count_events(self, filter: AuditFilter = None) -> int:
        """Count audit events matching filter"""
        if filter is None:
            filter = AuditFilter()
        
        return await self.storage.count_events(filter)
    
    async def get_user_activity(self, user_id: str, days: int = 7) -> List[AuditEvent]:
        """Get recent activity for a user"""
        filter = AuditFilter()
        filter.user_ids = [user_id]
        filter.start_date = datetime.now() - timedelta(days=days)
        
        return await self.query_events(filter, limit=1000)
    
    async def get_security_incidents(self, days: int = 7) -> List[AuditEvent]:
        """Get recent security incidents"""
        filter = AuditFilter()
        filter.event_types = [
            AuditEventType.LOGIN_FAILURE,
            AuditEventType.SECURITY_VIOLATION,
            AuditEventType.SUSPICIOUS_ACTIVITY,
            AuditEventType.UNAUTHORIZED_ACCESS,
            AuditEventType.PERMISSION_DENIED
        ]
        filter.start_date = datetime.now() - timedelta(days=days)
        
        return await self.query_events(filter, limit=1000)
    
    async def generate_compliance_report(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate compliance report for a date range"""
        filter = AuditFilter()
        filter.start_date = start_date
        filter.end_date = end_date
        
        all_events = await self.query_events(filter, limit=10000)
        
        # Event type distribution
        event_type_counts = {}
        for event in all_events:
            event_type = event.event_type.value
            event_type_counts[event_type] = event_type_counts.get(event_type, 0) + 1
        
        # User activity
        user_activity = {}
        for event in all_events:
            if event.user_id:
                user_activity[event.user_id] = user_activity.get(event.user_id, 0) + 1
        
        # Security events
        security_events = [e for e in all_events if any(tag in e.tags for tag in ["security", "authentication"])]
        
        # High severity events
        high_severity_events = [e for e in all_events if e.severity in [AuditSeverity.HIGH, AuditSeverity.CRITICAL]]
        
        return {
            "report_period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_events": len(all_events),
                "unique_users": len(user_activity),
                "security_events": len(security_events),
                "high_severity_events": len(high_severity_events)
            },
            "event_type_distribution": event_type_counts,
            "top_active_users": sorted(user_activity.items(), key=lambda x: x[1], reverse=True)[:10],
            "security_incidents": [e.to_dict() for e in security_events[:20]],
            "high_severity_incidents": [e.to_dict() for e in high_severity_events[:20]]
        }

# Global audit service instance
audit_service = AuditService(FileAuditStorage("audit.log"))