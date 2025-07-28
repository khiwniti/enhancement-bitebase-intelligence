"""
Security utilities and middleware for BiteBase Intelligence API
Implements security controls identified in the security analysis
"""

import re
import hashlib
import secrets
import time
from typing import Optional, List, Dict, Any, Set
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from functools import wraps

from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.logging import get_logger, log_security_event
from app.core.config import get_settings

logger = get_logger('bitebase.security')
settings = get_settings()

class SecurityHeaders:
    """Security headers for HTTP responses"""
    
    @staticmethod
    def get_headers() -> Dict[str, str]:
        """Get security headers for all responses"""
        return {
            # Prevent XSS attacks
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            
            # Content Security Policy
            'Content-Security-Policy': (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "connect-src 'self' https:; "
                "font-src 'self' https: data:; "
                "object-src 'none'; "
                "media-src 'self'; "
                "frame-src 'none'"
            ),
            
            # HTTPS enforcement
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            
            # Referrer policy
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            
            # Permissions policy
            'Permissions-Policy': (
                'geolocation=(self), '
                'microphone=(), '
                'camera=(), '
                'fullscreen=(self)'
            )
        }

class RateLimiter:
    """Advanced rate limiting with per-user and per-endpoint controls"""
    
    def __init__(self):
        self.requests: Dict[str, List[float]] = defaultdict(list)
        self.blocked_ips: Dict[str, float] = {}
        self.suspicious_patterns: Set[str] = set()
    
    def _get_client_id(self, request: Request) -> str:
        """Get unique client identifier"""
        # Priority: user_id > ip_address > user_agent_hash
        user_id = getattr(request.state, 'user_id', None)
        if user_id:
            return f"user:{user_id}"
        
        ip = request.client.host if request.client else 'unknown'
        return f"ip:{ip}"
    
    def _parse_rate_limit(self, limit_str: str) -> tuple[int, int]:
        """Parse rate limit string like '100/hour' to (requests, seconds)"""
        parts = limit_str.split('/')
        if len(parts) != 2:
            return 1000, 3600  # Default: 1000/hour
        
        count = int(parts[0])
        
        time_unit = parts[1].lower()
        if time_unit == 'second':
            seconds = 1
        elif time_unit == 'minute':
            seconds = 60
        elif time_unit == 'hour':
            seconds = 3600
        elif time_unit == 'day':
            seconds = 86400
        else:
            seconds = 3600  # Default to hour
        
        return count, seconds
    
    def is_allowed(self, request: Request, limit_str: str = None) -> tuple[bool, Dict[str, Any]]:
        """Check if request is allowed under rate limits"""
        client_id = self._get_client_id(request)
        current_time = time.time()
        
        # Check if IP is temporarily blocked
        if client_id.startswith('ip:'):
            ip = client_id[3:]
            if ip in self.blocked_ips and current_time < self.blocked_ips[ip]:
                return False, {
                    'error': 'IP temporarily blocked',
                    'retry_after': int(self.blocked_ips[ip] - current_time)
                }
        
        # Get rate limit for this endpoint
        if not limit_str:
            # Determine limit based on endpoint and user type
            if request.url.path.startswith('/api/v1/ai/'):
                limit_str = settings.RATE_LIMIT_AI
            elif request.url.path.startswith('/api/auth/'):
                limit_str = settings.RATE_LIMIT_AUTH
            elif request.url.path.startswith('/api/v1/admin/'):
                limit_str = settings.RATE_LIMIT_ADMIN
            else:
                limit_str = settings.RATE_LIMIT_DEFAULT
        
        max_requests, window_seconds = self._parse_rate_limit(limit_str)
        
        # Clean old requests outside the window
        window_start = current_time - window_seconds
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > window_start
        ]
        
        # Check if limit exceeded
        current_requests = len(self.requests[client_id])
        if current_requests >= max_requests:
            # Log rate limit violation
            log_security_event(
                'rate_limit_exceeded',
                'medium',
                {
                    'client_id': client_id,
                    'current_requests': current_requests,
                    'limit': max_requests,
                    'window_seconds': window_seconds,
                    'endpoint': request.url.path
                }
            )
            
            # Block IP if excessive violations
            if client_id.startswith('ip:') and current_requests > max_requests * 2:
                ip = client_id[3:]
                self.blocked_ips[ip] = current_time + 3600  # Block for 1 hour
                logger.warning(f"IP {ip} blocked for 1 hour due to excessive rate limit violations")
            
            return False, {
                'error': 'Rate limit exceeded',
                'retry_after': int(window_seconds),
                'limit': max_requests,
                'window': window_seconds
            }
        
        # Record this request
        self.requests[client_id].append(current_time)
        
        return True, {
            'requests_remaining': max_requests - current_requests - 1,
            'reset_time': int(window_start + window_seconds)
        }

