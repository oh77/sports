'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import type { StandingsFilter } from '@/app/types/domain/standingsFilter';
import { FullStandings } from '../../components/standings/full-standings';
import { StandingsHeader } from '../../components/standings/standings-header';
import {
  calculateStandingsForMonth,
  calculateStandingsFromGames,
  calculateStandingsFromLastNGames,
  formatMonthLabel,
  formatMonthShortLabel,
  getAvailableMonths,
} from '../../components/standings/standingsUtils';
import type { GameInfo } from '../../types/domain/game';
import type { StandingsData } from '../../types/domain/standings';
import type { StatnetLeagueResponse } from '../../types/statnet/game';
import { translateStatnetGameToDomain } from '../../utils/translators/statnetToDomain';

function SHLStandingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
          fetch('/api/shl-standings'),
          fetch('/api/shl-games'),
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
  }, []);

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
          <StandingsHeader
            league="shl"
            leagueName="SHL Ligatabell"
            logoUrl="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
            backPath="/shl"
          />

          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || (!standings && filter === 'season')) {
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
          <StandingsHeader
            league="shl"
            leagueName="SHL Ligatabell"
            logoUrl="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
            backPath="/shl"
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
        <StandingsHeader
          league="shl"
          leagueName="SHL Ligatabell"
          logoUrl="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
          backPath="/shl"
        />

        {/* Filter Selector */}
        <div className="max-w-6xl mx-auto mb-4">
          {/* Mobile: Dropdown */}
          <select
            value={filter}
            onChange={(e) => {
              const newFilter = e.target.value as StandingsFilter;
              setFilter(newFilter);
              // Update URL query string
              const params = new URLSearchParams(searchParams.toString());
              if (newFilter === 'season') {
                params.delete('filter');
              } else {
                params.set('filter', newFilter);
              }
              router.push(`/shl/standings?${params.toString()}`, {
                scroll: false,
              });
            }}
            className="md:hidden px-4 py-2 w-full border border-gray-300 rounded-lg bg-white text-gray-900 font-medium cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                const params = new URLSearchParams(searchParams.toString());
                params.delete('filter');
                router.push(`/shl/standings?${params.toString()}`, {
                  scroll: false,
                });
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'season'
                  ? 'bg-blue-400 text-white'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              TABELL
            </button>

            {/* Home/Away */}
            <button
              type="button"
              onClick={() => {
                setFilter('home');
                const params = new URLSearchParams(searchParams.toString());
                params.set('filter', 'home');
                router.push(`/shl/standings?${params.toString()}`, {
                  scroll: false,
                });
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'home'
                  ? 'bg-green-400 text-white'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              H
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter('away');
                const params = new URLSearchParams(searchParams.toString());
                params.set('filter', 'away');
                router.push(`/shl/standings?${params.toString()}`, {
                  scroll: false,
                });
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'away'
                  ? 'bg-green-400 text-white'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              B
            </button>

            {/* Last games */}
            <button
              type="button"
              onClick={() => {
                setFilter('last5');
                const params = new URLSearchParams(searchParams.toString());
                params.set('filter', 'last5');
                router.push(`/shl/standings?${params.toString()}`, {
                  scroll: false,
                });
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'last5'
                  ? 'bg-purple-400 text-white'
                  : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              5
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter('last10');
                const params = new URLSearchParams(searchParams.toString());
                params.set('filter', 'last10');
                router.push(`/shl/standings?${params.toString()}`, {
                  scroll: false,
                });
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'last10'
                  ? 'bg-purple-400 text-white'
                  : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              10
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter('last15');
                const params = new URLSearchParams(searchParams.toString());
                params.set('filter', 'last15');
                router.push(`/shl/standings?${params.toString()}`, {
                  scroll: false,
                });
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'last15'
                  ? 'bg-purple-400 text-white'
                  : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
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
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('filter', monthKey);
                  router.push(`/shl/standings?${params.toString()}`, {
                    scroll: false,
                  });
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === monthKey
                    ? 'bg-orange-400 text-white'
                    : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
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
            league="shl"
            filter={filter}
          />
        )}
      </div>
    </main>
  );
}

export default function SHLStandingsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 py-12 relative">
          <div className="container mx-auto px-4 relative z-10">
            <StandingsHeader
              league="shl"
              leagueName="SHL Ligatabell"
              logoUrl="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
              backPath="/shl"
            />
            <div className="animate-pulse">
              <div className="h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </main>
      }
    >
      <SHLStandingsContent />
    </Suspense>
  );
}
