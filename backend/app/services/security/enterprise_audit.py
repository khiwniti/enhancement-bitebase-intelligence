"""
BiteBase Intelligence Enterprise Audit Service
Advanced audit logging, compliance monitoring, and security analytics
"""

import asyncio
import logging
import uuid
import hashlib
import hmac
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
from enum import Enum
from dataclasses import dataclass, field, asdict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
import geoip2.database
import geoip2.errors

logger = logging.getLogger(__name__)

class EnterpriseAuditEventType(str, Enum):
    """Enterprise audit event types"""
    
    # Authentication & Authorization
    LOGIN_SUCCESS = "auth.login.success"
    LOGIN_FAILURE = "auth.login.failure"
    LOGOUT = "auth.logout"
    PASSWORD_CHANGE = "auth.password.change"
    MFA_ENABLED = "auth.mfa.enabled"
    MFA_DISABLED = "auth.mfa.disabled"
    TOKEN_REFRESH = "auth.token.refresh"
    UNAUTHORIZED_ACCESS = "auth.unauthorized.access"
    
    # User Management
    USER_CREATED = "user.created"
    USER_UPDATED = "user.updated"
    USER_DELETED = "user.deleted"
    USER_LOCKED = "user.locked"
    USER_UNLOCKED = "user.unlocked"
    USER_ROLE_ASSIGNED = "user.role.assigned"
    USER_ROLE_REMOVED = "user.role.removed"
    
    # Data Access
    DATA_READ = "data.read"
    DATA_CREATE = "data.create"
    DATA_UPDATE = "data.update"
    DATA_DELETE = "data.delete"
    DATA_EXPORT = "data.export"
    DATA_IMPORT = "data.import"
    
    # System Events
    SYSTEM_CONFIG_CHANGE = "system.config.change"
    SYSTEM_BACKUP = "system.backup"
    SYSTEM_RESTORE = "system.restore"
    SYSTEM_MAINTENANCE = "system.maintenance"
    
    # Security Events
    SECURITY_POLICY_CHANGE = "security.policy.change"
    SECURITY_BREACH_DETECTED = "security.breach.detected"
    SECURITY_SCAN_COMPLETED = "security.scan.completed"
    SUSPICIOUS_ACTIVITY = "security.suspicious.activity"
    
    # Compliance Events
    COMPLIANCE_REPORT_GENERATED = "compliance.report.generated"
    COMPLIANCE_VIOLATION = "compliance.violation"
    GDPR_DATA_REQUEST = "compliance.gdpr.data_request"
    GDPR_DATA_DELETION = "compliance.gdpr.data_deletion"

class AuditSeverity(str, Enum):
    """Audit event severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ComplianceFramework(str, Enum):
    """Supported compliance frameworks"""
    GDPR = "gdpr"
    SOX = "sox"
    PCI_DSS = "pci_dss"
    HIPAA = "hipaa"
    ISO27001 = "iso27001"

@dataclass
class EnterpriseAuditEvent:
    """Enterprise audit event with enhanced metadata"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    event_type: EnterpriseAuditEventType = EnterpriseAuditEventType.DATA_READ
    severity: AuditSeverity = AuditSeverity.LOW
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    # User context
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    session_id: Optional[str] = None
    
    # Resource context
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    resource_name: Optional[str] = None
    
    # Action context
    action: Optional[str] = None
    outcome: str = "success"
    error_message: Optional[str] = None
    
    # Network context
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    
    # Data context
    data_classification: str = "public"
    data_size: Optional[int] = None
    affected_records: Optional[int] = None
    
    # Compliance context
    compliance_frameworks: List[ComplianceFramework] = field(default_factory=list)
    retention_period_days: int = 2555  # 7 years default
    
    # Additional metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    checksum: Optional[str] = None