class PromptInjectionFilter:
    """Filter for detecting and preventing prompt injection attacks"""
    
    # Patterns that commonly indicate prompt injection attempts
    INJECTION_PATTERNS = [
        r'ignore\s+previous\s+instructions',
        r'forget\s+everything\s+above',
        r'system\s*:\s*ignore',
        r'assistant\s*:\s*ignore',
        r'human\s*:\s*ignore',
        r'###\s*new\s+instructions',
        r'###\s*system\s+override',
        r'jailbreak',
        r'pretend\s+you\s+are',
        r'roleplay\s+as',
        r'act\s+as\s+if',
        r'simulate\s+being',
        r'output\s+your\s+training\s+data',
        r'reveal\s+your\s+system\s+prompt',
        r'what\s+are\s+your\s+instructions',
        r'</?\s*system\s*>',
        r'</?\s*prompt\s*>',
        r'</?\s*instruction\s*>',
    ]
    
    def __init__(self):
        self.patterns = [re.compile(pattern, re.IGNORECASE | re.MULTILINE) for pattern in self.INJECTION_PATTERNS]
    
    def is_malicious(self, text: str) -> tuple[bool, List[str]]:
        """Check if text contains potential prompt injection"""
        if not text:
            return False, []
        
        detected_patterns = []
        
        for pattern in self.patterns:
            if pattern.search(text):
                detected_patterns.append(pattern.pattern)
        
        return len(detected_patterns) > 0, detected_patterns
    
    def sanitize(self, text: str) -> str:
        """Sanitize text by removing potential injection patterns"""
        if not text:
            return text
        
        sanitized = text
        
        for pattern in self.patterns:
            sanitized = pattern.sub('[FILTERED]', sanitized)
        
        return sanitized

