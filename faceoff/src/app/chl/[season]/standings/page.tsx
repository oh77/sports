'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { FullStandings } from '../../../components/standings/full-standings';
import { MatchesTable } from '../../../components/standings/matches-table';
import {
  StandingsFilterBar,
  useStandingsFilter,
} from '../../../components/standings/standings-filter';
import {
  applyStandingsFilter,
  getAvailableMonths,
} from '../../../components/standings/standingsUtils';
import { TrendTable } from '../../../components/standings/trend-table';
import { Tabs } from '../../../components/tabs';
import type { GameInfo, LeagueResponse } from '../../../types/domain/game';
import type { StandingsData } from '../../../types/domain/standings';
import { withSeason } from '../../../utils/leaguePaths';
import { useSeason } from '../../../utils/useSeason';

function CHLStandingsContent() {
  const season = useSeason();
  const [filter, setFilter] = useStandingsFilter();
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStandings = async () => {
      try {
        setLoading(true);
        const [standingsResponse, gamesResponse] = await Promise.all([
          fetch(withSeason('/api/chl-standings', season)),
          fetch(withSeason('/api/chl-games?type=all-recent', season)),
        ]);

        if (!standingsResponse.ok) {
          throw new Error(`HTTP error! status: ${standingsResponse.status}`);
        }

        const data = await standingsResponse.json();
        setStandings(data);

        if (gamesResponse.ok) {
          const gamesData: LeagueResponse = await gamesResponse.json();
          setGames(gamesData.gameInfo || []);
        }
      } catch (err) {
        setError('Failed to load standings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStandings();
  }, [season]);

  const months = useMemo(() => getAvailableMonths(games), [games]);
  const displayStandings = useMemo(
    () => applyStandingsFilter({ filter, league: 'chl', standings, games }),
    [filter, standings, games],
  );

  if (loading) {
    return (
      <main className="relative py-6 md:py-8">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
            CHL · Tabell
          </h1>
          <div className="animate-pulse">
            <div className="h-96 bg-surface rounded-lg"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !standings) {
    return (
      <main className="relative py-6 md:py-8">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
            CHL · Tabell
          </h1>
          <div className="text-center">
            <div className="text-loss text-6xl mb-4">⚠️</div>
            <h2 className="display text-3xl font-bold uppercase tracking-[0.02em] text-ink mb-4">
              {error || 'Standings Not Available'}
            </h2>
            <p className="text-dim mb-6">
              {error || 'Could not load standings at this time'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative py-6 md:py-8">
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
          CHL · Tabell
        </h1>

        <div className="max-w-6xl mx-auto">
          <Tabs
            tabs={[
              {
                id: 'table',
                label: 'Tabell',
                content: (
                  <>
                    <StandingsFilterBar
                      filter={filter}
                      onChange={setFilter}
                      months={months}
                    />
                    {displayStandings && (
                      <FullStandings
                        standings={displayStandings}
                        league="chl"
                        filter={filter}
                      />
                    )}
                  </>
                ),
              },
              {
                id: 'trend',
                label: 'Trend',
                content: <TrendTable league="chl" games={games} />,
              },
              {
                id: 'matches',
                label: 'Matcher',
                content: <MatchesTable league="chl" games={games} />,
              },
            ]}
            defaultTab="table"
            variant="dark"
          />
        </div>
      </div>
    </main>
  );
}

export default function CHLStandingsPage() {
  return (
    <Suspense
      fallback={
        <main className="relative py-6 md:py-8">
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
              CHL · Tabell
            </h1>
            <div className="animate-pulse">
              <div className="h-96 bg-surface rounded-lg"></div>
            </div>
          </div>
        </main>
      }
    >
      <CHLStandingsContent />
    </Suspense>
  );
}
