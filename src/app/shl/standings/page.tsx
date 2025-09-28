'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FullStandings } from '../../components/full-standings';
import { StatnetStandingsData } from '../../types/statnet/standings';

export default function SHLStandingsPage() {
  const [standings, setStandings] = useState<StatnetStandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStandings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shl-standings');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setStandings(data);
      } catch (err) {
        setError('Misslyckades att ladda ligatabellen');
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
        {/* Background SHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
            alt="SHL Background"
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header Row */}
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
            <div className="w-20 h-20 bg-gray-300 rounded animate-pulse"></div>
            <div className="text-center">
              <div className="h-12 bg-gray-300 rounded mb-2 w-48 animate-pulse"></div>
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
        {/* Background SHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
            alt="SHL Background"
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header Row */}
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
            <Image
              src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
              alt="SHL Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
            />
            <div className="text-center">
              <h1 className="text-5xl font-bold text-white uppercase tracking-wider">
                LIGATABELL
              </h1>
              <p className="text-2xl text-gray-200 mt-2">
                SHL Ligatabell
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {error || 'Ligatabell Inte Tillgänglig'}
            </h2>
            <p className="text-gray-200 mb-6">
              {error || 'Kunde inte ladda ligatabell just nu'}
            </p>
            <Link
              href="/shl"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Tillbaka till SHL
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 relative">
      {/* Background SHL Logo */}
      <div className="fixed top-0 right-0 z-0">
        <Image
          src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
          alt="SHL Background"
          width={400}
          height={400}
          className="opacity-10 transform rotate-12"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Row */}
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
            alt="SHL Logo"
            width={80}
            height={80}
            className="w-20 h-20 object-contain"
          />
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white uppercase tracking-wider">
              LIGATABELL
            </h1>
            <p className="text-2xl text-gray-200 mt-2">
              SHL Ligatabell
            </p>
          </div>
        </div>

        <FullStandings standings={standings} league="shl" />

        <div className="text-center mt-8">
          <Link
            href="/shl"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Tillbaka till SHL
          </Link>
        </div>
      </div>
    </main>
  );
}