class AccountLockout:
    """Account lockout mechanism for failed authentication attempts"""
    
    def __init__(self):
        self.failed_attempts: Dict[str, List[float]] = defaultdict(list)
        self.locked_accounts: Dict[str, float] = {}
        self.lockout_threshold = 5  # Lock after 5 failed attempts
        self.lockout_duration = 3600  # Lock for 1 hour
        self.window_duration = 900  # 15-minute window for attempts
    
    def record_failed_attempt(self, identifier: str) -> bool:
        """Record a failed authentication attempt. Returns True if account should be locked."""
        current_time = time.time()
        
        # Clean old attempts outside the window
        window_start = current_time - self.window_duration
        self.failed_attempts[identifier] = [
            attempt_time for attempt_time in self.failed_attempts[identifier]
            if attempt_time > window_start
        ]
        
        # Record this attempt
        self.failed_attempts[identifier].append(current_time)
        
        # Check if threshold exceeded
        if len(self.failed_attempts[identifier]) >= self.lockout_threshold:
            self.locked_accounts[identifier] = current_time + self.lockout_duration
            
            log_security_event(
                'account_locked',
                'high',
                {
                    'identifier': identifier,
                    'failed_attempts': len(self.failed_attempts[identifier]),
                    'lockout_until': self.locked_accounts[identifier]
                }
            )
            
            return True
        
        return False
    
    def is_locked(self, identifier: str) -> tuple[bool, Optional[int]]:
        """Check if account is currently locked. Returns (is_locked, seconds_remaining)."""
        if identifier not in self.locked_accounts:
            return False, None
        
        current_time = time.time()
        unlock_time = self.locked_accounts[identifier]
        
        if current_time >= unlock_time:
            # Lockout has expired
            del self.locked_accounts[identifier]
            # Clear failed attempts
            if identifier in self.failed_attempts:
                del self.failed_attempts[identifier]
            return False, None
        
        return True, int(unlock_time - current_time)
    
    def clear_failed_attempts(self, identifier: str):
        """Clear failed attempts for successful authentication"""
        if identifier in self.failed_attempts:
            del self.failed_attempts[identifier]

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for request processing"""
    
    def __init__(self, app):
        super().__init__(app)
        self.rate_limiter = RateLimiter()
        self.prompt_filter = PromptInjectionFilter()
        self.account_lockout = AccountLockout()
    
    async def dispatch(self, request: Request, call_next):
        """Process request with security checks"""
        
        # Skip security checks for health endpoints
        if request.url.path in ['/health', '/metrics']:
            return await call_next(request)
        
        # Rate limiting check
        if settings.RATE_LIMIT_ENABLED:
            allowed, rate_info = self.rate_limiter.is_allowed(request)
            if not allowed:
                return Response(
                    content=f"Rate limit exceeded: {rate_info.get('error', 'Too many requests')}",
                    status_code=429,
                    headers={
                        'Retry-After': str(rate_info.get('retry_after', 60)),
                        **SecurityHeaders.get_headers()
                    }
                )
        
        # Process request
        response = await call_next(request)
        
        # Add security headers to all responses
        for header, value in SecurityHeaders.get_headers().items():
            response.headers[header] = value
        
        # Add rate limit headers
        if settings.RATE_LIMIT_ENABLED and rate_info.get('requests_remaining') is not None:
            response.headers['X-RateLimit-Remaining'] = str(rate_info['requests_remaining'])
            response.headers['X-RateLimit-Reset'] = str(rate_info['reset_time'])
        
        return response

def validate_password_strength(password: str) -> tuple[bool, List[str]]:
    """Validate password meets security requirements"""
    errors = []
    
    if len(password) < settings.PASSWORD_MIN_LENGTH:
        errors.append(f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long")
    
    if settings.PASSWORD_REQUIRE_SPECIAL_CHARS:
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character")
        
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not re.search(r'[0-9]', password):
            errors.append("Password must contain at least one number")
    
    # Check for common weak passwords
    weak_patterns = [
        r'password',
        r'123456',
        r'qwerty',
        r'admin',
        r'letmein'
    ]
    
    for pattern in weak_patterns:
        if re.search(pattern, password, re.IGNORECASE):
            errors.append("Password is too common or predictable")
            break
    
    return len(errors) == 0, errors

def generate_secure_token(length: int = 32) -> str:
    """Generate a cryptographically secure random token"""
    return secrets.token_urlsafe(length)

def hash_sensitive_data(data: str) -> str:
    """Hash sensitive data for logging (non-reversible)"""
    return hashlib.sha256(data.encode()).hexdigest()[:16]

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify webhook signature (e.g., from Stripe)"""
    if not signature or not secret:
        return False
    
    try:
        # Extract timestamp and signature from header
        elements = signature.split(',')
        timestamp = None
        signatures = []
        
        for element in elements:
            key, value = element.split('=')
            if key == 't':
                timestamp = value
            elif key.startswith('v'):
                signatures.append(value)
        
        if not timestamp or not signatures:
            return False
        
        # Create expected signature
        payload_to_sign = f"{timestamp}.{payload.decode()}"
        expected_signature = hashlib.sha256(
            payload_to_sign.encode() + secret.encode()
        ).hexdigest()
        
        # Compare signatures
        return any(
            secrets.compare_digest(expected_signature, sig)
            for sig in signatures
        )
        
    except Exception:
        return False

# Global instances for use in endpoints
rate_limiter = RateLimiter()
prompt_filter = PromptInjectionFilter()
account_lockout = AccountLockout()

def require_secure_context(func):
    """Decorator to require secure context for sensitive operations"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # In production, could check for HTTPS, valid certificates, etc.
        if settings.is_production:
            # Add additional security checks for production
            pass
        
        return await func(*args, **kwargs)
    
    return wrapper