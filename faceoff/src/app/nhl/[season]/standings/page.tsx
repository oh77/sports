'use client';

import { useEffect, useState } from 'react';
import { NhlStandings } from '../../../components/standings/nhl-standings';
import type { StandingsData } from '../../../types/domain/standings';
import { withSeason } from '../../../utils/leaguePaths';
import { useSeason } from '../../../utils/useSeason';

export default function NHLStandingsPage() {
  const season = useSeason();
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStandings = async () => {
      try {
        setLoading(true);
        const response = await fetch(withSeason('/api/nhl-standings', season));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setStandings(await response.json());
      } catch (err) {
        setError('Failed to load standings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStandings();
  }, [season]);

  const hasTeams = (standings?.stats?.length ?? 0) > 0;

  return (
    <main className="relative py-6 md:py-8">
      <div className="container relative z-10 mx-auto px-4">
        <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
          NHL · Tabell
        </h1>

        {loading && (
          <div className="mx-auto max-w-6xl animate-pulse">
            <div className="h-96 rounded-lg bg-surface" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center">
            <div className="mb-4 text-6xl text-loss">⚠️</div>
            <p className="text-dim">{error}</p>
          </div>
        )}

        {!loading && !error && hasTeams && standings && (
          <NhlStandings standings={standings} />
        )}

        {!loading && !error && !hasTeams && (
          <div className="mx-auto max-w-md rounded-lg border border-line bg-surface px-6 py-12 text-center">
            <div className="mb-3 text-4xl">🏒</div>
            <h2 className="display mb-2 text-lg font-bold uppercase tracking-[0.04em] text-ink">
              Säsongen har inte börjat ännu
            </h2>
            <p className="text-sm text-dim">
              Byt till en tidigare säsong för att se sluttabellen.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
