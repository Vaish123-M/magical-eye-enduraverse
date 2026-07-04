"""Redis caching layer."""
import json
from typing import Optional, Any
import redis
from app.core.config import settings

# Redis connection (will be None if Redis is not available)
redis_client: Optional[redis.Redis] = None

if settings.CACHE_ENABLED:
    try:
        redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=0,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
        # Test connection
        redis_client.ping()
    except Exception:
        redis_client = None


def get_cache(key: str) -> Optional[Any]:
    """Get value from cache."""
    if not redis_client or not settings.CACHE_ENABLED:
        return None
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception:
        return None


def set_cache(key: str, value: Any, ttl: int = None) -> bool:
    """Set value in cache with TTL in seconds."""
    if not redis_client or not settings.CACHE_ENABLED:
        return False
    try:
        ttl = ttl or settings.CACHE_TTL
        redis_client.setex(key, ttl, json.dumps(value))
        return True
    except Exception:
        return False


def delete_cache(key: str) -> bool:
    """Delete value from cache."""
    if not redis_client or not settings.CACHE_ENABLED:
        return False
    try:
        redis_client.delete(key)
        return True
    except Exception:
        return False


def invalidate_pattern(pattern: str) -> bool:
    """Delete all keys matching a pattern."""
    if not redis_client or not settings.CACHE_ENABLED:
        return False
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
        return True
    except Exception:
        return False