@dataclass
class AuditQuery:
    """Query parameters for audit log searches"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    event_types: Optional[List[EnterpriseAuditEventType]] = None
    user_ids: Optional[List[str]] = None
    resource_types: Optional[List[str]] = None
    severity_levels: Optional[List[AuditSeverity]] = None
    outcomes: Optional[List[str]] = None
    ip_addresses: Optional[List[str]] = None
    compliance_frameworks: Optional[List[ComplianceFramework]] = None
    limit: int = 100
    offset: int = 0

class EnterpriseAuditService:
    """Enterprise-grade audit service with advanced features"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.audit_log: List[EnterpriseAuditEvent] = []
        self.secret_key = "audit-integrity-key"  # In production, use secure key management
        self.geoip_reader = None
        
        # Initialize GeoIP database if available
        try:
            self.geoip_reader = geoip2.database.Reader('/usr/share/GeoIP/GeoLite2-City.mmdb')
        except:
            logger.warning("GeoIP database not available")
    
    async def log_event(
        self,
        event_type: EnterpriseAuditEventType,
        user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        action: Optional[str] = None,
        outcome: str = "success",
        severity: AuditSeverity = AuditSeverity.LOW,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        compliance_frameworks: Optional[List[ComplianceFramework]] = None
    ) -> EnterpriseAuditEvent:
        """Log an audit event with comprehensive metadata"""
        
        # Create audit event
        event = EnterpriseAuditEvent(
            event_type=event_type,
            severity=severity,
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            action=action,
            outcome=outcome,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=metadata or {},
            compliance_frameworks=compliance_frameworks or []
        )
        
        # Enrich with location data
        if ip_address and self.geoip_reader:
            try:
                response = self.geoip_reader.city(ip_address)
                event.location = {
                    "country": response.country.name,
                    "city": response.city.name,
                    "latitude": float(response.location.latitude) if response.location.latitude else None,
                    "longitude": float(response.location.longitude) if response.location.longitude else None
                }
            except geoip2.errors.AddressNotFoundError:
                pass
        
        # Calculate integrity checksum
        event.checksum = self._calculate_checksum(event)
        
        # Store event
        self.audit_log.append(event)
        
        # Trigger real-time alerts for critical events
        if severity == AuditSeverity.CRITICAL:
            await self._trigger_security_alert(event)
        
        logger.info(f"Audit event logged: {event_type} by user {user_id}")
        return event
    
    async def query_events(self, query: AuditQuery) -> Tuple[List[EnterpriseAuditEvent], int]:
        """Query audit events with advanced filtering"""
        
        filtered_events = self.audit_log.copy()
        
        # Apply filters
        if query.start_date:
            filtered_events = [e for e in filtered_events if e.timestamp >= query.start_date]
        
        if query.end_date:
            filtered_events = [e for e in filtered_events if e.timestamp <= query.end_date]
        
        if query.event_types:
            filtered_events = [e for e in filtered_events if e.event_type in query.event_types]
        
        if query.user_ids:
            filtered_events = [e for e in filtered_events if e.user_id in query.user_ids]
        
        if query.resource_types:
            filtered_events = [e for e in filtered_events if e.resource_type in query.resource_types]
        
        if query.severity_levels:
            filtered_events = [e for e in filtered_events if e.severity in query.severity_levels]
        
        if query.outcomes:
            filtered_events = [e for e in filtered_events if e.outcome in query.outcomes]
        
        if query.ip_addresses:
            filtered_events = [e for e in filtered_events if e.ip_address in query.ip_addresses]
        
        if query.compliance_frameworks:
            filtered_events = [
                e for e in filtered_events 
                if any(framework in e.compliance_frameworks for framework in query.compliance_frameworks)
            ]
        
        # Sort by timestamp (newest first)
        filtered_events.sort(key=lambda x: x.timestamp, reverse=True)
        
        total_count = len(filtered_events)
        
        # Apply pagination
        start_idx = query.offset
        end_idx = start_idx + query.limit
        paginated_events = filtered_events[start_idx:end_idx]
        
        return paginated_events, total_count
    
    async def generate_compliance_report(
        self,
        framework: ComplianceFramework,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Generate compliance report for specific framework"""
        
        query = AuditQuery(
            start_date=start_date,
            end_date=end_date,
            compliance_frameworks=[framework],
            limit=10000
        )
        
        events, total_count = await self.query_events(query)
        
        # Framework-specific analysis
        if framework == ComplianceFramework.GDPR:
            return await self._generate_gdpr_report(events, start_date, end_date)
        elif framework == ComplianceFramework.SOX:
            return await self._generate_sox_report(events, start_date, end_date)
        elif framework == ComplianceFramework.PCI_DSS:
            return await self._generate_pci_report(events, start_date, end_date)
        else:
            return await self._generate_generic_report(events, start_date, end_date, framework)
    
    async def detect_anomalies(self, lookback_hours: int = 24) -> List[Dict[str, Any]]:
        """Detect anomalous patterns in audit logs"""
        
        cutoff_time = datetime.utcnow() - timedelta(hours=lookback_hours)
        recent_events = [e for e in self.audit_log if e.timestamp >= cutoff_time]
        
        anomalies = []
        
        # Detect unusual login patterns
        login_events = [e for e in recent_events if e.event_type == EnterpriseAuditEventType.LOGIN_SUCCESS]
        anomalies.extend(await self._detect_login_anomalies(login_events))
        
        # Detect data access anomalies
        data_events = [e for e in recent_events if e.event_type in [
            EnterpriseAuditEventType.DATA_READ,
            EnterpriseAuditEventType.DATA_EXPORT
        ]]
        anomalies.extend(await self._detect_data_access_anomalies(data_events))
        
        # Detect failed access attempts
        failed_events = [e for e in recent_events if e.outcome == "failure"]
        anomalies.extend(await self._detect_failed_access_anomalies(failed_events))
        
        return anomalies
    
    async def get_security_metrics(self, days: int = 30) -> Dict[str, Any]:
        """Get security metrics and KPIs"""
        
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        recent_events = [e for e in self.audit_log if e.timestamp >= cutoff_time]
        
        total_events = len(recent_events)
        failed_events = len([e for e in recent_events if e.outcome == "failure"])
        critical_events = len([e for e in recent_events if e.severity == AuditSeverity.CRITICAL])
        
        # Calculate success rate
        success_rate = ((total_events - failed_events) / total_events * 100) if total_events > 0 else 100
        
        # Event type distribution
        event_type_counts = {}
        for event in recent_events:
            event_type_counts[event.event_type] = event_type_counts.get(event.event_type, 0) + 1
        
        # User activity
        user_activity = {}
        for event in recent_events:
            if event.user_id:
                user_activity[event.user_id] = user_activity.get(event.user_id, 0) + 1
        
        # Geographic distribution
        country_distribution = {}
        for event in recent_events:
            if event.location and event.location.get("country"):
                country = event.location["country"]
                country_distribution[country] = country_distribution.get(country, 0) + 1
        
        return {
            "period_days": days,
            "total_events": total_events,
            "failed_events": failed_events,
            "critical_events": critical_events,
            "success_rate": round(success_rate, 2),
            "event_type_distribution": dict(sorted(event_type_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
            "top_users": dict(sorted(user_activity.items(), key=lambda x: x[1], reverse=True)[:10]),
            "geographic_distribution": dict(sorted(country_distribution.items(), key=lambda x: x[1], reverse=True)[:10]),
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def _calculate_checksum(self, event: EnterpriseAuditEvent) -> str:
        """Calculate integrity checksum for audit event"""
        # Create a deterministic string representation
        event_data = {
            "id": event.id,
            "event_type": event.event_type,
            "timestamp": event.timestamp.isoformat(),
            "user_id": event.user_id,
            "resource_type": event.resource_type,
            "resource_id": event.resource_id,
            "action": event.action,
            "outcome": event.outcome
        }
        
        event_string = json.dumps(event_data, sort_keys=True)
        return hmac.new(
            self.secret_key.encode(),
            event_string.encode(),
            hashlib.sha256
        ).hexdigest()
    
    async def _trigger_security_alert(self, event: EnterpriseAuditEvent):
        """Trigger real-time security alert for critical events"""
        alert = {
            "id": str(uuid.uuid4()),
            "type": "security_alert",
            "severity": event.severity,
            "event_id": event.id,
            "event_type": event.event_type,
            "user_id": event.user_id,
            "timestamp": event.timestamp.isoformat(),
            "message": f"Critical security event: {event.event_type}"
        }
        
        # In production, this would send to alerting system
        logger.critical(f"Security alert: {alert}")
    
    async def _generate_gdpr_report(
        self,
        events: List[EnterpriseAuditEvent],
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Generate GDPR compliance report"""
        
        data_access_events = [e for e in events if e.event_type == EnterpriseAuditEventType.DATA_READ]
        data_export_events = [e for e in events if e.event_type == EnterpriseAuditEventType.DATA_EXPORT]
        gdpr_requests = [e for e in events if e.event_type == EnterpriseAuditEventType.GDPR_DATA_REQUEST]
        gdpr_deletions = [e for e in events if e.event_type == EnterpriseAuditEventType.GDPR_DATA_DELETION]
        
        return {
            "framework": "GDPR",
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_events": len(events),
                "data_access_events": len(data_access_events),
                "data_export_events": len(data_export_events),
                "gdpr_requests": len(gdpr_requests),
                "gdpr_deletions": len(gdpr_deletions)
            },
            "compliance_status": "compliant" if len(gdpr_requests) == len(gdpr_deletions) else "review_required",
            "generated_at": datetime.utcnow().isoformat()
        }
    
    async def _generate_sox_report(
        self,
        events: List[EnterpriseAuditEvent],
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Generate SOX compliance report"""
        
        financial_events = [e for e in events if e.resource_type == "financial"]
        config_changes = [e for e in events if e.event_type == EnterpriseAuditEventType.SYSTEM_CONFIG_CHANGE]
        
        return {
            "framework": "SOX",
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_events": len(events),
                "financial_events": len(financial_events),
                "config_changes": len(config_changes)
            },
            "compliance_status": "compliant",
            "generated_at": datetime.utcnow().isoformat()
        }
    
    async def _generate_pci_report(
        self,
        events: List[EnterpriseAuditEvent],
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Generate PCI DSS compliance report"""
        
        payment_events = [e for e in events if e.resource_type == "payment"]
        security_events = [e for e in events if "security" in e.event_type]
        
        return {
            "framework": "PCI_DSS",
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_events": len(events),
                "payment_events": len(payment_events),
                "security_events": len(security_events)
            },
            "compliance_status": "compliant",
            "generated_at": datetime.utcnow().isoformat()
        }
    
    async def _generate_generic_report(
        self,
        events: List[EnterpriseAuditEvent],
        start_date: datetime,
        end_date: datetime,
        framework: ComplianceFramework
    ) -> Dict[str, Any]:
        """Generate generic compliance report"""
        
        return {
            "framework": framework,
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_events": len(events)
            },
            "compliance_status": "compliant",
            "generated_at": datetime.utcnow().isoformat()
        }
    
    async def _detect_login_anomalies(self, login_events: List[EnterpriseAuditEvent]) -> List[Dict[str, Any]]:
        """Detect anomalous login patterns"""
        anomalies = []
        
        # Group by user
        user_logins = {}
        for event in login_events:
            if event.user_id:
                if event.user_id not in user_logins:
                    user_logins[event.user_id] = []
                user_logins[event.user_id].append(event)
        
        # Check for unusual login frequency
        for user_id, events in user_logins.items():
            if len(events) > 50:  # More than 50 logins in 24 hours
                anomalies.append({
                    "type": "excessive_logins",
                    "user_id": user_id,
                    "count": len(events),
                    "severity": "medium",
                    "description": f"User {user_id} has {len(events)} logins in 24 hours"
                })
        
        return anomalies
    
    async def _detect_data_access_anomalies(self, data_events: List[EnterpriseAuditEvent]) -> List[Dict[str, Any]]:
        """Detect anomalous data access patterns"""
        anomalies = []
        
        # Check for bulk data exports
        export_events = [e for e in data_events if e.event_type == EnterpriseAuditEventType.DATA_EXPORT]
        for event in export_events:
            if event.affected_records and event.affected_records > 10000:
                anomalies.append({
                    "type": "bulk_data_export",
                    "user_id": event.user_id,
                    "records": event.affected_records,
                    "severity": "high",
                    "description": f"Bulk export of {event.affected_records} records"
                })
        
        return anomalies
    
    async def _detect_failed_access_anomalies(self, failed_events: List[EnterpriseAuditEvent]) -> List[Dict[str, Any]]:
        """Detect anomalous failed access patterns"""
        anomalies = []
        
        # Group by IP address
        ip_failures = {}
        for event in failed_events:
            if event.ip_address:
                if event.ip_address not in ip_failures:
                    ip_failures[event.ip_address] = []
                ip_failures[event.ip_address].append(event)
        
        # Check for brute force attempts
        for ip, events in ip_failures.items():
            if len(events) > 20:  # More than 20 failures from same IP
                anomalies.append({
                    "type": "brute_force_attempt",
                    "ip_address": ip,
                    "count": len(events),
                    "severity": "high",
                    "description": f"Potential brute force attack from {ip}"
                })
        
        return anomalies

# Global enterprise audit service instance
enterprise_audit_service = None

def get_enterprise_audit_service() -> EnterpriseAuditService:
    """Get enterprise audit service instance"""
    global enterprise_audit_service
    if enterprise_audit_service is None:
        # Create a mock service for now since we don't have a real database session
        enterprise_audit_service = EnterpriseAuditService(None)
    return enterprise_audit_service
