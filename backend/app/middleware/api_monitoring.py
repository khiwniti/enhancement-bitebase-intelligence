"""
API Monitoring Middleware
Automatic request tracking and rate limiting for all API endpoints
"""

import time
import logging
from typing import Callable, Optional
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.services.monitoring.api_monitoring import get_api_monitor, APIRequest
from app.services.security.rate_limiting import get_rate_limiter

logger = logging.getLogger(__name__)

class APIMonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware for API monitoring and rate limiting"""
    
    def __init__(
        self,
        app: ASGIApp,
        enable_rate_limiting: bool = True,
        enable_monitoring: bool = True,
        exclude_paths: Optional[list] = None
    ):
        super().__init__(app)
        self.enable_rate_limiting = enable_rate_limiting
        self.enable_monitoring = enable_monitoring
        self.exclude_paths = exclude_paths or ["/health", "/metrics", "/docs", "/openapi.json"]
        
        # Get service instances
        self.api_monitor = get_api_monitor()
        self.rate_limiter = get_rate_limiter()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with monitoring and rate limiting"""
        
        start_time = time.time()
        
        # Skip monitoring for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)
        
        # Extract request information
        user_id = await self._extract_user_id(request)
        ip_address = self._get_client_ip(request)
        user_agent = request.headers.get("user-agent", "")
        api_key = request.headers.get("x-api-key")
        user_role = await self._extract_user_role(request)
        
        # Rate limiting check
        if self.enable_rate_limiting:
            try:
                allowed, rate_limit_statuses = await self.rate_limiter.check_rate_limit(
                    endpoint=request.url.path,
                    user_id=user_id,
                    ip_address=ip_address,
                    api_key=api_key,
                    user_role=user_role
                )
                
                if not allowed:
                    # Find the most restrictive rate limit for retry-after header
                    retry_after = None
                    for status_obj in rate_limit_statuses:
                        if status_obj.blocked and status_obj.retry_after_seconds:
                            if retry_after is None or status_obj.retry_after_seconds < retry_after:
                                retry_after = status_obj.retry_after_seconds
                    
                    # Create rate limit response
                    headers = {}
                    if retry_after:
                        headers["Retry-After"] = str(retry_after)
                    
                    # Add rate limit headers
                    for status_obj in rate_limit_statuses:
                        if status_obj.blocked:
                            headers[f"X-RateLimit-Limit-{status_obj.rule_id}"] = str(status_obj.limit)
                            headers[f"X-RateLimit-Remaining-{status_obj.rule_id}"] = str(status_obj.remaining)
                            headers[f"X-RateLimit-Reset-{status_obj.rule_id}"] = status_obj.reset_time.isoformat()
                    
                    return JSONResponse(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        content={
                            "error": "Rate limit exceeded",
                            "message": "Too many requests. Please try again later.",
                            "retry_after_seconds": retry_after
                        },
                        headers=headers
                    )
                
            except Exception as e:
                logger.error(f"Rate limiting check failed: {e}")
                # Continue without rate limiting if service fails
        
        # Get request size
        request_size = 0
        if hasattr(request, "body"):
            try:
                body = await request.body()
                request_size = len(body) if body else 0
            except:
                request_size = 0
        
        # Process request
        response = None
        error_message = None
        
        try:
            response = await call_next(request)
        except Exception as e:
            error_message = str(e)
            logger.error(f"Request processing failed: {e}")
            response = JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "Internal server error"}
            )
        
        # Calculate response time
        end_time = time.time()
        response_time_ms = (end_time - start_time) * 1000
        
        # Get response size
        response_size = 0
        if hasattr(response, "body"):
            try:
                response_size = len(response.body) if response.body else 0
            except:
                response_size = 0
        
        # Track request if monitoring is enabled
        if self.enable_monitoring:
            try:
                api_request = APIRequest(
                    method=request.method,
                    endpoint=request.url.path,
                    user_id=user_id,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    request_size=request_size,
                    response_size=response_size,
                    response_time_ms=response_time_ms,
                    status_code=response.status_code,
                    error_message=error_message,
                    metadata={
                        "query_params": dict(request.query_params),
                        "headers": dict(request.headers),
                        "api_key": api_key is not None
                    }
                )
                
                await self.api_monitor.track_request(api_request)
                
            except Exception as e:
                logger.error(f"API monitoring failed: {e}")
        
        # Add monitoring headers to response
        response.headers["X-Response-Time"] = f"{response_time_ms:.2f}ms"
        response.headers["X-Request-ID"] = request.headers.get("x-request-id", "unknown")
        
        return response
    
    async def _extract_user_id(self, request: Request) -> Optional[str]:
        """Extract user ID from request"""
        try:
            # Try to get user from JWT token or session
            auth_header = request.headers.get("authorization", "")
            if auth_header.startswith("Bearer "):
                # In a real implementation, you would decode the JWT token
                # For now, return a placeholder
                return "user_from_token"
            
            # Try to get from session or other auth mechanism
            return None
            
        except Exception:
            return None
    
    async def _extract_user_role(self, request: Request) -> Optional[str]:
        """Extract user role from request"""
        try:
            # In a real implementation, you would extract role from JWT or database
            # For now, return a placeholder
            return "user"
            
        except Exception:
            return None
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        # Check for forwarded headers first
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            # Take the first IP in the chain
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        # Fallback to direct client IP
        if hasattr(request, "client") and request.client:
            return request.client.host
        
        return "unknown"

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Standalone rate limiting middleware"""
    
    def __init__(self, app: ASGIApp, exclude_paths: Optional[list] = None):
        super().__init__(app)
        self.exclude_paths = exclude_paths or ["/health", "/metrics", "/docs", "/openapi.json"]
        self.rate_limiter = get_rate_limiter()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Apply rate limiting to requests"""
        
        # Skip rate limiting for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)
        
        # Extract request information
        ip_address = self._get_client_ip(request)
        api_key = request.headers.get("x-api-key")
        
        try:
            allowed, rate_limit_statuses = await self.rate_limiter.check_rate_limit(
                endpoint=request.url.path,
                ip_address=ip_address,
                api_key=api_key
            )
            
            if not allowed:
                # Find retry-after time
                retry_after = None
                for status_obj in rate_limit_statuses:
                    if status_obj.blocked and status_obj.retry_after_seconds:
                        if retry_after is None or status_obj.retry_after_seconds < retry_after:
                            retry_after = status_obj.retry_after_seconds
                
                # Create headers
                headers = {}
                if retry_after:
                    headers["Retry-After"] = str(retry_after)
                
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": "Rate limit exceeded",
                        "message": "Too many requests. Please try again later.",
                        "retry_after_seconds": retry_after
                    },
                    headers=headers
                )
            
        except Exception as e:
            logger.error(f"Rate limiting failed: {e}")
            # Continue without rate limiting if service fails
        
        return await call_next(request)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        if hasattr(request, "client") and request.client:
            return request.client.host
        
        return "unknown"

class PerformanceMonitoringMiddleware(BaseHTTPMiddleware):
    """Standalone performance monitoring middleware"""
    
    def __init__(self, app: ASGIApp, exclude_paths: Optional[list] = None):
        super().__init__(app)
        self.exclude_paths = exclude_paths or ["/health", "/metrics", "/docs", "/openapi.json"]
        self.api_monitor = get_api_monitor()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Monitor request performance"""
        
        # Skip monitoring for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)
        
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate response time
        end_time = time.time()
        response_time_ms = (end_time - start_time) * 1000
        
        # Track request
        try:
            api_request = APIRequest(
                method=request.method,
                endpoint=request.url.path,
                ip_address=self._get_client_ip(request),
                user_agent=request.headers.get("user-agent", ""),
                response_time_ms=response_time_ms,
                status_code=response.status_code
            )
            
            await self.api_monitor.track_request(api_request)
            
        except Exception as e:
            logger.error(f"Performance monitoring failed: {e}")
        
        # Add response time header
        response.headers["X-Response-Time"] = f"{response_time_ms:.2f}ms"
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        if hasattr(request, "client") and request.client:
            return request.client.host
        
        return "unknown"
