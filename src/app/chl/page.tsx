'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GameInfo } from '../types/domain/game';
import { CHLGame } from '../types/chl/game';
import { translateCHLGameToDomain } from '../utils/translators/chlToDomain';
import { GameGroup } from '../components/game-group';

export default function CHLPage() {
  const [todaysGames, setTodaysGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameDate, setGameDate] = useState<string>('');

  useEffect(() => {
    const fetchNextGameDay = async () => {
      try {
        // First try to get upcoming games to find the next available date
        const upcomingResponse = await fetch('/api/chl-games?type=upcoming');
        if (!upcomingResponse.ok) {
          throw new Error('Failed to fetch upcoming games');
        }
        const upcomingData = await upcomingResponse.json();

        if (upcomingData.games && upcomingData.games.length > 0) {
          // Translate CHL games to domain models
          const chlGames: CHLGame[] = upcomingData.games;
          const domainGames = chlGames.map(translateCHLGameToDomain);
          
          // Get the date of the first upcoming game
          const firstUpcomingGame = domainGames[0];
          const nextGameDate = new Date(firstUpcomingGame.startDateTime);
          const nextGameDateString = nextGameDate.toISOString().split('T')[0];

          // Check if the next game date is today
          const today = new Date().toISOString().split('T')[0];
          const targetDate = nextGameDateString === today ? today : nextGameDateString;

          // Fetch games for the target date
          const dateResponse = await fetch(`/api/chl-games?type=date&date=${targetDate}`);
          if (!dateResponse.ok) {
            throw new Error('Failed to fetch games for date');
          }
          const dateData = await dateResponse.json();

          if (dateData.games && dateData.games.length > 0) {
            // Translate CHL games to domain models
            const dateChlGames: CHLGame[] = dateData.games;
            const dateDomainGames = dateChlGames.map(translateCHLGameToDomain);
            setTodaysGames(dateDomainGames);
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

      <div className="relative z-10">
        {/* Header with Logo */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 py-8">
          <Image
            src="https://www.chl.hockey/static/img/logo.png"
            alt="CHL Logo"
            width={96}
            height={96}
            className="w-16 h-16 md:w-20 md:h-20 object-contain"
          />
          <div className="text-center">
            <h1 className="text-white text-3xl md:text-5xl font-bold uppercase tracking-wider mb-2">
              MATCHDAG
            </h1>
            <p className="text-white text-xl md:text-2xl">
              {gameDate || 'Inga Matcher Tillgängliga'}
            </p>
          </div>
        </div>

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
      </div>
    </div>
  );
}
