"""
API Proxy endpoints for BiteBase Intelligence
Secure proxy for external API calls with rate limiting and caching
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Depends, Request
from pydantic import BaseModel, Field
import httpx
import json
import hashlib
import asyncio
from urllib.parse import urlencode

router = APIRouter()

# Data Models
class ProxyRequest(BaseModel):
    url: str = Field(..., description="Target URL to proxy")
    method: str = Field(default="GET", description="HTTP method")
    headers: Optional[Dict[str, str]] = Field(default_factory=dict)
    params: Optional[Dict[str, Any]] = Field(default_factory=dict)
    data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    timeout: Optional[int] = Field(default=30, description="Request timeout in seconds")

class ProxyResponse(BaseModel):
    status_code: int
    data: Any
    headers: Dict[str, str]
    cached: bool = False
    cache_expires: Optional[datetime] = None

# Simple in-memory cache (replace with Redis in production)
cache_store: Dict[str, Dict[str, Any]] = {}

# Rate limiting storage (replace with Redis in production)
rate_limit_store: Dict[str, Dict[str, Any]] = {}

# Allowed external APIs (whitelist for security)
ALLOWED_APIS = {
    "google_places": {
        "base_url": "https://maps.googleapis.com/maps/api/place",
        "rate_limit": 100,  # requests per hour
        "cache_ttl": 3600   # 1 hour
    },
    "wongnai": {
        "base_url": "https://api.wongnai.com",
        "rate_limit": 200,
        "cache_ttl": 1800   # 30 minutes
    },
    "foodpanda": {
        "base_url": "https://api.foodpanda.com",
        "rate_limit": 150,
        "cache_ttl": 1800
    },
    "grabfood": {
        "base_url": "https://api.grab.com",
        "rate_limit": 100,
        "cache_ttl": 1800
    },
    "line_man": {
        "base_url": "https://api.lineman.com",
        "rate_limit": 100,
        "cache_ttl": 1800
    }
}

@router.post("/request", response_model=ProxyResponse)
async def proxy_request(request: ProxyRequest):
    """Make a proxied request to external API"""
    
    # Validate URL is allowed
    api_config = validate_api_url(request.url)
    if not api_config:
        raise HTTPException(status_code=403, detail="API not allowed")
    
    # Check rate limits
    if not check_rate_limit(api_config["name"]):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    # Generate cache key
    cache_key = generate_cache_key(request)
    
    # Check cache first
    cached_response = get_cached_response(cache_key)
    if cached_response:
        return ProxyResponse(
            status_code=cached_response["status_code"],
            data=cached_response["data"],
            headers=cached_response["headers"],
            cached=True,
            cache_expires=cached_response["expires"]
        )
    
    # Make the actual request
    try:
        async with httpx.AsyncClient(timeout=request.timeout) as client:
            response = await client.request(
                method=request.method,
                url=request.url,
                headers=request.headers,
                params=request.params,
                json=request.data if request.method in ["POST", "PUT", "PATCH"] else None,
                timeout=request.timeout
            )
            
            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            # Cache the response
            cache_response(cache_key, {
                "status_code": response.status_code,
                "data": response_data,
                "headers": dict(response.headers),
                "expires": datetime.now() + timedelta(seconds=api_config["cache_ttl"])
            }, api_config["cache_ttl"])
            
            # Update rate limit counter
            update_rate_limit(api_config["name"])
            
            return ProxyResponse(
                status_code=response.status_code,
                data=response_data,
                headers=dict(response.headers),
                cached=False
            )
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timeout")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Request failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")

@router.get("/google-places/search")
async def google_places_search(
    query: str = Query(..., description="Search query"),
    location: Optional[str] = Query(None, description="Location bias"),
    radius: Optional[int] = Query(None, description="Search radius in meters"),
    type: Optional[str] = Query(None, description="Place type filter")
):
    """Proxy for Google Places API search"""
    
    # Build Google Places API request
    params = {
        "query": query,
        "key": "YOUR_GOOGLE_API_KEY"  # Replace with actual API key from environment
    }
    
    if location:
        params["location"] = location
    if radius:
        params["radius"] = radius
    if type:
        params["type"] = type
    
    proxy_request = ProxyRequest(
        url="https://maps.googleapis.com/maps/api/place/textsearch/json",
        method="GET",
        params=params
    )
    
    return await proxy_request(proxy_request)

@router.get("/wongnai/restaurants")
async def wongnai_restaurants(
    location: str = Query(..., description="Location to search"),
    cuisine: Optional[str] = Query(None, description="Cuisine type"),
    price_range: Optional[str] = Query(None, description="Price range filter")
):
    """Proxy for Wongnai restaurant search"""
    
    params = {
        "location": location,
        "api_key": "YOUR_WONGNAI_API_KEY"  # Replace with actual API key
    }
    
    if cuisine:
        params["cuisine"] = cuisine
    if price_range:
        params["price_range"] = price_range
    
    proxy_request = ProxyRequest(
        url="https://api.wongnai.com/v1/restaurants/search",
        method="GET",
        params=params
    )
    
    return await proxy_request(proxy_request)

@router.get("/cache/stats")
async def get_cache_stats():
    """Get cache statistics"""
    total_entries = len(cache_store)
    expired_entries = sum(1 for entry in cache_store.values() 
                         if entry.get("expires", datetime.now()) < datetime.now())
    
    return {
        "total_entries": total_entries,
        "active_entries": total_entries - expired_entries,
        "expired_entries": expired_entries,
        "cache_hit_rate": "N/A",  # Would need to track hits/misses
        "apis": list(ALLOWED_APIS.keys())
    }

@router.delete("/cache/clear")
async def clear_cache(api: Optional[str] = Query(None, description="Clear cache for specific API")):
    """Clear cache entries"""
    global cache_store
    
    if api:
        # Clear cache for specific API
        keys_to_remove = [key for key in cache_store.keys() if api in key]
        for key in keys_to_remove:
            del cache_store[key]
        return {"message": f"Cache cleared for {api}", "removed_entries": len(keys_to_remove)}
    else:
        # Clear all cache
        cache_store.clear()
        return {"message": "All cache cleared"}

@router.get("/rate-limits")
async def get_rate_limits():
    """Get current rate limit status for all APIs"""
    current_time = datetime.now()
    status = {}
    
    for api_name, config in ALLOWED_APIS.items():
        rate_data = rate_limit_store.get(api_name, {})
        
        # Clean expired entries
        rate_data = {
            timestamp: count for timestamp, count in rate_data.items()
            if datetime.fromisoformat(timestamp) > current_time - timedelta(hours=1)
        }
        
        current_usage = sum(rate_data.values())
        
        status[api_name] = {
            "limit": config["rate_limit"],
            "current_usage": current_usage,
            "remaining": max(0, config["rate_limit"] - current_usage),
            "reset_time": (current_time + timedelta(hours=1)).isoformat()
        }
    
    return status

# Helper functions
def validate_api_url(url: str) -> Optional[Dict[str, Any]]:
    """Validate if URL is allowed and return API config"""
    for api_name, config in ALLOWED_APIS.items():
        if url.startswith(config["base_url"]):
            return {**config, "name": api_name}
    return None

def generate_cache_key(request: ProxyRequest) -> str:
    """Generate cache key for request"""
    key_data = {
        "url": request.url,
        "method": request.method,
        "params": request.params,
        "data": request.data
    }
    key_string = json.dumps(key_data, sort_keys=True)
    return hashlib.md5(key_string.encode()).hexdigest()

def get_cached_response(cache_key: str) -> Optional[Dict[str, Any]]:
    """Get cached response if not expired"""
    if cache_key not in cache_store:
        return None
    
    cached = cache_store[cache_key]
    if cached.get("expires", datetime.now()) < datetime.now():
        # Remove expired entry
        del cache_store[cache_key]
        return None
    
    return cached

def cache_response(cache_key: str, response_data: Dict[str, Any], ttl: int):
    """Cache response data"""
    cache_store[cache_key] = {
        **response_data,
        "cached_at": datetime.now(),
        "expires": datetime.now() + timedelta(seconds=ttl)
    }

def check_rate_limit(api_name: str) -> bool:
    """Check if API rate limit allows request"""
    if api_name not in ALLOWED_APIS:
        return False
    
    config = ALLOWED_APIS[api_name]
    current_time = datetime.now()
    hour_ago = current_time - timedelta(hours=1)
    
    # Get rate limit data for this API
    if api_name not in rate_limit_store:
        rate_limit_store[api_name] = {}
    
    rate_data = rate_limit_store[api_name]
    
    # Clean old entries (older than 1 hour)
    rate_data = {
        timestamp: count for timestamp, count in rate_data.items()
        if datetime.fromisoformat(timestamp) > hour_ago
    }
    rate_limit_store[api_name] = rate_data
    
    # Count current usage
    current_usage = sum(rate_data.values())
    
    return current_usage < config["rate_limit"]

def update_rate_limit(api_name: str):
    """Update rate limit counter"""
    current_time = datetime.now()
    minute_key = current_time.replace(second=0, microsecond=0).isoformat()
    
    if api_name not in rate_limit_store:
        rate_limit_store[api_name] = {}
    
    if minute_key not in rate_limit_store[api_name]:
        rate_limit_store[api_name][minute_key] = 0
    
    rate_limit_store[api_name][minute_key] += 1
