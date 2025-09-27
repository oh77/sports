'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
  isExpired: boolean;
}

export default function CacheViewPage() {
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCacheData = async () => {
      try {
        setLoading(true);
        
        // Create a test API endpoint to get cache data
        const response = await fetch('/api/cache/inspect');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch cache data: ${response.status}`);
        }
        
        const data = await response.json();
        setCacheEntries(data.entries || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCacheData();
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTTL = (ttl: number) => {
    const minutes = Math.floor(ttl / (1000 * 60));
    const seconds = Math.floor((ttl % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getExpiryTime = (timestamp: number, ttl: number) => {
    const expiry = new Date(timestamp + ttl);
    return expiry.toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-8 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Cache Error
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Cache Inspector
          </h1>
          <div className="flex gap-4">
            <Link 
              href="/cache/clear"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear All Cache
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh
            </button>
            <Link 
              href="/" 
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Cache Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cache Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{cacheEntries.length}</div>
              <div className="text-gray-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {cacheEntries.filter(entry => !entry.isExpired).length}
              </div>
              <div className="text-gray-600">Active Entries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {cacheEntries.filter(entry => entry.isExpired).length}
              </div>
              <div className="text-gray-600">Expired Entries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(cacheEntries.reduce((acc, entry) => acc + JSON.stringify(entry.data).length, 0) / 1024)} KB
              </div>
              <div className="text-gray-600">Total Size</div>
            </div>
          </div>
        </div>

        {/* Cache Entries */}
        <div className="space-y-6">
          {cacheEntries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Cache Entries</h3>
              <p className="text-gray-600">The cache is empty or no data is available.</p>
            </div>
          ) : (
            cacheEntries.map((entry, index) => (
              <div 
                key={entry.key} 
                className={`rounded-lg shadow-lg p-6 ${
                  entry.isExpired ? 'bg-red-50 border-l-4 border-red-500' : 'bg-white border-l-4 border-green-500'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 font-mono">
                    {entry.key}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.isExpired 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {entry.isExpired ? 'EXPIRED' : 'ACTIVE'}
                    </span>
                    <span className="text-sm text-gray-500">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Created</div>
                    <div className="text-sm text-gray-800">{formatTimestamp(entry.timestamp)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">TTL</div>
                    <div className="text-sm text-gray-800">{formatTTL(entry.ttl)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Expires</div>
                    <div className="text-sm text-gray-800">{getExpiryTime(entry.timestamp, entry.ttl)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">Cached Data</div>
                  <pre className="bg-gray-100 rounded p-4 text-xs overflow-auto max-h-64 border">
                    {JSON.stringify(entry.data, null, 2)}
                  </pre>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
