interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlMs: number = 60 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  getEntry(key: string): CacheEntry<unknown> | undefined {
    return this.cache.get(key);
  }
}

// Global cache instance
const cache = new MemoryCache();

// Cleanup expired entries every 10 minutes
setInterval(
  () => {
    cache.cleanup();
  },
  10 * 60 * 1000,
);

/** Default TTLs per data kind. */
export const TTL = {
  matches: 5 * 60 * 1000,
  standings: 15 * 60 * 1000,
  stats: 15 * 60 * 1000,
} as const;

/**
 * Generate cache key in format: <section>[-<params>]
 * @param section API section name (e.g., 'pl-matches')
 * @param params Optional parameters to include in the key
 */
export function generateCacheKey(
  section: string,
  params?: Record<string, string>,
): string {
  if (params && Object.keys(params).length > 0) {
    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('-');
    return `${section}-${paramString}`;
  }

  return section;
}

/**
 * Get cached data or fetch new data using the provided fetcher function.
 */
export async function getCachedData<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 60 * 60 * 1000,
): Promise<T> {
  const cached = cache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();

  // Only cache successful responses
  cache.set(cacheKey, data, ttlMs);

  return data;
}

/**
 * Invalidate cache entries matching a pattern (supports `*` wildcards).
 */
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  for (const key of cache.stats().keys) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

export function getCacheStats() {
  return cache.stats();
}

export const getCacheEntry = (key: string) => {
  return cache.getEntry(key);
};

export { cache };
