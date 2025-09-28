import { NextResponse } from 'next/server';
import { cache, getCacheEntry } from '../../../utils/cache';

export async function GET() {
  try {
    const stats = cache.stats();
    const entries = [];

    // Get all cache entries with their metadata
    for (const key of stats.keys) {
      const entry = getCacheEntry(key);
      if (entry) {
        const now = Date.now();
        const isExpired = (now - entry.timestamp) > entry.ttl;
        
        entries.push({
          key,
          data: entry.data,
          timestamp: entry.timestamp,
          ttl: entry.ttl,
          isExpired
        });
      }
    }

    return NextResponse.json({
      entries,
      stats: {
        totalEntries: entries.length,
        activeEntries: entries.filter(e => !e.isExpired).length,
        expiredEntries: entries.filter(e => e.isExpired).length
      }
    });
  } catch (error) {
    console.error('Error inspecting cache:', error);
    return NextResponse.json(
      { error: 'Failed to inspect cache' },
      { status: 500 }
    );
  }
}
