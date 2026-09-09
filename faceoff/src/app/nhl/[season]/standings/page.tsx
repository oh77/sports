'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { NhlStandings } from '../../../components/standings/nhl-standings';
import {
  StandingsFilterBar,
  useStandingsFilter,
} from '../../../components/standings/standings-filter';
import {
  applyStandingsFilter,
  getAvailableMonths,
} from '../../../components/standings/standingsUtils';
import type { GameInfo, LeagueResponse } from '../../../types/domain/game';
import type { RosterData } from '../../../types/domain/roster';
import type { StandingsData } from '../../../types/domain/standings';
import { withSeason } from '../../../utils/leaguePaths';
import { useSeason } from '../../../utils/useSeason';

function NHLStandingsContent() {
  const season = useSeason();
  const [filter, setFilter] = useStandingsFilter();
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [games, setGames] = useState<GameInfo[]>([]);
  const [swedes, setSwedes] = useState<Record<string, string[]>>({});
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

  // Played games back the home/away and month tables. `type=season` sweeps the
  // per-club schedules, as the weekly walk behind the other game types only
  // reaches a few weeks back. Fetched separately so the league table is never
  // held up by that sweep; the filters simply start working once it lands.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch(
          withSeason('/api/nhl-games?type=season', season),
        );
        if (!response.ok) return;
        const data: LeagueResponse = await response.json();
        if (active) setGames(data.gameInfo || []);
      } catch (err) {
        console.error('Failed to load NHL games:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, [season]);

  // Fetched separately so the table is never held up by the roster sweep; the
  // flags simply appear once it lands. A failure leaves the table unmarked.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setSwedes({});
        const response = await fetch(
          withSeason('/api/nhl-rosters?country=SE', season),
        );
        if (!response.ok) return;
        const data: RosterData = await response.json();
        const byTeam: Record<string, string[]> = {};
        for (const player of data.players ?? []) {
          const names = byTeam[player.teamCode] ?? [];
          names.push(player.fullName);
          byTeam[player.teamCode] = names;
        }
        if (active) setSwedes(byTeam);
      } catch (err) {
        console.error('Failed to load NHL rosters:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, [season]);

  const months = useMemo(() => getAvailableMonths(games), [games]);
  const displayStandings = useMemo(
    () => applyStandingsFilter({ filter, league: 'nhl', standings, games }),
    [filter, standings, games],
  );

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

        {!loading && !error && hasTeams && displayStandings && (
          <div className="mx-auto max-w-6xl">
            <StandingsFilterBar
              filter={filter}
              onChange={setFilter}
              months={months}
            />
            <NhlStandings
              standings={displayStandings}
              swedishPlayersByTeam={swedes}
            />
          </div>
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

export default function NHLStandingsPage() {
  return (
    <Suspense
      fallback={
        <main className="relative py-6 md:py-8">
          <div className="container relative z-10 mx-auto px-4">
            <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
              NHL · Tabell
            </h1>
            <div className="mx-auto max-w-6xl animate-pulse">
              <div className="h-96 rounded-lg bg-surface" />
            </div>
          </div>
        </main>
      }
    >
      <NHLStandingsContent />
    </Suspense>
  );
}
