'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CHLGame } from '../types/chl';
import { getTeamLogoWithFallback } from '../utils/teamLogos';

export default function CHLPage() {
  const [upcomingGames, setUpcomingGames] = useState<CHLGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingGames = async () => {
      try {
        const response = await fetch('/api/chl-games?type=upcoming');
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        setUpcomingGames(data.games);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingGames();
  }, []);

  const formatGameTime = (startDate: string) => {
    const date = new Date(startDate);
    return date.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getNextGameDay = () => {
    if (upcomingGames.length === 0) return null;
    const nextGame = upcomingGames[0];
    const gameDate = new Date(nextGame.startDate);
    return gameDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate team code from team short name for URL routing
  const generateTeamCode = (teamShortName: string): string => {
    return teamShortName.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#20001c' }}>
        <div className="text-white text-xl">Loading CHL games...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#20001c' }}>
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#20001c' }}>
      {/* Background CHL Logo */}
      <div className="fixed top-0 right-0 z-0">
        <img 
          src="https://www.chl.hockey/static/img/logo.png" 
          alt="CHL Background"
          width={400}
          height={400}
          className="opacity-10 transform rotate-12"
        />
      </div>

      <div className="relative z-10">
        {/* Header with Logo */}
        <div className="flex flex-col items-center py-8">
          <img 
            src="https://www.chl.hockey/static/img/logo.png" 
            alt="CHL Logo" 
            className="h-24 w-auto mb-4"
          />
          <h1 className="text-white text-5xl font-bold uppercase tracking-wider mb-2">
            MATCHDAG
          </h1>
          <p className="text-white text-2xl">
            {upcomingGames.length > 0 ? getNextGameDay() : 'Inga Matcher Tillgängliga'}
          </p>
        </div>

        {/* Games List */}
        {upcomingGames.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-4">
            {upcomingGames.map((game) => (
              <div 
                key={game.id} 
                className="rounded-lg shadow-lg p-6"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              >
                <div className="text-center mb-4">
                  <p className="text-xl font-medium text-gray-800">
                    {formatGameTime(game.startDate)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="text-center flex-1">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <Image
                        src={getTeamLogoWithFallback({ 
                          shortName: game.homeTeam.shortName, 
                          externalId: game.homeTeam.externalId,
                          country: game.homeTeam.country ? { code: game.homeTeam.country } : undefined 
                        })}
                        alt={`${game.homeTeam.name} logo`}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <Link 
                      href={`/chl/${generateTeamCode(game.homeTeam.shortName)}`}
                      className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {game.homeTeam.name}
                    </Link>
                  </div>
                  
                  {/* Venue */}
                  <div className="text-center mx-6">
                    <Image 
                      src="https://www.shl.se/assets/stadium-460843bd.svg"
                      alt="Arena"
                      width={40}
                      height={40}
                      className="mx-auto mb-2 brightness-0"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {game.venue}
                    </p>
                  </div>
                  
                  {/* Away Team */}
                  <div className="text-center flex-1">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <Image
                        src={getTeamLogoWithFallback({ 
                          shortName: game.awayTeam.shortName, 
                          externalId: game.awayTeam.externalId,
                          country: game.awayTeam.country ? { code: game.awayTeam.country } : undefined 
                        })}
                        alt={`${game.awayTeam.name} logo`}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <Link 
                      href={`/chl/${generateTeamCode(game.awayTeam.shortName)}`}
                      className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {game.awayTeam.name}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Games Message */}
        {upcomingGames.length === 0 && (
          <div className="px-6">
            <div className="text-center text-white text-xl">
              No upcoming games scheduled
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
