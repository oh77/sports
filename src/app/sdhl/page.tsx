'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StatnetService } from '../services/statnetService';
import { GameInfo } from '../types/domain/game';
import { GameGroup } from '../components/game-group';
import { LeagueHeader } from '../components/league-header';
import { LeagueFooter } from '../components/league-footer';

export default function SDHLPage() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameDate, setGameDate] = useState<string>('');

  useEffect(() => {
    const loadNextGameDay = async () => {
      try {
        setLoading(true);
        const leagueService = new StatnetService('sdhl');

        // Fetch games from API (cached server-side)
        const games = await leagueService.fetchGames();

        if (games.length > 0) {
          const now = new Date();
          const today = new Date();
          const todayString = today.toDateString();

          // Find the next available game date
          const futureGames = games.filter(game => new Date(game.startDateTime) >= now);

          if (futureGames.length > 0) {
            // Get the first future game date
            const firstGameDate = new Date(futureGames[0].startDateTime);
            const firstGameDateString = firstGameDate.toDateString();

            // Check if the next game date is today
            const targetDateString = firstGameDateString === todayString ? todayString : firstGameDateString;

            // Get all games for the target date
            const targetGames = games.filter(game => {
              const gameDate = new Date(game.startDateTime);
              return gameDate.toDateString() === targetDateString;
            });

            if (targetGames.length > 0) {
              setGames(targetGames);
              setGameDate(firstGameDate.toLocaleDateString('sv-SE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }));
            } else {
              setError('Inga matcher hittades');
            }
          } else {
            setError('Inga kommande matcher hittades');
          }
        } else {
          setError('Ingen matchdata tillgänglig');
        }
      } catch (err) {
        setError('Misslyckades att ladda matchdata');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNextGameDay();
  }, []);

  const formatGameTime = (startDateTime: string) => {
    const date = new Date(startDateTime);
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
      <main className="min-h-screen bg-gray-100 py-12 relative">
        {/* Sticky Background SDHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
            alt="SDHL Background"
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header Row */}
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded animate-pulse"></div>
            <div className="text-center">
              <div className="h-8 md:h-12 bg-gray-300 rounded mb-2 w-48 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          <div className="animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || games.length === 0) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 relative">
        {/* Sticky Background SDHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
            alt="SDHL Background"
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <LeagueHeader
            league="sdhl"
            gameDate={gameDate || 'Inga Matcher Tillgängliga'}
            logoUrl="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
            standingsPath="/sdhl/standings"
          />

          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {error || 'Inga Matcher Hittades'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Inga kommande matcher tillgängliga just nu'}
            </p>
            <Link
              href="/"
              className="bg-blue-500 hover:bg-blue-600 text-gray-800 px-6 py-3 rounded-lg transition-colors"
            >
              Tillbaka till Hem
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 relative">
      {/* Sticky Background SDHL Logo */}
      <div className="fixed top-0 right-0 z-0">
        <Image
          src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
          alt="SDHL Background"
          width={400}
          height={400}
          className="opacity-10 transform rotate-12"
        />
      </div>

        <div className="container mx-auto px-4 relative z-10">
          <LeagueHeader
            league="sdhl"
            gameDate={gameDate}
            logoUrl="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
            standingsPath="/sdhl/standings"
          />

        <div className="max-w-4xl mx-auto">
          {groupGamesByTime(games).map((group) => (
            <GameGroup
              key={group.time}
              time={group.time}
              games={group.games}
              league="sdhl"
            />
          ))}
        </div>

        <LeagueFooter league="sdhl" />
      </div>
    </main>
  );
}
