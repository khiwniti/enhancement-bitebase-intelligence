"""
Enterprise Redis Caching Service
High-performance caching with multiple strategies and automatic invalidation
"""

import json
import pickle
import hashlib
import logging
from typing import Any, Optional, Dict, List, Union, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import redis
import asyncio
from functools import wraps

logger = logging.getLogger(__name__)

class CacheStrategy(str, Enum):
    """Cache strategy types"""
    LRU = "lru"  # Least Recently Used
    LFU = "lfu"  # Least Frequently Used
    TTL = "ttl"  # Time To Live
    WRITE_THROUGH = "write_through"
    WRITE_BEHIND = "write_behind"
    READ_THROUGH = "read_through"

class SerializationMethod(str, Enum):
    """Serialization methods"""
    JSON = "json"
    PICKLE = "pickle"
    STRING = "string"

@dataclass
class CacheConfig:
    """Cache configuration"""
    default_ttl: int = 3600  # 1 hour
    max_memory: str = "1gb"
    eviction_policy: str = "allkeys-lru"
    compression: bool = True
    serialization: SerializationMethod = SerializationMethod.JSON

class EnterpriseRedisCache:
    """Enterprise-grade Redis caching service"""
    
    def __init__(
        self,
        redis_client: Optional[redis.Redis] = None,
        config: Optional[CacheConfig] = None
    ):
        self.redis = redis_client or redis.Redis(
            host='localhost',
            port=6379,
            db=2,  # Use separate DB for cache
            decode_responses=False  # Handle binary data
        )
        self.config = config or CacheConfig()
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0,
            'errors': 0
        }
        
        # Configure Redis for optimal caching
        self._configure_redis()
    
    def _configure_redis(self):
        """Configure Redis for optimal caching performance"""
        try:
            # Set memory policy
            self.redis.config_set('maxmemory', self.config.max_memory)
            self.redis.config_set('maxmemory-policy', self.config.eviction_policy)
            
            # Enable keyspace notifications for cache invalidation
            self.redis.config_set('notify-keyspace-events', 'Ex')
            
        except Exception as e:
            logger.warning(f"Failed to configure Redis: {e}")
    
    def _serialize(self, data: Any, method: SerializationMethod = None) -> bytes:
        """Serialize data for storage"""
        method = method or self.config.serialization
        
        try:
            if method == SerializationMethod.JSON:
                return json.dumps(data, default=str).encode('utf-8')
            elif method == SerializationMethod.PICKLE:
                return pickle.dumps(data)
            elif method == SerializationMethod.STRING:
                return str(data).encode('utf-8')
            else:
                return json.dumps(data, default=str).encode('utf-8')
        except Exception as e:
            logger.error(f"Serialization failed: {e}")
            return b""
    
    def _deserialize(self, data: bytes, method: SerializationMethod = None) -> Any:
        """Deserialize data from storage"""
        method = method or self.config.serialization
        
        try:
            if method == SerializationMethod.JSON:
                return json.loads(data.decode('utf-8'))
            elif method == SerializationMethod.PICKLE:
                return pickle.loads(data)
            elif method == SerializationMethod.STRING:
                return data.decode('utf-8')
            else:
                return json.loads(data.decode('utf-8'))
        except Exception as e:
            logger.error(f"Deserialization failed: {e}")
            return None
    
    def _generate_key(self, namespace: str, key: str, **kwargs) -> str:
        """Generate cache key with namespace and optional parameters"""
        if kwargs:
            # Create deterministic key from kwargs
            sorted_kwargs = sorted(kwargs.items())
            kwargs_str = json.dumps(sorted_kwargs, sort_keys=True)
            kwargs_hash = hashlib.md5(kwargs_str.encode()).hexdigest()[:8]
            return f"{namespace}:{key}:{kwargs_hash}"
        return f"{namespace}:{key}"
    
    async def get(
        self,
        key: str,
        namespace: str = "default",
        serialization: SerializationMethod = None,
        **kwargs
    ) -> Optional[Any]:
        """Get value from cache"""
        cache_key = self._generate_key(namespace, key, **kwargs)
        
        try:
            data = await self.redis.get(cache_key)
            if data is None:
                self.stats['misses'] += 1
                return None
            
            self.stats['hits'] += 1
            return self._deserialize(data, serialization)
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Cache get failed for key {cache_key}: {e}")
            return None
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        namespace: str = "default",
        serialization: SerializationMethod = None,
        **kwargs
    ) -> bool:
        """Set value in cache"""
        cache_key = self._generate_key(namespace, key, **kwargs)
        ttl = ttl or self.config.default_ttl
        
        try:
            serialized_data = self._serialize(value, serialization)
            if not serialized_data:
                return False
            
            if ttl > 0:
                await self.redis.setex(cache_key, ttl, serialized_data)
            else:
                await self.redis.set(cache_key, serialized_data)
            
            self.stats['sets'] += 1
            return True
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Cache set failed for key {cache_key}: {e}")
            return False
    
    async def delete(self, key: str, namespace: str = "default", **kwargs) -> bool:
        """Delete value from cache"""
        cache_key = self._generate_key(namespace, key, **kwargs)
        
        try:
            result = await self.redis.delete(cache_key)
            self.stats['deletes'] += 1
            return result > 0
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Cache delete failed for key {cache_key}: {e}")
            return False
    
    async def exists(self, key: str, namespace: str = "default", **kwargs) -> bool:
        """Check if key exists in cache"""
        cache_key = self._generate_key(namespace, key, **kwargs)
        
        try:
            return await self.redis.exists(cache_key) > 0
        except Exception as e:
            logger.error(f"Cache exists check failed for key {cache_key}: {e}")
            return False
    
    async def expire(self, key: str, ttl: int, namespace: str = "default", **kwargs) -> bool:
        """Set expiration time for key"""
        cache_key = self._generate_key(namespace, key, **kwargs)
        
        try:
            return await self.redis.expire(cache_key, ttl)
        except Exception as e:
            logger.error(f"Cache expire failed for key {cache_key}: {e}")
            return False
    
    async def get_ttl(self, key: str, namespace: str = "default", **kwargs) -> int:
        """Get remaining TTL for key"""
        cache_key = self._generate_key(namespace, key, **kwargs)
        
        try:
            return await self.redis.ttl(cache_key)
        except Exception as e:
            logger.error(f"Cache TTL check failed for key {cache_key}: {e}")
            return -1
    
    async def invalidate_pattern(self, pattern: str, namespace: str = "default") -> int:
        """Invalidate all keys matching pattern"""
        full_pattern = f"{namespace}:{pattern}"
        
        try:
            keys = await self.redis.keys(full_pattern)
            if keys:
                deleted = await self.redis.delete(*keys)
                self.stats['deletes'] += deleted
                return deleted
            return 0
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Cache pattern invalidation failed for {full_pattern}: {e}")
            return 0
    
    async def get_multi(
        self,
        keys: List[str],
        namespace: str = "default",
        serialization: SerializationMethod = None
    ) -> Dict[str, Any]:
        """Get multiple values from cache"""
        cache_keys = [self._generate_key(namespace, key) for key in keys]
        
        try:
            values = await self.redis.mget(cache_keys)
            result = {}
            
            for i, (original_key, value) in enumerate(zip(keys, values)):
                if value is not None:
                    result[original_key] = self._deserialize(value, serialization)
                    self.stats['hits'] += 1
                else:
                    self.stats['misses'] += 1
            
            return result
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Cache multi-get failed: {e}")
            return {}
    
    async def set_multi(
        self,
        data: Dict[str, Any],
        ttl: Optional[int] = None,
        namespace: str = "default",
        serialization: SerializationMethod = None
    ) -> bool:
        """Set multiple values in cache"""
        ttl = ttl or self.config.default_ttl
        
        try:
            pipe = self.redis.pipeline()
            
            for key, value in data.items():
                cache_key = self._generate_key(namespace, key)
                serialized_data = self._serialize(value, serialization)
                
                if serialized_data:
                    if ttl > 0:
                        pipe.setex(cache_key, ttl, serialized_data)
                    else:
                        pipe.set(cache_key, serialized_data)
            
            await pipe.execute()
            self.stats['sets'] += len(data)
            return True
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Cache multi-set failed: {e}")
            return False
    
    async def increment(self, key: str, amount: int = 1, namespace: str = "default", **kwargs) -> Optional[int]:
        """Increment numeric value in cache"""
        cache_key = self._generate_key(namespace, key, **kwargs)
        
        try:
            return await self.redis.incrby(cache_key, amount)
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Cache increment failed for key {cache_key}: {e}")
            return None
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            redis_info = await self.redis.info('memory')
            redis_stats = await self.redis.info('stats')
            
            return {
                'cache_stats': self.stats.copy(),
                'hit_rate': (
                    self.stats['hits'] / (self.stats['hits'] + self.stats['misses'])
                    if (self.stats['hits'] + self.stats['misses']) > 0 else 0
                ),
                'redis_memory': {
                    'used_memory': redis_info.get('used_memory', 0),
                    'used_memory_human': redis_info.get('used_memory_human', '0B'),
                    'used_memory_peak': redis_info.get('used_memory_peak', 0),
                    'used_memory_peak_human': redis_info.get('used_memory_peak_human', '0B'),
                },
                'redis_stats': {
                    'total_commands_processed': redis_stats.get('total_commands_processed', 0),
                    'instantaneous_ops_per_sec': redis_stats.get('instantaneous_ops_per_sec', 0),
                    'keyspace_hits': redis_stats.get('keyspace_hits', 0),
                    'keyspace_misses': redis_stats.get('keyspace_misses', 0),
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {'cache_stats': self.stats.copy(), 'error': str(e)}
    
    async def clear_namespace(self, namespace: str) -> int:
        """Clear all keys in a namespace"""
        return await self.invalidate_pattern("*", namespace)
    
    async def clear_all(self) -> bool:
        """Clear all cache data"""
        try:
            await self.redis.flushdb()
            self.stats = {
                'hits': 0,
                'misses': 0,
                'sets': 0,
                'deletes': 0,
                'errors': 0
            }
            return True
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")
            return False

# Cache decorators for automatic caching

def cache_result(
    ttl: int = 3600,
    namespace: str = "function_cache",
    key_func: Optional[Callable] = None,
    serialization: SerializationMethod = SerializationMethod.JSON
):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache = get_cache()
            
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default key generation
                args_str = json.dumps(args, default=str, sort_keys=True)
                kwargs_str = json.dumps(kwargs, default=str, sort_keys=True)
                combined = f"{func.__name__}:{args_str}:{kwargs_str}"
                cache_key = hashlib.md5(combined.encode()).hexdigest()
            
            # Try to get from cache
            cached_result = await cache.get(cache_key, namespace, serialization)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            
            await cache.set(cache_key, result, ttl, namespace, serialization)
            return result
        
        return wrapper
    return decorator

def invalidate_cache(namespace: str, pattern: str = "*"):
    """Decorator to invalidate cache after function execution"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            
            # Invalidate cache
            cache = get_cache()
            await cache.invalidate_pattern(pattern, namespace)
            
            return result
        
        return wrapper
    return decorator

# Global cache instance
_cache_instance = None

def get_cache() -> EnterpriseRedisCache:
    """Get global cache instance"""
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = EnterpriseRedisCache()
    return _cache_instance

def init_cache(redis_client: Optional[redis.Redis] = None, config: Optional[CacheConfig] = None):
    """Initialize global cache instance"""
    global _cache_instance
    _cache_instance = EnterpriseRedisCache(redis_client, config)
