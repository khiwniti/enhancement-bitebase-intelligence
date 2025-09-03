"""
Monitoring and observability utilities for BiteBase Intelligence API
Provides health checks, metrics collection, and performance monitoring
"""

import time
import psutil
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from collections import defaultdict
from contextlib import asynccontextmanager

from fastapi import Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import engine
from app.core.logging import get_logger, log_performance

logger = get_logger('bitebase.monitoring')

@dataclass
class HealthCheckResult:
    """Health check result data structure"""
    name: str
    status: str  # healthy, degraded, unhealthy
    response_time_ms: float
    details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@dataclass
class SystemMetrics:
    """System performance metrics"""
    timestamp: str
    cpu_usage_percent: float
    memory_usage_percent: float
    disk_usage_percent: float
    active_connections: int
    request_count: int
    error_count: int
    avg_response_time_ms: float

class MetricsCollector:
    """Collects and stores application metrics"""
    
    def __init__(self):
        self.request_count = 0
        self.error_count = 0
        self.response_times: List[float] = []
        self.start_time = time.time()
        self.active_connections = 0
        
    def record_request(self, response_time_ms: float, is_error: bool = False):
        """Record a request with its response time and error status"""
        self.request_count += 1
        if is_error:
            self.error_count += 1
        
        self.response_times.append(response_time_ms)
        
        # Keep only last 1000 response times for memory efficiency
        if len(self.response_times) > 1000:
            self.response_times = self.response_times[-1000:]
    
    def get_avg_response_time(self) -> float:
        """Calculate average response time"""
        if not self.response_times:
            return 0.0
        return sum(self.response_times) / len(self.response_times)
    
    def get_error_rate(self) -> float:
        """Calculate error rate as percentage"""
        if self.request_count == 0:
            return 0.0
        return (self.error_count / self.request_count) * 100
    
    def get_uptime_seconds(self) -> float:
        """Get application uptime in seconds"""
        return time.time() - self.start_time

# Global metrics collector instance
metrics_collector = MetricsCollector()

