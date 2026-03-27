const cache = new Map();

function now() {
  return Date.now();
}

export function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= now()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

export function setCache(key, value, ttlSeconds = 60) {
  cache.set(key, {
    value,
    expiresAt: now() + ttlSeconds * 1000,
  });
  return value;
}

export function clearCache(predicate = () => true) {
  for (const key of cache.keys()) {
    if (predicate(key)) cache.delete(key);
  }
}

export function cacheStats() {
  return {
    size: cache.size,
  };
}
