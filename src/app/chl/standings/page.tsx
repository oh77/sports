'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FullStandings } from '../../components/full-standings';
import { StandingsData } from '../../types/domain/standings';

export default function CHLStandingsPage() {
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStandings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/chl-standings');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setStandings(data);
      } catch (err) {
        setError('Failed to load standings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStandings();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 relative">
        {/* Background CHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <div className="w-96 h-96 bg-gray-300 rounded-full opacity-10 transform rotate-12"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header Row */}
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded animate-pulse"></div>
            <div className="text-center">
              <div className="h-8 md:h-12 bg-gray-300 rounded mb-2 w-48 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !standings) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 relative">
        {/* Background CHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <div className="w-96 h-96 bg-gray-300 rounded-full opacity-10 transform rotate-12"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header Row */}
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
            <Image
              src="https://www.chl.hockey/static/img/logo.png"
              alt="CHL Logo"
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
            />
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wider">
                STANDINGS
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mt-2">
                CHL Standings
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {error || 'Standings Not Available'}
            </h2>
            <p className="text-gray-200 mb-6">
              {error || 'Could not load standings at this time'}
            </p>
            <Link
              href="/chl"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to CHL
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 relative">
      {/* Background CHL Logo */}
      <div className="fixed top-0 right-0 z-0">
        <div className="w-96 h-96 bg-gray-300 rounded-full opacity-10 transform rotate-12"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Row */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
          <Image
            src="https://www.chl.hockey/static/img/logo.png"
            alt="CHL Logo"
            width={80}
            height={80}
            className="w-16 h-16 md:w-20 md:h-20 object-contain"
          />
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wider">
              STANDINGS
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mt-2">
              CHL
            </p>
          </div>
        </div>

        <FullStandings standings={standings} league="chl" />

        <div className="text-center mt-8">
          <Link
            href="/chl"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to CHL
          </Link>
        </div>
      </div>
    </main>
  );
}
