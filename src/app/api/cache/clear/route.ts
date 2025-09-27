import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '../../../utils/cache';

export async function POST(request: NextRequest) {
  try {
    // Clear all cache entries
    invalidateCache();
    
    return NextResponse.json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
