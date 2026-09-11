import time
from typing import Any, Dict, Optional, Tuple

class SimpleMemoryCache:
    """
    Lightweight, thread-safe in-memory cache with Time-To-Live (TTL).
    Prevents CPU-heavy SQLite aggregation on every HTTP request.
    """
    def __init__(self):
        self._cache: Dict[str, Tuple[float, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            expires_at, val = self._cache[key]
            if time.time() < expires_at:
                return val
            del self._cache[key]
        return None

    def set(self, key: str, val: Any, ttl_seconds: int = 30):
        self._cache[key] = (time.time() + ttl_seconds, val)

    def clear(self):
        self._cache.clear()

cache = SimpleMemoryCache()
