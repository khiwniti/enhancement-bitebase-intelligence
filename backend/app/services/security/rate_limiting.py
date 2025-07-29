"""
Enterprise API Rate Limiting Service
Advanced rate limiting with multiple strategies and monitoring
"""

import asyncio
import time
import logging
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import redis
import json
import hashlib

logger = logging.getLogger(__name__)

class RateLimitStrategy(str, Enum):
    """Rate limiting strategies"""
    FIXED_WINDOW = "fixed_window"
    SLIDING_WINDOW = "sliding_window"
    TOKEN_BUCKET = "token_bucket"
    LEAKY_BUCKET = "leaky_bucket"

class RateLimitScope(str, Enum):
    """Rate limit scope"""
    GLOBAL = "global"
    USER = "user"
    IP = "ip"
    API_KEY = "api_key"
    ENDPOINT = "endpoint"

@dataclass
class RateLimitRule:
    """Rate limiting rule configuration"""
    id: str
    name: str
    strategy: RateLimitStrategy
    scope: RateLimitScope
    limit: int  # Number of requests
    window_seconds: int  # Time window in seconds
    burst_limit: Optional[int] = None  # For token bucket
    endpoints: List[str] = field(default_factory=list)  # Specific endpoints
    user_roles: List[str] = field(default_factory=list)  # Specific user roles
    priority: int = 100  # Lower number = higher priority
    enabled: bool = True

@dataclass
class RateLimitStatus:
    """Current rate limit status"""
    rule_id: str
    scope_key: str
    current_count: int
    limit: int
    window_seconds: int
    reset_time: datetime
    remaining: int
    blocked: bool
    retry_after_seconds: Optional[int] = None

