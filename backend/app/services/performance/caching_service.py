"""
Advanced Caching Service for Performance Optimization
Implements Redis-based caching with intelligent cache strategies
"""

import json
import hashlib
from typing import Any, Optional, Dict, List, Union
from datetime import datetime, timedelta
import asyncio
from abc import ABC, abstractmethod

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

class CacheStrategy(ABC):
    """Abstract base class for cache strategies"""
    
    @abstractmethod
    def get_ttl(self, key: str, data: Any) -> int:
        """Get TTL for a cache key"""
        pass
    
    @abstractmethod
    def should_cache(self, key: str, data: Any) -> bool:
        """Determine if data should be cached"""
        pass

class DashboardCacheStrategy(CacheStrategy):
    """Cache strategy optimized for dashboard queries"""
    
    def get_ttl(self, key: str, data: Any) -> int:
        """Dashboard cache TTL based on data type"""
        if 'real_time' in key:
            return 30  # 30 seconds for real-time data
        elif 'aggregated' in key:
            return 300  # 5 minutes for aggregated data
        elif 'static' in key:
            return 3600  # 1 hour for static data
        else:
            return 180  # 3 minutes default
    
    def should_cache(self, key: str, data: Any) -> bool:
        """Cache all dashboard data except errors"""
        return data is not None and not isinstance(data, Exception)

class QueryResultCacheStrategy(CacheStrategy):
    """Cache strategy for database query results"""
    
    def get_ttl(self, key: str, data: Any) -> int:
        """Query result TTL based on complexity"""
        if isinstance(data, list) and len(data) > 1000:
            return 600  # 10 minutes for large result sets
        elif 'analytics' in key:
            return 300  # 5 minutes for analytics
        else:
            return 180  # 3 minutes default
    
    def should_cache(self, key: str, data: Any) -> bool:
        """Cache non-empty results"""
        if isinstance(data, list):
            return len(data) > 0
        return data is not None

