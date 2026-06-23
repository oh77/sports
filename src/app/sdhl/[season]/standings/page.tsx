'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import type { StandingsFilter } from '@/app/types/domain/standingsFilter';
import { FullStandings } from '../../../components/standings/full-standings';
import { GoalDistributionTable } from '../../../components/standings/goal-distribution-table';
import { MatchesTable } from '../../../components/standings/matches-table';
import {
  calculateStandingsForMonth,
  calculateStandingsFromGames,
  calculateStandingsFromLastNGames,
  formatMonthLabel,
  formatMonthShortLabel,
  getAvailableMonths,
} from '../../../components/standings/standingsUtils';
import { TrendTable } from '../../../components/standings/trend-table';
import { UpcomingGamesTable } from '../../../components/standings/upcoming-games-table';
import { Tabs } from '../../../components/tabs';
import type { GameInfo } from '../../../types/domain/game';
import type { StandingsData } from '../../../types/domain/standings';
import type { StatnetLeagueResponse } from '../../../types/statnet/game';
import { withSeason } from '../../../utils/leaguePaths';
import { translateStatnetGameToDomain } from '../../../utils/translators/statnetToDomain';
import { useSeason } from '../../../utils/useSeason';

function SDHLStandingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const season = useSeason();
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filter from URL query string, default to 'season'
  const filterFromUrl = (searchParams.get('filter') ||
    'season') as StandingsFilter;
  const [filter, setFilter] = useState<StandingsFilter>(filterFromUrl);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [standingsResponse, gamesResponse] = await Promise.all([
          fetch(withSeason('/api/sdhl-standings', season)),
          fetch(withSeason('/api/sdhl-games', season)),
        ]);

        if (!standingsResponse.ok) {
          throw new Error(`HTTP error! status: ${standingsResponse.status}`);
        }

        const standingsData = await standingsResponse.json();
        setStandings(standingsData);

        if (gamesResponse.ok) {
          const gamesData: StatnetLeagueResponse = await gamesResponse.json();
          const translatedGames = (gamesData.gameInfo || []).map(
            translateStatnetGameToDomain,
          );
          setGames(translatedGames);
        }
      } catch (err) {
        setError('Misslyckades att ladda ligatabellen');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [season]);

  // Update filter when URL changes
  useEffect(() => {
    const urlFilter = (searchParams.get('filter') ||
      'season') as StandingsFilter;
    if (urlFilter !== filter) {
      setFilter(urlFilter);
    }
  }, [searchParams, filter]);

  // Get available months from games
  const availableMonths = useMemo(() => {
    if (games.length === 0) return [];
    return getAvailableMonths(games);
  }, [games]);

  // Calculate standings from games when filter is not season
  const calculatedStandings = useMemo(() => {
    if (filter === 'season' || games.length === 0) {
      return standings;
    }
    if (filter === 'home' || filter === 'away') {
      return calculateStandingsFromGames(games, filter);
    }
    if (filter === 'last5' || filter === 'last10' || filter === 'last15') {
      // For last5, last10, last15
      const gameCount = filter === 'last5' ? 5 : filter === 'last10' ? 10 : 15;
      return calculateStandingsFromLastNGames(games, gameCount);
    }
    // For month filters (format: "month01", "month02", etc.)
    if (filter.startsWith('month') && availableMonths.includes(filter)) {
      return calculateStandingsForMonth(games, filter);
    }
    return standings;
  }, [filter, games, standings, availableMonths]);

  const displayStandings = calculatedStandings;

  if (loading) {
    return (
      <main className="relative py-6 md:py-8">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
            SDHL · Tabell
          </h1>
          <div className="animate-pulse">
            <div className="h-96 bg-surface rounded-lg"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || (!standings && filter === 'season')) {
    return (
      <main className="relative py-6 md:py-8">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
            SDHL · Tabell
          </h1>
          <div className="text-center">
            <div className="text-loss text-6xl mb-4">⚠️</div>
            <h2 className="display text-3xl font-bold uppercase tracking-[0.02em] text-ink mb-4">
              {error || 'Ligatabell Inte Tillgänglig'}
            </h2>
            <p className="text-dim mb-6">
              {error || 'Kunde inte ladda ligatabell just nu'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative py-6 md:py-8">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
            SDHL · Tabell
          </h1>
          <Tabs
            tabs={[
              {
                id: 'table',
                label: 'Tabell',
                content: (
                  <>
                    {/* Filter Selector */}
                    <div className="mb-4">
                      {/* Mobile: Dropdown */}
                      <select
                        value={filter}
                        onChange={(e) => {
                          const newFilter = e.target.value as StandingsFilter;
                          setFilter(newFilter);
                          // Update URL query string
                          const params = new URLSearchParams(
                            searchParams.toString(),
                          );
                          if (newFilter === 'season') {
                            params.delete('filter');
                          } else {
                            params.set('filter', newFilter);
                          }
                          router.push(
                            `/sdhl/${season}/standings?${params.toString()}`,
                            {
                              scroll: false,
                            },
                          );
                        }}
                        className="md:hidden px-4 py-2 w-full border border-line rounded-lg bg-surface text-ink font-medium cursor-pointer hover:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      >
                        <option value="season">Säsong</option>
                        <option disabled>Hemma/Borta</option>
                        <option value="home">Hemma</option>
                        <option value="away">Borta</option>
                        <option disabled>Senaste matcher</option>
                        <option value="last5">Senaste 5</option>
                        <option value="last10">Senaste 10</option>
                        <option value="last15">Senaste 15</option>
                        <option disabled>Månader</option>
                        {availableMonths.map((monthKey) => (
                          <option key={monthKey} value={monthKey}>
                            {formatMonthLabel(monthKey)}
                          </option>
                        ))}
                      </select>

                      {/* Desktop: Buttons */}
                      <div className="hidden md:flex flex-wrap gap-2">
                        {/* Season */}
                        <button
                          type="button"
                          onClick={() => {
                            setFilter('season');
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );
                            params.delete('filter');
                            router.push(
                              `/sdhl/${season}/standings?${params.toString()}`,
                              {
                                scroll: false,
                              },
                            );
                          }}
                          className={`display px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-[0.04em] transition-colors ${
                            filter === 'season'
                              ? 'bg-accent text-white'
                              : 'bg-surface-3 text-dim border border-line hover:text-ink'
                          }`}
                        >
                          TABELL
                        </button>

                        {/* Home/Away */}
                        <button
                          type="button"
                          onClick={() => {
                            setFilter('home');
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );
                            params.set('filter', 'home');
                            router.push(
                              `/sdhl/${season}/standings?${params.toString()}`,
                              {
                                scroll: false,
                              },
                            );
                          }}
                          className={`display px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-[0.04em] transition-colors ${
                            filter === 'home'
                              ? 'bg-accent text-white'
                              : 'bg-surface-3 text-dim border border-line hover:text-ink'
                          }`}
                        >
                          H
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFilter('away');
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );
                            params.set('filter', 'away');
                            router.push(
                              `/sdhl/${season}/standings?${params.toString()}`,
                              {
                                scroll: false,
                              },
                            );
                          }}
                          className={`display px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-[0.04em] transition-colors ${
                            filter === 'away'
                              ? 'bg-accent text-white'
                              : 'bg-surface-3 text-dim border border-line hover:text-ink'
                          }`}
                        >
                          B
                        </button>

                        {/* Last games */}
                        <button
                          type="button"
                          onClick={() => {
                            setFilter('last5');
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );
                            params.set('filter', 'last5');
                            router.push(
                              `/sdhl/${season}/standings?${params.toString()}`,
                              {
                                scroll: false,
                              },
                            );
                          }}
                          className={`display px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-[0.04em] transition-colors ${
                            filter === 'last5'
                              ? 'bg-accent text-white'
                              : 'bg-surface-3 text-dim border border-line hover:text-ink'
                          }`}
                        >
                          5
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFilter('last10');
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );
                            params.set('filter', 'last10');
                            router.push(
                              `/sdhl/${season}/standings?${params.toString()}`,
                              {
                                scroll: false,
                              },
                            );
                          }}
                          className={`display px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-[0.04em] transition-colors ${
                            filter === 'last10'
                              ? 'bg-accent text-white'
                              : 'bg-surface-3 text-dim border border-line hover:text-ink'
                          }`}
                        >
                          10
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFilter('last15');
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );
                            params.set('filter', 'last15');
                            router.push(
                              `/sdhl/${season}/standings?${params.toString()}`,
                              {
                                scroll: false,
                              },
                            );
                          }}
                          className={`display px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-[0.04em] transition-colors ${
                            filter === 'last15'
                              ? 'bg-accent text-white'
                              : 'bg-surface-3 text-dim border border-line hover:text-ink'
                          }`}
                        >
                          15
                        </button>

                        {/* Months */}
                        {availableMonths.map((monthKey) => (
                          <button
                            key={monthKey}
                            type="button"
                            onClick={() => {
                              setFilter(monthKey as StandingsFilter);
                              const params = new URLSearchParams(
                                searchParams.toString(),
                              );
                              params.set('filter', monthKey);
                              router.push(
                                `/sdhl/${season}/standings?${params.toString()}`,
                                {
                                  scroll: false,
                                },
                              );
                            }}
                            className={`display px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-[0.04em] transition-colors ${
                              filter === monthKey
                                ? 'bg-accent text-white'
                                : 'bg-surface-3 text-dim border border-line hover:text-ink'
                            }`}
                          >
                            {formatMonthShortLabel(monthKey)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {displayStandings && (
                      <FullStandings
                        standings={displayStandings}
                        league="sdhl"
                        filter={filter}
                      />
                    )}
                  </>
                ),
              },
              {
                id: 'trend',
                label: 'Trend',
                content: <TrendTable league="sdhl" games={games} />,
              },
              {
                id: 'matches',
                label: 'Matcher',
                content: <MatchesTable league="sdhl" games={games} />,
              },
              {
                id: 'results',
                label: 'Resultat',
                content: <GoalDistributionTable league="sdhl" games={games} />,
              },
              {
                id: 'upcoming',
                label: 'Kommande',
                content: <UpcomingGamesTable league="sdhl" games={games} />,
              },
            ]}
            defaultTab="table"
            queryParam="tab"
          />
        </div>
      </div>
    </main>
  );
}

export default function SDHLStandingsPage() {
  return (
    <Suspense
      fallback={
        <main className="relative py-6 md:py-8">
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
              SDHL · Tabell
            </h1>
            <div className="animate-pulse">
              <div className="h-96 bg-surface rounded-lg"></div>
            </div>
          </div>
        </main>
      }
    >
      <SDHLStandingsContent />
    </Suspense>
  );
}
