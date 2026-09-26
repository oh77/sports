'use client';

import { useEffect, useState } from 'react';
import { PositionChart } from '@/app/components/position-chart';
import { StatnetService } from '@/app/services/statnetService';
import { leagueMeta } from '@/app/theme/nhl';
import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import { useSeason } from '@/app/utils/useSeason';

interface LeaguePositionsProps {
  /** A Statnet league — the regular-season schedule drives the chart. */
  league: Extract<League, 'shl' | 'sdhl' | 'ha'>;
}

/** PLACERINGAR page: every team's table position after each played game. */
export function LeaguePositions({ league }: LeaguePositionsProps) {
  const season = useSeason();
  const [games, setGames] = useState<GameInfo[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setGames(null);
    setError(false);
    new StatnetService(league, season)
      .fetchGames()
      .then((data) => {
        if (active) setGames(data);
      })
      .catch((err) => {
        console.error('Failed to load games:', err);
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [league, season]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="display mb-2 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
        {leagueMeta[league].name} · Placeringar
      </h1>
      <p className="mb-6 text-sm text-dim">
        Tabellplacering efter varje spelad match i grundserien. Håll över en
        linje eller välj ett lag för att följa det.
      </p>

      {error ? (
        <p className="rounded-lg border border-line bg-surface px-4 py-8 text-center text-dim">
          Kunde inte ladda matcherna.
        </p>
      ) : games === null ? (
        <div
          className="h-[480px] animate-pulse rounded-lg bg-surface"
          aria-busy="true"
        >
          <span className="sr-only">Laddar</span>
        </div>
      ) : (
        <PositionChart games={games} />
      )}
    </main>
  );
}
