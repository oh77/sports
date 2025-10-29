'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GameInfo, LeagueResponse } from '../types/domain/game';
import { GameGroup } from '../components/game-group';
import { LeagueHeader } from '../components/league-header';
import LeagueFooter from '../components/league-footer';

export default function CHLPage() {
  const [todaysGames, setTodaysGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameDate, setGameDate] = useState<string>('');

  useEffect(() => {
    const fetchNextGameDay = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // First check if there are any games today (including started ones)
        const todayResponse = await fetch(`/api/chl-games?type=date&date=${today}`);
        if (!todayResponse.ok) {
          throw new Error('Failed to fetch today\'s games');
        }
        const todayData: LeagueResponse = await todayResponse.json();

        if (todayData.gameInfo && todayData.gameInfo.length > 0) {
          // Show all games from today, including started ones
          setTodaysGames(todayData.gameInfo);
          const displayDate = new Date(todayData.gameInfo[0].startDateTime);
          setGameDate(displayDate.toLocaleDateString('sv-SE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
        } else {
          // No games today, find the next upcoming game date
          const upcomingResponse = await fetch('/api/chl-games?type=upcoming');
          if (!upcomingResponse.ok) {
            throw new Error('Failed to fetch upcoming games');
          }
          const upcomingData = await upcomingResponse.json();

          if (upcomingData.gameInfo && upcomingData.gameInfo.length > 0) {
            // Get the date of the first upcoming game
            const firstUpcomingGame = upcomingData.gameInfo[0];
            const nextGameDate = new Date(firstUpcomingGame.startDateTime);
            const nextGameDateString = nextGameDate.toISOString().split('T')[0];

            // Fetch games for the target date
            const dateResponse = await fetch(`/api/chl-games?type=date&date=${nextGameDateString}`);
            if (!dateResponse.ok) {
              throw new Error('Failed to fetch games for date');
            }
            const dateData: LeagueResponse = await dateResponse.json();

            if (dateData.gameInfo && dateData.gameInfo.length > 0) {
              setTodaysGames(dateData.gameInfo);
              setGameDate(nextGameDate.toLocaleDateString('sv-SE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }));
            } else {
              setTodaysGames([]);
            }
          } else {
            setTodaysGames([]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNextGameDay();
  }, []);

  const formatGameTime = (startDate: string) => {
    const date = new Date(startDate);
    return date.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Group games by time
  const groupGamesByTime = (games: GameInfo[]) => {
    const grouped = games.reduce((acc, game) => {
      const time = formatGameTime(game.startDateTime);
      if (!acc[time]) {
        acc[time] = [];
      }
      acc[time].push(game);
      return acc;
    }, {} as Record<string, GameInfo[]>);

    // Sort times
    const sortedTimes = Object.keys(grouped).sort((a, b) => {
      const [aHour, aMin] = a.split(':').map(Number);
      const [bHour, bMin] = b.split(':').map(Number);
      return (aHour * 60 + aMin) - (bHour * 60 + bMin);
    });

    return sortedTimes.map(time => ({
      time,
      games: grouped[time]
    }));
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
        <Image
          src="https://www.chl.hockey/static/img/logo.png"
          alt="CHL Background"
          width={400}
          height={400}
          className="opacity-10 transform rotate-12"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <LeagueHeader
          league="chl"
          gameDate={gameDate || 'Inga Matcher Tillgängliga'}
          logoUrl="https://www.chl.hockey/static/img/logo.png"
          backgroundColor="#20001c"
          standingsPath="/chl/standings"
        />

        {/* Games List */}
        {todaysGames.length > 0 && (
          <div className="max-w-4xl mx-auto">
            {groupGamesByTime(todaysGames).map((group) => (
              <GameGroup
                key={group.time}
                time={group.time}
                games={group.games}
                league="chl"
              />
            ))}
          </div>
        )}

        {/* No Games Message */}
        {todaysGames.length === 0 && (
          <div className="px-6">
            <div className="text-center text-white text-xl">
              Inga matcher idag
            </div>
          </div>
        )}

        <LeagueFooter league="chl" />
      </div>
    </div>
  );
}
