'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FullStandings } from '../../components/full-standings';
import { StandingsData } from '../../types/domain/standings';
import { StandingsHeader } from '../../components/standings-header';

export default function SDHLStandingsPage() {
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStandings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/sdhl-standings');

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
        {/* Background SDHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
            alt="SDHL Background"
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <StandingsHeader
            league="sdhl"
            leagueName="SDHL Ligatabell"
            logoUrl="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
            backPath="/sdhl"
          />

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
        {/* Background SDHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
            alt="SDHL Background"
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <StandingsHeader
            league="sdhl"
            leagueName="SDHL Ligatabell"
            logoUrl="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
            backPath="/sdhl"
          />

          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {error || 'Ligatabell Inte Tillgänglig'}
            </h2>
            <p className="text-gray-200 mb-6">
              {error || 'Kunde inte ladda ligatabell just nu'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 relative">
      {/* Background SDHL Logo */}
      <div className="fixed top-0 right-0 z-0">
        <Image
          src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
          alt="SDHL Background"
          width={400}
          height={400}
          className="opacity-10 transform rotate-12"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <StandingsHeader
          league="sdhl"
          leagueName="SDHL Ligatabell"
          logoUrl="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
          backPath="/sdhl"
        />

        <FullStandings standings={standings} league="sdhl" />
      </div>
    </main>
  );
}