class PerformanceMonitoringMiddleware:
    """Middleware for monitoring request performance"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        start_time = time.time()
        metrics_collector.active_connections += 1
        
        try:
            await self.app(scope, receive, send)
            
        except Exception as e:
            # Record error
            duration_ms = (time.time() - start_time) * 1000
            metrics_collector.record_request(duration_ms, is_error=True)
            logger.error(f"Request failed: {str(e)}", exc_info=True)
            raise
            
        finally:
            # Record request completion
            duration_ms = (time.time() - start_time) * 1000
            metrics_collector.record_request(duration_ms)
            metrics_collector.active_connections -= 1

async def check_database_health() -> HealthCheckResult:
    """Check database connectivity and performance"""
    start_time = time.time()
    
    try:
        async with engine.begin() as conn:
            # Simple query to test connectivity
            result = await conn.execute(text("SELECT 1"))
            await result.fetchone()
        
        response_time_ms = (time.time() - start_time) * 1000
        
        return HealthCheckResult(
            name="database",
            status="healthy",
            response_time_ms=response_time_ms,
            details={
                "engine": str(engine.url.drivername),
                "pool_size": engine.pool.size(),
                "checked_in": engine.pool.checkedin(),
                "checked_out": engine.pool.checkedout()
            }
        )
        
    except Exception as e:
        response_time_ms = (time.time() - start_time) * 1000
        logger.error(f"Database health check failed: {str(e)}")
        
        return HealthCheckResult(
            name="database",
            status="unhealthy",
            response_time_ms=response_time_ms,
            error=str(e)
        )

async def check_external_services_health() -> List[HealthCheckResult]:
    """Check health of external services"""
    results = []
    
    # Mock external service checks (replace with actual service checks)
    external_services = [
        {"name": "stripe_api", "url": "https://api.stripe.com/v1/account"},
        {"name": "anthropic_api", "url": "https://api.anthropic.com/v1/messages"},
        {"name": "google_places", "url": "https://maps.googleapis.com/maps/api/place/"},
    ]
    
    for service in external_services:
        start_time = time.time()
        
        try:
            # In production, make actual HTTP requests to service health endpoints
            # For now, simulate a healthy response
            await asyncio.sleep(0.1)  # Simulate network delay
            
            response_time_ms = (time.time() - start_time) * 1000
            
            results.append(HealthCheckResult(
                name=service["name"],
                status="healthy",
                response_time_ms=response_time_ms,
                details={"url": service["url"]}
            ))
            
        except Exception as e:
            response_time_ms = (time.time() - start_time) * 1000
            
            results.append(HealthCheckResult(
                name=service["name"],
                status="unhealthy",
                response_time_ms=response_time_ms,
                error=str(e)
            ))
    
    return results

def get_system_metrics() -> SystemMetrics:
    """Get current system performance metrics"""
    
    # CPU usage
    cpu_percent = psutil.cpu_percent(interval=1)
    
    # Memory usage
    memory = psutil.virtual_memory()
    memory_percent = memory.percent
    
    # Disk usage
    disk = psutil.disk_usage('/')
    disk_percent = (disk.used / disk.total) * 100
    
    return SystemMetrics(
        timestamp=datetime.now(timezone.utc).isoformat(),
        cpu_usage_percent=cpu_percent,
        memory_usage_percent=memory_percent,
        disk_usage_percent=disk_percent,
        active_connections=metrics_collector.active_connections,
        request_count=metrics_collector.request_count,
        error_count=metrics_collector.error_count,
        avg_response_time_ms=metrics_collector.get_avg_response_time()
    )

async def get_comprehensive_health_check() -> Dict[str, Any]:
    """Get comprehensive health check including all components"""
    
    start_time = time.time()
    
    # Run health checks in parallel
    db_health_task = asyncio.create_task(check_database_health())
    external_services_task = asyncio.create_task(check_external_services_health())
    
    db_health = await db_health_task
    external_services = await external_services_task
    
    # Get system metrics
    system_metrics = get_system_metrics()
    
    # Determine overall health status
    all_checks = [db_health] + external_services
    unhealthy_checks = [check for check in all_checks if check.status == "unhealthy"]
    degraded_checks = [check for check in all_checks if check.status == "degraded"]
    
    if unhealthy_checks:
        overall_status = "unhealthy"
    elif degraded_checks:
        overall_status = "degraded"
    else:
        overall_status = "healthy"
    
    total_time_ms = (time.time() - start_time) * 1000
    
    return {
        "status": overall_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_check_time_ms": round(total_time_ms, 2),
        "components": {
            "database": asdict(db_health),
            "external_services": [asdict(service) for service in external_services],
        },
        "system_metrics": asdict(system_metrics),
        "application_metrics": {
            "uptime_seconds": metrics_collector.get_uptime_seconds(),
            "total_requests": metrics_collector.request_count,
            "total_errors": metrics_collector.error_count,
            "error_rate_percent": metrics_collector.get_error_rate(),
            "avg_response_time_ms": metrics_collector.get_avg_response_time()
        }
    }

@asynccontextmanager
async def performance_timer(operation_name: str, **context):
    """Context manager for timing operations and logging performance"""
    start_time = time.time()
    
    try:
        yield
    finally:
        duration_ms = (time.time() - start_time) * 1000
        log_performance(operation_name, duration_ms, **context)

class AlertThresholds:
    """Alert threshold configurations"""
    
    CPU_WARNING = 70.0
    CPU_CRITICAL = 90.0
    MEMORY_WARNING = 80.0
    MEMORY_CRITICAL = 95.0
    DISK_WARNING = 85.0
    DISK_CRITICAL = 95.0
    RESPONSE_TIME_WARNING = 1000.0  # ms
    RESPONSE_TIME_CRITICAL = 5000.0  # ms
    ERROR_RATE_WARNING = 5.0  # percent
    ERROR_RATE_CRITICAL = 10.0  # percent

def check_alert_conditions() -> List[Dict[str, Any]]:
    """Check for alert conditions based on current metrics"""
    alerts = []
    metrics = get_system_metrics()
    error_rate = metrics_collector.get_error_rate()
    
    # CPU alerts
    if metrics.cpu_usage_percent > AlertThresholds.CPU_CRITICAL:
        alerts.append({
            "type": "cpu_usage",
            "severity": "critical",
            "message": f"CPU usage is {metrics.cpu_usage_percent:.1f}%",
            "threshold": AlertThresholds.CPU_CRITICAL
        })
    elif metrics.cpu_usage_percent > AlertThresholds.CPU_WARNING:
        alerts.append({
            "type": "cpu_usage",
            "severity": "warning",
            "message": f"CPU usage is {metrics.cpu_usage_percent:.1f}%",
            "threshold": AlertThresholds.CPU_WARNING
        })
    
    # Memory alerts
    if metrics.memory_usage_percent > AlertThresholds.MEMORY_CRITICAL:
        alerts.append({
            "type": "memory_usage",
            "severity": "critical",
            "message": f"Memory usage is {metrics.memory_usage_percent:.1f}%",
            "threshold": AlertThresholds.MEMORY_CRITICAL
        })
    elif metrics.memory_usage_percent > AlertThresholds.MEMORY_WARNING:
        alerts.append({
            "type": "memory_usage",
            "severity": "warning",
            "message": f"Memory usage is {metrics.memory_usage_percent:.1f}%",
            "threshold": AlertThresholds.MEMORY_WARNING
        })
    
    # Response time alerts
    if metrics.avg_response_time_ms > AlertThresholds.RESPONSE_TIME_CRITICAL:
        alerts.append({
            "type": "response_time",
            "severity": "critical",
            "message": f"Average response time is {metrics.avg_response_time_ms:.1f}ms",
            "threshold": AlertThresholds.RESPONSE_TIME_CRITICAL
        })
    elif metrics.avg_response_time_ms > AlertThresholds.RESPONSE_TIME_WARNING:
        alerts.append({
            "type": "response_time",
            "severity": "warning",
            "message": f"Average response time is {metrics.avg_response_time_ms:.1f}ms",
            "threshold": AlertThresholds.RESPONSE_TIME_WARNING
        })
    
    # Error rate alerts
    if error_rate > AlertThresholds.ERROR_RATE_CRITICAL:
        alerts.append({
            "type": "error_rate",
            "severity": "critical",
            "message": f"Error rate is {error_rate:.1f}%",
            "threshold": AlertThresholds.ERROR_RATE_CRITICAL
        })
    elif error_rate > AlertThresholds.ERROR_RATE_WARNING:
        alerts.append({
            "type": "error_rate",
            "severity": "warning",
            "message": f"Error rate is {error_rate:.1f}%",
            "threshold": AlertThresholds.ERROR_RATE_WARNING
        })
    
    return alerts