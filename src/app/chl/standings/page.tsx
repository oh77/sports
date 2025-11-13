'use client';

import { Suspense, useEffect, useState } from 'react';
import { FullStandings } from '../../components/standings/full-standings';
import { MatchesTable } from '../../components/standings/matches-table';
import { StandingsHeader } from '../../components/standings/standings-header';
import { TrendTable } from '../../components/standings/trend-table';
import { Tabs } from '../../components/tabs';
import type { GameInfo, LeagueResponse } from '../../types/domain/game';
import type { StandingsData } from '../../types/domain/standings';

export default function CHLStandingsPage() {
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStandings = async () => {
      try {
        setLoading(true);
        const [standingsResponse, gamesResponse] = await Promise.all([
          fetch('/api/chl-standings'),
          fetch('/api/chl-games?type=all-recent'),
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
  }, []);

  if (loading) {
    return (
      <main
        className="min-h-screen py-12 relative"
        style={{ backgroundColor: '#20001c' }}
      >
        {/* Background CHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <div className="w-96 h-96 bg-white rounded-full opacity-10 transform rotate-12"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <StandingsHeader
            league="chl"
            leagueName="CHL"
            logoUrl="https://www.chl.hockey/static/img/logo.png"
            backgroundColor="#20001c"
            backPath="/chl"
          />

          <div className="animate-pulse">
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !standings) {
    return (
      <main
        className="min-h-screen py-12 relative"
        style={{ backgroundColor: '#20001c' }}
      >
        {/* Background CHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <div className="w-96 h-96 bg-white rounded-full opacity-10 transform rotate-12"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <StandingsHeader
            league="chl"
            leagueName="CHL"
            logoUrl="https://www.chl.hockey/static/img/logo.png"
            backgroundColor="#20001c"
            backPath="/chl"
          />

          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {error || 'Standings Not Available'}
            </h2>
            <p className="text-gray-200 mb-6">
              {error || 'Could not load standings at this time'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen py-12 relative"
      style={{ backgroundColor: '#20001c' }}
    >
      {/* Background CHL Logo */}
      <div className="fixed top-0 right-0 z-0">
        <div className="w-96 h-96 bg-white rounded-full opacity-10 transform rotate-12"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <StandingsHeader
          league="chl"
          leagueName="CHL"
          logoUrl="https://www.chl.hockey/static/img/logo.png"
          backgroundColor="#20001c"
          backPath="/chl"
        />

        <div className="max-w-6xl mx-auto">
          <Suspense
            fallback={
              <div className="animate-pulse h-96 bg-gray-700 rounded"></div>
            }
          >
            <Tabs
              tabs={[
                {
                  id: 'table',
                  label: 'Tabell',
                  content: <FullStandings standings={standings} league="chl" />,
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
          </Suspense>
        </div>
      </div>
    </main>
  );
}
