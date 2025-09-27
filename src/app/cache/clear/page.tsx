'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CacheClearPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const clearCache = async () => {
    try {
      setIsClearing(true);
      setResult(null);

      const response = await fetch('/api/cache/clear', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Cache cleared successfully!'
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to clear cache'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Clear Cache
            </h1>
            <Link 
              href="/cache" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Cache
            </Link>
          </div>

          {/* Warning Card */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="text-red-500 text-2xl mr-3">⚠️</div>
              <h2 className="text-xl font-bold text-red-800">Warning</h2>
            </div>
            <p className="text-red-700 mb-4">
              This action will permanently delete ALL cached data from the application. This includes:
            </p>
            <ul className="text-red-700 list-disc list-inside space-y-1 mb-4">
              <li>All API response caches (CHL, SHL, SDHL games and standings)</li>
              <li>Team data caches</li>
              <li>Any other cached data</li>
            </ul>
            <p className="text-red-700 font-medium">
              After clearing, the next API requests will fetch fresh data from external sources, which may take longer.
            </p>
          </div>

          {/* Action Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Clear All Cache</h2>
            
            {result && (
              <div className={`p-4 rounded-lg mb-6 ${
                result.success 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  <div className={`text-xl mr-3 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? '✅' : '❌'}
                  </div>
                  <div>
                    <div className="font-medium">
                      {result.success ? 'Success!' : 'Error'}
                    </div>
                    <div className="text-sm">{result.message}</div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={clearCache}
              disabled={isClearing}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isClearing
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isClearing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Clearing Cache...
                </div>
              ) : (
                'Clear All Cache'
              )}
            </button>
          </div>

          {/* Information Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4">What happens next?</h2>
            <ul className="text-blue-700 space-y-2">
              <li>• All cached data will be permanently deleted</li>
              <li>• Next API requests will fetch fresh data from external sources</li>
              <li>• Cache will automatically rebuild as new requests are made</li>
              <li>• Performance may be temporarily slower until cache rebuilds</li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Link 
              href="/cache" 
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              View Cache
            </Link>
            <Link 
              href="/" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
