"""
Enterprise API Monitoring Service
Comprehensive API monitoring, metrics collection, and performance analytics
"""

import asyncio
import time
import logging
import json
import uuid
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field, asdict
from enum import Enum
import redis
import statistics
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

class APIMetricType(str, Enum):
    """API metric types"""
    REQUEST_COUNT = "request_count"
    RESPONSE_TIME = "response_time"
    ERROR_RATE = "error_rate"
    THROUGHPUT = "throughput"
    CONCURRENT_USERS = "concurrent_users"
    BANDWIDTH_USAGE = "bandwidth_usage"

class AlertSeverity(str, Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

@dataclass
class APIRequest:
    """API request tracking data"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = field(default_factory=datetime.utcnow)
    method: str = "GET"
    endpoint: str = "/"
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_size: int = 0
    response_size: int = 0
    response_time_ms: float = 0.0
    status_code: int = 200
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class APIMetric:
    """API metric data point"""
    timestamp: datetime
    metric_type: APIMetricType
    value: float
    endpoint: Optional[str] = None
    user_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class APIAlert:
    """API monitoring alert"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = field(default_factory=datetime.utcnow)
    severity: AlertSeverity = AlertSeverity.INFO
    metric_type: APIMetricType = APIMetricType.REQUEST_COUNT
    threshold_value: float = 0.0
    current_value: float = 0.0
    endpoint: Optional[str] = None
    message: str = ""
    resolved: bool = False
    resolved_at: Optional[datetime] = None

@dataclass
class PerformanceThreshold:
    """Performance monitoring threshold"""
    metric_type: APIMetricType
    threshold_value: float
    comparison: str  # "gt", "lt", "eq"
    window_minutes: int = 5
    severity: AlertSeverity = AlertSeverity.WARNING
    endpoint_pattern: Optional[str] = None
    enabled: bool = True

class EnterpriseAPIMonitor:
    """Enterprise-grade API monitoring service"""
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis = redis_client or redis.Redis(host='localhost', port=6379, db=1)
        self.requests: deque = deque(maxlen=10000)  # Keep last 10k requests in memory
        self.metrics: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.alerts: List[APIAlert] = []
        self.thresholds: List[PerformanceThreshold] = []
        
        # Performance tracking
        self.response_times: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
        self.error_counts: Dict[str, int] = defaultdict(int)
        self.request_counts: Dict[str, int] = defaultdict(int)
        
        # Initialize default thresholds
        self._initialize_default_thresholds()
    
    def _initialize_default_thresholds(self):
        """Initialize default performance thresholds"""
        
        # Response time thresholds
        response_time_threshold = PerformanceThreshold(
            metric_type=APIMetricType.RESPONSE_TIME,
            threshold_value=3000.0,  # 3 seconds
            comparison="gt",
            window_minutes=5,
            severity=AlertSeverity.WARNING
        )
        
        # Error rate threshold
        error_rate_threshold = PerformanceThreshold(
            metric_type=APIMetricType.ERROR_RATE,
            threshold_value=5.0,  # 5% error rate
            comparison="gt",
            window_minutes=5,
            severity=AlertSeverity.ERROR
        )
        
        # High throughput threshold
        throughput_threshold = PerformanceThreshold(
            metric_type=APIMetricType.THROUGHPUT,
            threshold_value=1000.0,  # 1000 requests per minute
            comparison="gt",
            window_minutes=1,
            severity=AlertSeverity.INFO
        )
        
        # Critical error rate
        critical_error_threshold = PerformanceThreshold(
            metric_type=APIMetricType.ERROR_RATE,
            threshold_value=20.0,  # 20% error rate
            comparison="gt",
            window_minutes=2,
            severity=AlertSeverity.CRITICAL
        )
        
        self.thresholds = [
            response_time_threshold,
            error_rate_threshold,
            throughput_threshold,
            critical_error_threshold
        ]
    
    async def track_request(self, request_data: APIRequest):
        """Track an API request"""
        
        # Store request
        self.requests.append(request_data)
        
        # Update counters
        endpoint_key = self._normalize_endpoint(request_data.endpoint)
        self.request_counts[endpoint_key] += 1
        
        if request_data.status_code >= 400:
            self.error_counts[endpoint_key] += 1
        
        # Track response time
        self.response_times[endpoint_key].append(request_data.response_time_ms)
        
        # Store in Redis for persistence
        await self._store_request_in_redis(request_data)
        
        # Generate metrics
        await self._generate_metrics(request_data)
        
        # Check thresholds
        await self._check_thresholds(request_data)
    
    async def _store_request_in_redis(self, request_data: APIRequest):
        """Store request data in Redis"""
        try:
            # Store in time-series format
            timestamp_key = int(request_data.timestamp.timestamp())
            redis_key = f"api_requests:{timestamp_key // 60}"  # Group by minute
            
            request_dict = asdict(request_data)
            request_dict['timestamp'] = request_data.timestamp.isoformat()
            
            await self.redis.lpush(redis_key, json.dumps(request_dict))
            await self.redis.expire(redis_key, 86400)  # Keep for 24 hours
            
        except Exception as e:
            logger.error(f"Failed to store request in Redis: {e}")
    
    async def _generate_metrics(self, request_data: APIRequest):
        """Generate metrics from request data"""
        
        current_time = datetime.utcnow()
        endpoint = self._normalize_endpoint(request_data.endpoint)
        
        # Response time metric
        response_time_metric = APIMetric(
            timestamp=current_time,
            metric_type=APIMetricType.RESPONSE_TIME,
            value=request_data.response_time_ms,
            endpoint=endpoint,
            user_id=request_data.user_id
        )
        self.metrics[APIMetricType.RESPONSE_TIME].append(response_time_metric)
        
        # Request count metric (aggregated per minute)
        minute_key = f"{endpoint}:{current_time.strftime('%Y-%m-%d %H:%M')}"
        request_count_metric = APIMetric(
            timestamp=current_time,
            metric_type=APIMetricType.REQUEST_COUNT,
            value=1.0,
            endpoint=endpoint,
            metadata={"minute_key": minute_key}
        )
        self.metrics[APIMetricType.REQUEST_COUNT].append(request_count_metric)
        
        # Bandwidth usage
        bandwidth_metric = APIMetric(
            timestamp=current_time,
            metric_type=APIMetricType.BANDWIDTH_USAGE,
            value=request_data.request_size + request_data.response_size,
            endpoint=endpoint
        )
        self.metrics[APIMetricType.BANDWIDTH_USAGE].append(bandwidth_metric)
    
    async def _check_thresholds(self, request_data: APIRequest):
        """Check if any thresholds are violated"""
        
        endpoint = self._normalize_endpoint(request_data.endpoint)
        current_time = datetime.utcnow()
        
        for threshold in self.thresholds:
            if not threshold.enabled:
                continue
            
            # Check if endpoint matches pattern
            if threshold.endpoint_pattern and threshold.endpoint_pattern not in endpoint:
                continue
            
            # Calculate current metric value
            metric_value = await self._calculate_metric_value(threshold, endpoint, current_time)
            
            # Check threshold
            if self._threshold_violated(metric_value, threshold):
                await self._create_alert(threshold, metric_value, endpoint, current_time)
    
    async def _calculate_metric_value(
        self,
        threshold: PerformanceThreshold,
        endpoint: str,
        current_time: datetime
    ) -> float:
        """Calculate current metric value for threshold checking"""
        
        window_start = current_time - timedelta(minutes=threshold.window_minutes)
        
        if threshold.metric_type == APIMetricType.RESPONSE_TIME:
            # Average response time in window
            response_times = [
                rt for rt in self.response_times[endpoint]
                if len(self.response_times[endpoint]) > 0
            ]
            return statistics.mean(response_times) if response_times else 0.0
        
        elif threshold.metric_type == APIMetricType.ERROR_RATE:
            # Error rate in window
            total_requests = self.request_counts[endpoint]
            error_requests = self.error_counts[endpoint]
            return (error_requests / total_requests * 100) if total_requests > 0 else 0.0
        
        elif threshold.metric_type == APIMetricType.THROUGHPUT:
            # Requests per minute
            return self.request_counts[endpoint] / threshold.window_minutes
        
        else:
            return 0.0
    
    def _threshold_violated(self, current_value: float, threshold: PerformanceThreshold) -> bool:
        """Check if threshold is violated"""
        
        if threshold.comparison == "gt":
            return current_value > threshold.threshold_value
        elif threshold.comparison == "lt":
            return current_value < threshold.threshold_value
        elif threshold.comparison == "eq":
            return abs(current_value - threshold.threshold_value) < 0.01
        
        return False
    
    async def _create_alert(
        self,
        threshold: PerformanceThreshold,
        current_value: float,
        endpoint: str,
        timestamp: datetime
    ):
        """Create a monitoring alert"""
        
        # Check if similar alert already exists
        existing_alert = None
        for alert in self.alerts:
            if (alert.metric_type == threshold.metric_type and
                alert.endpoint == endpoint and
                not alert.resolved and
                (timestamp - alert.timestamp).total_seconds() < 300):  # 5 minutes
                existing_alert = alert
                break
        
        if existing_alert:
            # Update existing alert
            existing_alert.current_value = current_value
            existing_alert.timestamp = timestamp
        else:
            # Create new alert
            message = f"{threshold.metric_type.value} threshold violated for {endpoint}: {current_value:.2f} {threshold.comparison} {threshold.threshold_value}"
            
            alert = APIAlert(
                severity=threshold.severity,
                metric_type=threshold.metric_type,
                threshold_value=threshold.threshold_value,
                current_value=current_value,
                endpoint=endpoint,
                message=message,
                timestamp=timestamp
            )
            
            self.alerts.append(alert)
            
            # Log alert
            logger.warning(f"API Alert: {message}")
            
            # Store alert in Redis
            await self._store_alert_in_redis(alert)
    
    async def _store_alert_in_redis(self, alert: APIAlert):
        """Store alert in Redis"""
        try:
            alert_dict = asdict(alert)
            alert_dict['timestamp'] = alert.timestamp.isoformat()
            if alert.resolved_at:
                alert_dict['resolved_at'] = alert.resolved_at.isoformat()
            
            await self.redis.lpush("api_alerts", json.dumps(alert_dict))
            await self.redis.ltrim("api_alerts", 0, 999)  # Keep last 1000 alerts
            
        except Exception as e:
            logger.error(f"Failed to store alert in Redis: {e}")
    
    def _normalize_endpoint(self, endpoint: str) -> str:
        """Normalize endpoint for grouping"""
        # Remove query parameters and normalize path parameters
        endpoint = endpoint.split('?')[0]
        
        # Replace UUIDs and IDs with placeholders
        import re
        endpoint = re.sub(r'/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '/{uuid}', endpoint)
        endpoint = re.sub(r'/\d+', '/{id}', endpoint)
        
        return endpoint
    
    async def get_api_metrics(self, hours: int = 1) -> Dict[str, Any]:
        """Get API metrics and statistics"""
        
        current_time = datetime.utcnow()
        start_time = current_time - timedelta(hours=hours)
        
        # Filter requests in time window
        recent_requests = [
            req for req in self.requests
            if req.timestamp >= start_time
        ]
        
        if not recent_requests:
            return {
                "period_hours": hours,
                "total_requests": 0,
                "error_rate": 0.0,
                "avg_response_time": 0.0,
                "throughput": 0.0,
                "top_endpoints": {},
                "status_code_distribution": {},
                "error_endpoints": {}
            }
        
        # Calculate metrics
        total_requests = len(recent_requests)
        error_requests = len([req for req in recent_requests if req.status_code >= 400])
        error_rate = (error_requests / total_requests * 100) if total_requests > 0 else 0.0
        
        response_times = [req.response_time_ms for req in recent_requests]
        avg_response_time = statistics.mean(response_times) if response_times else 0.0
        
        throughput = total_requests / hours
        
        # Endpoint statistics
        endpoint_counts = defaultdict(int)
        status_code_counts = defaultdict(int)
        error_endpoints = defaultdict(int)
        
        for req in recent_requests:
            endpoint = self._normalize_endpoint(req.endpoint)
            endpoint_counts[endpoint] += 1
            status_code_counts[req.status_code] += 1
            
            if req.status_code >= 400:
                error_endpoints[endpoint] += 1
        
        # Sort and limit results
        top_endpoints = dict(sorted(endpoint_counts.items(), key=lambda x: x[1], reverse=True)[:10])
        top_error_endpoints = dict(sorted(error_endpoints.items(), key=lambda x: x[1], reverse=True)[:5])
        
        return {
            "period_hours": hours,
            "total_requests": total_requests,
            "error_rate": round(error_rate, 2),
            "avg_response_time": round(avg_response_time, 2),
            "throughput": round(throughput, 2),
            "top_endpoints": top_endpoints,
            "status_code_distribution": dict(status_code_counts),
            "error_endpoints": top_error_endpoints,
            "generated_at": current_time.isoformat()
        }
    
    async def get_endpoint_metrics(self, endpoint: str, hours: int = 1) -> Dict[str, Any]:
        """Get metrics for a specific endpoint"""
        
        normalized_endpoint = self._normalize_endpoint(endpoint)
        current_time = datetime.utcnow()
        start_time = current_time - timedelta(hours=hours)
        
        # Filter requests for this endpoint
        endpoint_requests = [
            req for req in self.requests
            if self._normalize_endpoint(req.endpoint) == normalized_endpoint and req.timestamp >= start_time
        ]
        
        if not endpoint_requests:
            return {
                "endpoint": normalized_endpoint,
                "period_hours": hours,
                "request_count": 0,
                "error_rate": 0.0,
                "avg_response_time": 0.0,
                "min_response_time": 0.0,
                "max_response_time": 0.0,
                "p95_response_time": 0.0,
                "status_codes": {}
            }
        
        # Calculate endpoint-specific metrics
        request_count = len(endpoint_requests)
        error_count = len([req for req in endpoint_requests if req.status_code >= 400])
        error_rate = (error_count / request_count * 100) if request_count > 0 else 0.0
        
        response_times = [req.response_time_ms for req in endpoint_requests]
        avg_response_time = statistics.mean(response_times)
        min_response_time = min(response_times)
        max_response_time = max(response_times)
        
        # Calculate 95th percentile
        sorted_times = sorted(response_times)
        p95_index = int(0.95 * len(sorted_times))
        p95_response_time = sorted_times[p95_index] if sorted_times else 0.0
        
        # Status code distribution
        status_codes = defaultdict(int)
        for req in endpoint_requests:
            status_codes[req.status_code] += 1
        
        return {
            "endpoint": normalized_endpoint,
            "period_hours": hours,
            "request_count": request_count,
            "error_rate": round(error_rate, 2),
            "avg_response_time": round(avg_response_time, 2),
            "min_response_time": round(min_response_time, 2),
            "max_response_time": round(max_response_time, 2),
            "p95_response_time": round(p95_response_time, 2),
            "status_codes": dict(status_codes),
            "generated_at": current_time.isoformat()
        }
    
    async def get_active_alerts(self) -> List[Dict[str, Any]]:
        """Get active monitoring alerts"""
        
        active_alerts = [alert for alert in self.alerts if not alert.resolved]
        
        # Sort by severity and timestamp
        severity_order = {
            AlertSeverity.CRITICAL: 0,
            AlertSeverity.ERROR: 1,
            AlertSeverity.WARNING: 2,
            AlertSeverity.INFO: 3
        }
        
        active_alerts.sort(key=lambda a: (severity_order[a.severity], a.timestamp), reverse=True)
        
        # Convert to dict format
        alerts_data = []
        for alert in active_alerts:
            alert_dict = asdict(alert)
            alert_dict['timestamp'] = alert.timestamp.isoformat()
            if alert.resolved_at:
                alert_dict['resolved_at'] = alert.resolved_at.isoformat()
            alerts_data.append(alert_dict)
        
        return alerts_data
    
    async def resolve_alert(self, alert_id: str) -> bool:
        """Resolve an active alert"""
        
        for alert in self.alerts:
            if alert.id == alert_id and not alert.resolved:
                alert.resolved = True
                alert.resolved_at = datetime.utcnow()
                
                # Update in Redis
                await self._store_alert_in_redis(alert)
                
                return True
        
        return False
    
    def add_threshold(self, threshold: PerformanceThreshold):
        """Add a performance threshold"""
        self.thresholds.append(threshold)
    
    def remove_threshold(self, metric_type: APIMetricType, endpoint_pattern: Optional[str] = None):
        """Remove performance thresholds"""
        self.thresholds = [
            t for t in self.thresholds
            if not (t.metric_type == metric_type and 
                   (endpoint_pattern is None or t.endpoint_pattern == endpoint_pattern))
        ]
    
    def get_thresholds(self) -> List[Dict[str, Any]]:
        """Get all performance thresholds"""
        return [asdict(threshold) for threshold in self.thresholds]

# Global API monitor instance
api_monitor = None

def get_api_monitor() -> EnterpriseAPIMonitor:
    """Get API monitor instance"""
    global api_monitor
    if api_monitor is None:
        api_monitor = EnterpriseAPIMonitor()
    return api_monitor