class EnterpriseRateLimiter:
    """Enterprise-grade rate limiter with Redis backend"""
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis = redis_client or redis.Redis(host='localhost', port=6379, db=0)
        self.rules: Dict[str, RateLimitRule] = {}
        self.monitoring_data: Dict[str, Any] = {}
        
        # Initialize default rules
        self._initialize_default_rules()
    
    def _initialize_default_rules(self):
        """Initialize default rate limiting rules"""
        
        # Global API rate limit
        global_rule = RateLimitRule(
            id="global_api",
            name="Global API Rate Limit",
            strategy=RateLimitStrategy.SLIDING_WINDOW,
            scope=RateLimitScope.GLOBAL,
            limit=10000,
            window_seconds=3600  # 10,000 requests per hour globally
        )
        
        # Per-user rate limit
        user_rule = RateLimitRule(
            id="user_api",
            name="Per-User API Rate Limit",
            strategy=RateLimitStrategy.SLIDING_WINDOW,
            scope=RateLimitScope.USER,
            limit=1000,
            window_seconds=3600  # 1,000 requests per hour per user
        )
        
        # Per-IP rate limit
        ip_rule = RateLimitRule(
            id="ip_api",
            name="Per-IP API Rate Limit",
            strategy=RateLimitStrategy.SLIDING_WINDOW,
            scope=RateLimitScope.IP,
            limit=500,
            window_seconds=3600  # 500 requests per hour per IP
        )
        
        # Authentication endpoints (stricter)
        auth_rule = RateLimitRule(
            id="auth_endpoints",
            name="Authentication Endpoints",
            strategy=RateLimitStrategy.FIXED_WINDOW,
            scope=RateLimitScope.IP,
            limit=10,
            window_seconds=300,  # 10 attempts per 5 minutes per IP
            endpoints=["/auth/login", "/auth/register", "/auth/reset-password"]
        )
        
        # Data export endpoints (very strict)
        export_rule = RateLimitRule(
            id="export_endpoints",
            name="Data Export Endpoints",
            strategy=RateLimitStrategy.TOKEN_BUCKET,
            scope=RateLimitScope.USER,
            limit=5,
            window_seconds=3600,  # 5 exports per hour per user
            burst_limit=2,
            endpoints=["/api/v1/analytics/export", "/api/v1/reports/export"]
        )
        
        # Admin endpoints (restricted)
        admin_rule = RateLimitRule(
            id="admin_endpoints",
            name="Admin Endpoints",
            strategy=RateLimitStrategy.SLIDING_WINDOW,
            scope=RateLimitScope.USER,
            limit=100,
            window_seconds=3600,  # 100 requests per hour for admin users
            user_roles=["admin", "super_admin"]
        )
        
        # Store rules
        for rule in [global_rule, user_rule, ip_rule, auth_rule, export_rule, admin_rule]:
            self.rules[rule.id] = rule
    
    async def check_rate_limit(
        self,
        endpoint: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        api_key: Optional[str] = None,
        user_role: Optional[str] = None
    ) -> Tuple[bool, List[RateLimitStatus]]:
        """
        Check if request is within rate limits
        
        Returns:
            Tuple of (allowed, list of rate limit statuses)
        """
        
        applicable_rules = self._get_applicable_rules(endpoint, user_role)
        statuses = []
        allowed = True
        
        for rule in applicable_rules:
            scope_key = self._get_scope_key(rule, user_id, ip_address, api_key, endpoint)
            status = await self._check_rule(rule, scope_key)
            statuses.append(status)
            
            if status.blocked:
                allowed = False
        
        # Update monitoring data
        await self._update_monitoring(endpoint, user_id, ip_address, allowed, statuses)
        
        return allowed, statuses
    
    def _get_applicable_rules(self, endpoint: str, user_role: Optional[str] = None) -> List[RateLimitRule]:
        """Get rules applicable to the current request"""
        applicable_rules = []
        
        for rule in self.rules.values():
            if not rule.enabled:
                continue
            
            # Check endpoint match
            if rule.endpoints and not any(ep in endpoint for ep in rule.endpoints):
                continue
            
            # Check user role match
            if rule.user_roles and (not user_role or user_role not in rule.user_roles):
                continue
            
            applicable_rules.append(rule)
        
        # Sort by priority (lower number = higher priority)
        applicable_rules.sort(key=lambda r: r.priority)
        
        return applicable_rules
    
    def _get_scope_key(
        self,
        rule: RateLimitRule,
        user_id: Optional[str],
        ip_address: Optional[str],
        api_key: Optional[str],
        endpoint: str
    ) -> str:
        """Generate scope key for rate limiting"""
        
        if rule.scope == RateLimitScope.GLOBAL:
            return f"rate_limit:global:{rule.id}"
        elif rule.scope == RateLimitScope.USER and user_id:
            return f"rate_limit:user:{rule.id}:{user_id}"
        elif rule.scope == RateLimitScope.IP and ip_address:
            return f"rate_limit:ip:{rule.id}:{ip_address}"
        elif rule.scope == RateLimitScope.API_KEY and api_key:
            return f"rate_limit:api_key:{rule.id}:{api_key}"
        elif rule.scope == RateLimitScope.ENDPOINT:
            endpoint_hash = hashlib.md5(endpoint.encode()).hexdigest()[:8]
            return f"rate_limit:endpoint:{rule.id}:{endpoint_hash}"
        else:
            # Fallback to IP if available
            if ip_address:
                return f"rate_limit:fallback:{rule.id}:{ip_address}"
            else:
                return f"rate_limit:fallback:{rule.id}:unknown"
    
    async def _check_rule(self, rule: RateLimitRule, scope_key: str) -> RateLimitStatus:
        """Check a specific rate limiting rule"""
        
        current_time = int(time.time())
        
        if rule.strategy == RateLimitStrategy.FIXED_WINDOW:
            return await self._check_fixed_window(rule, scope_key, current_time)
        elif rule.strategy == RateLimitStrategy.SLIDING_WINDOW:
            return await self._check_sliding_window(rule, scope_key, current_time)
        elif rule.strategy == RateLimitStrategy.TOKEN_BUCKET:
            return await self._check_token_bucket(rule, scope_key, current_time)
        elif rule.strategy == RateLimitStrategy.LEAKY_BUCKET:
            return await self._check_leaky_bucket(rule, scope_key, current_time)
        else:
            # Default to fixed window
            return await self._check_fixed_window(rule, scope_key, current_time)
    
    async def _check_fixed_window(self, rule: RateLimitRule, scope_key: str, current_time: int) -> RateLimitStatus:
        """Check fixed window rate limit"""
        
        window_start = (current_time // rule.window_seconds) * rule.window_seconds
        window_key = f"{scope_key}:{window_start}"
        
        try:
            # Get current count
            current_count = await self._redis_get_int(window_key)
            
            # Check if limit exceeded
            if current_count >= rule.limit:
                reset_time = datetime.fromtimestamp(window_start + rule.window_seconds)
                retry_after = window_start + rule.window_seconds - current_time
                
                return RateLimitStatus(
                    rule_id=rule.id,
                    scope_key=scope_key,
                    current_count=current_count,
                    limit=rule.limit,
                    window_seconds=rule.window_seconds,
                    reset_time=reset_time,
                    remaining=0,
                    blocked=True,
                    retry_after_seconds=retry_after
                )
            
            # Increment counter
            pipe = self.redis.pipeline()
            pipe.incr(window_key)
            pipe.expire(window_key, rule.window_seconds)
            await pipe.execute()
            
            reset_time = datetime.fromtimestamp(window_start + rule.window_seconds)
            
            return RateLimitStatus(
                rule_id=rule.id,
                scope_key=scope_key,
                current_count=current_count + 1,
                limit=rule.limit,
                window_seconds=rule.window_seconds,
                reset_time=reset_time,
                remaining=rule.limit - current_count - 1,
                blocked=False
            )
            
        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            # Fail open - allow request if Redis is down
            return RateLimitStatus(
                rule_id=rule.id,
                scope_key=scope_key,
                current_count=0,
                limit=rule.limit,
                window_seconds=rule.window_seconds,
                reset_time=datetime.fromtimestamp(current_time + rule.window_seconds),
                remaining=rule.limit,
                blocked=False
            )
    
    async def _check_sliding_window(self, rule: RateLimitRule, scope_key: str, current_time: int) -> RateLimitStatus:
        """Check sliding window rate limit"""
        
        window_start = current_time - rule.window_seconds
        
        try:
            # Remove old entries and count current requests
            pipe = self.redis.pipeline()
            pipe.zremrangebyscore(scope_key, 0, window_start)
            pipe.zcard(scope_key)
            results = await pipe.execute()
            
            current_count = results[1]
            
            # Check if limit exceeded
            if current_count >= rule.limit:
                # Get oldest entry to calculate retry time
                oldest_entries = await self.redis.zrange(scope_key, 0, 0, withscores=True)
                if oldest_entries:
                    oldest_time = oldest_entries[0][1]
                    retry_after = int(oldest_time + rule.window_seconds - current_time)
                else:
                    retry_after = rule.window_seconds
                
                reset_time = datetime.fromtimestamp(current_time + retry_after)
                
                return RateLimitStatus(
                    rule_id=rule.id,
                    scope_key=scope_key,
                    current_count=current_count,
                    limit=rule.limit,
                    window_seconds=rule.window_seconds,
                    reset_time=reset_time,
                    remaining=0,
                    blocked=True,
                    retry_after_seconds=retry_after
                )
            
            # Add current request
            pipe = self.redis.pipeline()
            pipe.zadd(scope_key, {str(current_time): current_time})
            pipe.expire(scope_key, rule.window_seconds)
            await pipe.execute()
            
            reset_time = datetime.fromtimestamp(current_time + rule.window_seconds)
            
            return RateLimitStatus(
                rule_id=rule.id,
                scope_key=scope_key,
                current_count=current_count + 1,
                limit=rule.limit,
                window_seconds=rule.window_seconds,
                reset_time=reset_time,
                remaining=rule.limit - current_count - 1,
                blocked=False
            )
            
        except Exception as e:
            logger.error(f"Sliding window rate limit check failed: {e}")
            # Fail open
            return RateLimitStatus(
                rule_id=rule.id,
                scope_key=scope_key,
                current_count=0,
                limit=rule.limit,
                window_seconds=rule.window_seconds,
                reset_time=datetime.fromtimestamp(current_time + rule.window_seconds),
                remaining=rule.limit,
                blocked=False
            )
    
    async def _check_token_bucket(self, rule: RateLimitRule, scope_key: str, current_time: int) -> RateLimitStatus:
        """Check token bucket rate limit"""
        
        bucket_key = f"{scope_key}:bucket"
        
        try:
            # Get current bucket state
            bucket_data = await self.redis.get(bucket_key)
            
            if bucket_data:
                bucket_info = json.loads(bucket_data)
                last_refill = bucket_info['last_refill']
                tokens = bucket_info['tokens']
            else:
                last_refill = current_time
                tokens = rule.limit
            
            # Calculate tokens to add based on time elapsed
            time_elapsed = current_time - last_refill
            tokens_to_add = (time_elapsed / rule.window_seconds) * rule.limit
            tokens = min(rule.limit, tokens + tokens_to_add)
            
            # Check if we have tokens
            if tokens < 1:
                # Calculate retry time
                tokens_needed = 1 - tokens
                retry_after = int((tokens_needed / rule.limit) * rule.window_seconds)
                reset_time = datetime.fromtimestamp(current_time + retry_after)
                
                return RateLimitStatus(
                    rule_id=rule.id,
                    scope_key=scope_key,
                    current_count=rule.limit - int(tokens),
                    limit=rule.limit,
                    window_seconds=rule.window_seconds,
                    reset_time=reset_time,
                    remaining=int(tokens),
                    blocked=True,
                    retry_after_seconds=retry_after
                )
            
            # Consume token
            tokens -= 1
            
            # Update bucket
            bucket_info = {
                'last_refill': current_time,
                'tokens': tokens
            }
            await self.redis.setex(bucket_key, rule.window_seconds * 2, json.dumps(bucket_info))
            
            reset_time = datetime.fromtimestamp(current_time + rule.window_seconds)
            
            return RateLimitStatus(
                rule_id=rule.id,
                scope_key=scope_key,
                current_count=rule.limit - int(tokens) - 1,
                limit=rule.limit,
                window_seconds=rule.window_seconds,
                reset_time=reset_time,
                remaining=int(tokens),
                blocked=False
            )
            
        except Exception as e:
            logger.error(f"Token bucket rate limit check failed: {e}")
            # Fail open
            return RateLimitStatus(
                rule_id=rule.id,
                scope_key=scope_key,
                current_count=0,
                limit=rule.limit,
                window_seconds=rule.window_seconds,
                reset_time=datetime.fromtimestamp(current_time + rule.window_seconds),
                remaining=rule.limit,
                blocked=False
            )
    
    async def _check_leaky_bucket(self, rule: RateLimitRule, scope_key: str, current_time: int) -> RateLimitStatus:
        """Check leaky bucket rate limit"""
        # Simplified implementation - similar to token bucket but with constant leak rate
        return await self._check_token_bucket(rule, scope_key, current_time)
    
    async def _redis_get_int(self, key: str) -> int:
        """Get integer value from Redis"""
        try:
            value = await self.redis.get(key)
            return int(value) if value else 0
        except:
            return 0
    
    async def _update_monitoring(
        self,
        endpoint: str,
        user_id: Optional[str],
        ip_address: Optional[str],
        allowed: bool,
        statuses: List[RateLimitStatus]
    ):
        """Update monitoring data"""
        
        monitoring_key = f"rate_limit_monitoring:{int(time.time() // 60)}"  # Per minute
        
        try:
            monitoring_data = {
                'timestamp': int(time.time()),
                'endpoint': endpoint,
                'user_id': user_id,
                'ip_address': ip_address,
                'allowed': allowed,
                'blocked_rules': [s.rule_id for s in statuses if s.blocked]
            }
            
            await self.redis.lpush(monitoring_key, json.dumps(monitoring_data))
            await self.redis.expire(monitoring_key, 3600)  # Keep for 1 hour
            
        except Exception as e:
            logger.error(f"Failed to update rate limit monitoring: {e}")
    
    async def get_rate_limit_stats(self, hours: int = 1) -> Dict[str, Any]:
        """Get rate limiting statistics"""
        
        current_time = int(time.time())
        start_time = current_time - (hours * 3600)
        
        stats = {
            'total_requests': 0,
            'blocked_requests': 0,
            'block_rate': 0.0,
            'top_blocked_endpoints': {},
            'top_blocked_ips': {},
            'rule_violations': {}
        }
        
        try:
            # Get monitoring data for the time period
            for minute in range(start_time // 60, current_time // 60 + 1):
                monitoring_key = f"rate_limit_monitoring:{minute}"
                entries = await self.redis.lrange(monitoring_key, 0, -1)
                
                for entry in entries:
                    try:
                        data = json.loads(entry)
                        stats['total_requests'] += 1
                        
                        if not data['allowed']:
                            stats['blocked_requests'] += 1
                            
                            # Track blocked endpoints
                            endpoint = data['endpoint']
                            stats['top_blocked_endpoints'][endpoint] = stats['top_blocked_endpoints'].get(endpoint, 0) + 1
                            
                            # Track blocked IPs
                            ip = data.get('ip_address', 'unknown')
                            stats['top_blocked_ips'][ip] = stats['top_blocked_ips'].get(ip, 0) + 1
                            
                            # Track rule violations
                            for rule_id in data.get('blocked_rules', []):
                                stats['rule_violations'][rule_id] = stats['rule_violations'].get(rule_id, 0) + 1
                    
                    except json.JSONDecodeError:
                        continue
            
            # Calculate block rate
            if stats['total_requests'] > 0:
                stats['block_rate'] = (stats['blocked_requests'] / stats['total_requests']) * 100
            
            # Sort top lists
            stats['top_blocked_endpoints'] = dict(sorted(
                stats['top_blocked_endpoints'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10])
            
            stats['top_blocked_ips'] = dict(sorted(
                stats['top_blocked_ips'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10])
            
        except Exception as e:
            logger.error(f"Failed to get rate limit stats: {e}")
        
        return stats
    
    def add_rule(self, rule: RateLimitRule):
        """Add a new rate limiting rule"""
        self.rules[rule.id] = rule
    
    def remove_rule(self, rule_id: str):
        """Remove a rate limiting rule"""
        if rule_id in self.rules:
            del self.rules[rule_id]
    
    def get_rules(self) -> List[RateLimitRule]:
        """Get all rate limiting rules"""
        return list(self.rules.values())

# Global rate limiter instance
rate_limiter = None

def get_rate_limiter() -> EnterpriseRateLimiter:
    """Get rate limiter instance"""
    global rate_limiter
    if rate_limiter is None:
        rate_limiter = EnterpriseRateLimiter()
    return rate_limiter
