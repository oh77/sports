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

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
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

/**
 * Generate cache key in format: <section>-<yymmddhh>
 * @param section API section name (e.g., 'chl-games')
 * @param params Optional parameters to include in the key
 * @returns Cache key string
 */
export function generateCacheKey(
  section: string,
  params?: Record<string, string>,
): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');

  const timeKey = `${year}${month}${day}${hour}`;

  if (params && Object.keys(params).length > 0) {
    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('-');
    return `${section}-${timeKey}-${paramString}`;
  }

  return `${section}-${timeKey}`;
}

/**
 * Get cached data or fetch new data using provided fetcher function
 * @param cacheKey Cache key
 * @param fetcher Function that fetches fresh data
 * @param ttlMs Time to live in milliseconds (default: 60 minutes)
 * @returns Cached or fresh data
 */
export async function getCachedData<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 60 * 60 * 1000, // 60 minutes default
): Promise<T> {
  // Try to get from cache first
  const cached = null; //cache.get<T>(cacheKey);
  if (cached !== null) {
    console.log(`Cache hit for key: ${cacheKey}`);
    return cached;
  }

  console.log(`Cache miss for key: ${cacheKey}, fetching fresh data`);

  try {
    // Fetch fresh data
    const data = await fetcher();

    // Only cache successful responses
    cache.set(cacheKey, data, ttlMs);
    console.log(`Cached fresh data for key: ${cacheKey}`);

    return data;
  } catch (error) {
    console.error(`Error fetching data for key ${cacheKey}:`, error);
    throw error;
  }
}

/**
 * Invalidate cache entries matching a pattern
 * @param pattern Pattern to match cache keys (supports wildcards)
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

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cache.stats();
}

export { cache };

export const getCacheEntry = (key: string) => {
  return cache.getEntry(key);
};