class InMemoryCache:
    """Fallback in-memory cache when Redis is not available"""
    
    def __init__(self, max_size: int = 1000):
        self.cache: Dict[str, tuple[Any, datetime]] = {}
        self.access_order: List[str] = []
        self.max_size = max_size
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key in self.cache:
            value, expiry = self.cache[key]
            if datetime.now() < expiry:
                # Move to end (most recently accessed)
                self.access_order.remove(key)
                self.access_order.append(key)
                return value
            else:
                # Expired
                del self.cache[key]
                self.access_order.remove(key)
        return None
    
    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set value in cache"""
        expiry = datetime.now() + timedelta(seconds=ttl)
        
        # Remove if already exists
        if key in self.cache:
            self.access_order.remove(key)
        
        # Add new entry
        self.cache[key] = (value, expiry)
        self.access_order.append(key)
        
        # Evict oldest if over limit
        while len(self.cache) > self.max_size:
            oldest_key = self.access_order.pop(0)
            del self.cache[oldest_key]
        
        return True
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if key in self.cache:
            del self.cache[key]
            self.access_order.remove(key)
            return True
        return False
    
    async def clear(self) -> bool:
        """Clear all cache"""
        self.cache.clear()
        self.access_order.clear()
        return True

class CachingService:
    """Advanced caching service with multiple strategies"""
    
    def __init__(self, redis_url: str = None):
        self.redis_client: Optional[redis.Redis] = None
        self.fallback_cache = InMemoryCache()
        self.strategies: Dict[str, CacheStrategy] = {
            'dashboard': DashboardCacheStrategy(),
            'query': QueryResultCacheStrategy(),
            'default': QueryResultCacheStrategy()
        }
        self.hit_count = 0
        self.miss_count = 0
        self.error_count = 0
        
        if REDIS_AVAILABLE and redis_url:
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
            except Exception as e:
                print(f"Failed to connect to Redis: {e}")
                self.redis_client = None
    
    def _get_cache_key(self, namespace: str, key: str, **kwargs) -> str:
        """Generate cache key with namespace and parameters"""
        # Include kwargs in key for parameter-based caching
        if kwargs:
            param_str = json.dumps(sorted(kwargs.items()), default=str)
            key_hash = hashlib.md5(param_str.encode()).hexdigest()[:8]
            return f"{namespace}:{key}:{key_hash}"
        return f"{namespace}:{key}"
    
    def _get_strategy(self, namespace: str) -> CacheStrategy:
        """Get cache strategy for namespace"""
        return self.strategies.get(namespace, self.strategies['default'])
    
    async def get(self, namespace: str, key: str, **kwargs) -> Optional[Any]:
        """Get value from cache"""
        cache_key = self._get_cache_key(namespace, key, **kwargs)
        
        try:
            # Try Redis first
            if self.redis_client:
                try:
                    cached_data = await self.redis_client.get(cache_key)
                    if cached_data:
                        self.hit_count += 1
                        return json.loads(cached_data)
                except Exception as e:
                    print(f"Redis get error: {e}")
                    self.error_count += 1
            
            # Fallback to in-memory cache
            cached_data = await self.fallback_cache.get(cache_key)
            if cached_data:
                self.hit_count += 1
                return cached_data
            
            self.miss_count += 1
            return None
            
        except Exception as e:
            print(f"Cache get error: {e}")
            self.error_count += 1
            return None
    
    async def set(self, namespace: str, key: str, value: Any, ttl: Optional[int] = None, **kwargs) -> bool:
        """Set value in cache"""
        cache_key = self._get_cache_key(namespace, key, **kwargs)
        strategy = self._get_strategy(namespace)
        
        # Check if should cache
        if not strategy.should_cache(cache_key, value):
            return False
        
        # Get TTL from strategy if not provided
        if ttl is None:
            ttl = strategy.get_ttl(cache_key, value)
        
        try:
            # Try Redis first
            if self.redis_client:
                try:
                    serialized_value = json.dumps(value, default=str)
                    await self.redis_client.setex(cache_key, ttl, serialized_value)
                    return True
                except Exception as e:
                    print(f"Redis set error: {e}")
                    self.error_count += 1
            
            # Fallback to in-memory cache
            return await self.fallback_cache.set(cache_key, value, ttl)
            
        except Exception as e:
            print(f"Cache set error: {e}")
            self.error_count += 1
            return False
    
    async def delete(self, namespace: str, key: str, **kwargs) -> bool:
        """Delete key from cache"""
        cache_key = self._get_cache_key(namespace, key, **kwargs)
        
        try:
            deleted = False
            
            # Delete from Redis
            if self.redis_client:
                try:
                    result = await self.redis_client.delete(cache_key)
                    deleted = result > 0
                except Exception as e:
                    print(f"Redis delete error: {e}")
                    self.error_count += 1
            
            # Delete from fallback cache
            fallback_deleted = await self.fallback_cache.delete(cache_key)
            
            return deleted or fallback_deleted
            
        except Exception as e:
            print(f"Cache delete error: {e}")
            self.error_count += 1
            return False
    
    async def invalidate_pattern(self, namespace: str, pattern: str) -> int:
        """Invalidate all keys matching pattern"""
        try:
            deleted_count = 0
            
            if self.redis_client:
                try:
                    search_pattern = f"{namespace}:{pattern}*"
                    keys = await self.redis_client.keys(search_pattern)
                    if keys:
                        deleted_count = await self.redis_client.delete(*keys)
                except Exception as e:
                    print(f"Redis pattern invalidation error: {e}")
                    self.error_count += 1
            
            # For in-memory cache, we'd need to iterate (less efficient)
            # This is a limitation of the fallback cache
            
            return deleted_count
            
        except Exception as e:
            print(f"Pattern invalidation error: {e}")
            self.error_count += 1
            return 0
    
    async def clear_namespace(self, namespace: str) -> int:
        """Clear all keys in namespace"""
        return await self.invalidate_pattern(namespace, "")
    
    async def get_or_set(self, namespace: str, key: str, factory_func, ttl: Optional[int] = None, **kwargs) -> Any:
        """Get value from cache or set it using factory function"""
        # Try to get from cache first
        cached_value = await self.get(namespace, key, **kwargs)
        if cached_value is not None:
            return cached_value
        
        # Generate value and cache it
        try:
            if asyncio.iscoroutinefunction(factory_func):
                value = await factory_func()
            else:
                value = factory_func()
            
            await self.set(namespace, key, value, ttl, **kwargs)
            return value
            
        except Exception as e:
            print(f"Factory function error: {e}")
            self.error_count += 1
            raise
    
    async def cache_dashboard_query(self, dashboard_id: str, query_hash: str, result: Any, is_real_time: bool = False) -> bool:
        """Cache dashboard query result with appropriate strategy"""
        namespace = "dashboard"
        key = f"{dashboard_id}:{'real_time' if is_real_time else 'static'}:{query_hash}"
        return await self.set(namespace, key, result)
    
    async def get_dashboard_query(self, dashboard_id: str, query_hash: str, is_real_time: bool = False) -> Optional[Any]:
        """Get cached dashboard query result"""
        namespace = "dashboard"
        key = f"{dashboard_id}:{'real_time' if is_real_time else 'static'}:{query_hash}"
        return await self.get(namespace, key)
    
    async def invalidate_dashboard(self, dashboard_id: str) -> int:
        """Invalidate all cache entries for a dashboard"""
        return await self.invalidate_pattern("dashboard", dashboard_id)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.hit_count + self.miss_count
        hit_rate = (self.hit_count / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'hit_count': self.hit_count,
            'miss_count': self.miss_count,
            'error_count': self.error_count,
            'hit_rate_percent': round(hit_rate, 2),
            'total_requests': total_requests,
            'using_redis': self.redis_client is not None
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Check cache system health"""
        health = {
            'redis_available': False,
            'redis_connected': False,
            'fallback_cache_size': len(self.fallback_cache.cache),
            'stats': self.get_stats()
        }
        
        if self.redis_client:
            health['redis_available'] = True
            try:
                await self.redis_client.ping()
                health['redis_connected'] = True
                info = await self.redis_client.info()
                health['redis_info'] = {
                    'version': info.get('redis_version'),
                    'used_memory': info.get('used_memory'),
                    'connected_clients': info.get('connected_clients')
                }
            except Exception as e:
                health['redis_error'] = str(e)
        
        return health

# Global caching service instance
caching_service = CachingService()