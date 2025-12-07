'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GameGroup } from '../components/game-group';
import LeagueFooter from '../components/league-footer';
import { LeagueHeader } from '../components/league-header';
import { PreviousGameDays } from '../components/previous-game-days';
import { StatnetService } from '../services/statnetService';
import type { GameInfo } from '../types/domain/game';

interface PreviousGameDayData {
  date: string;
  games: GameInfo[];
}

export default function SHLPage() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [previousGameDays, setPreviousGameDays] = useState<
    PreviousGameDayData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameDate, setGameDate] = useState<string>('');

  useEffect(() => {
    const loadNextGameDay = async () => {
      try {
        setLoading(true);
        const leagueService = new StatnetService('shl');

        // Fetch games from API (cached server-side)
        const games = await leagueService.fetchGames();

        if (games.length > 0) {
          const today = new Date();
          const todayString = today.toDateString();

          // Check if there are any games today (regardless of whether they've started)
          const todaysGames = games.filter((game) => {
            const gameDate = new Date(game.startDateTime);
            return gameDate.toDateString() === todayString;
          });

          let targetDateString: string;
          let targetGames: GameInfo[];

          if (todaysGames.length > 0) {
            // Show all games from today, including started ones
            targetDateString = todayString;
            targetGames = todaysGames;
          } else {
            // No games today, find the next upcoming game date
            const now = new Date();
            const futureGames = games.filter(
              (game) => new Date(game.startDateTime) >= now,
            );

            if (futureGames.length > 0) {
              const firstGameDate = new Date(futureGames[0].startDateTime);
              targetDateString = firstGameDate.toDateString();

              // Get all games for the target date
              targetGames = games.filter((game) => {
                const gameDate = new Date(game.startDateTime);
                return gameDate.toDateString() === targetDateString;
              });
            } else {
              setError('Inga kommande matcher hittades');
              return;
            }
          }

          if (targetGames.length > 0) {
            setGames(targetGames);
            const displayDate = new Date(targetGames[0].startDateTime);
            setGameDate(
              displayDate.toLocaleDateString('sv-SE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            );

            // Find two previous game days
            const targetDate = new Date(targetGames[0].startDateTime);
            const finishedGames = games.filter(
              (game) => game.state === 'finished',
            );

            // Get unique game dates before target date
            const gameDates = new Set<string>();
            finishedGames.forEach((game) => {
              const gameDate = new Date(game.startDateTime);
              if (gameDate < targetDate) {
                gameDates.add(gameDate.toDateString());
              }
            });

            // Sort dates descending and take the two most recent
            const sortedDates = Array.from(gameDates)
              .map((dateStr) => new Date(dateStr))
              .sort((a, b) => b.getTime() - a.getTime())
              .slice(0, 2);

            // Group games by date for previous game days
            const previousDays: PreviousGameDayData[] = sortedDates.map(
              (date) => {
                const dateString = date.toDateString();
                const dayGames = finishedGames.filter((game) => {
                  const gameDate = new Date(game.startDateTime);
                  return gameDate.toDateString() === dateString;
                });

                return {
                  date: date.toLocaleDateString('sv-SE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  games: dayGames,
                };
              },
            );

            setPreviousGameDays(previousDays);
          } else {
            setError('Inga matcher hittades');
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
      hour12: false,
    });
  };

  // Group games by time
  const groupGamesByTime = (games: GameInfo[]) => {
    const grouped = games.reduce(
      (acc, game) => {
        const time = formatGameTime(game.startDateTime);
        if (!acc[time]) {
          acc[time] = [];
        }
        acc[time].push(game);
        return acc;
      },
      {} as Record<string, GameInfo[]>,
    );

    // Sort times
    const sortedTimes = Object.keys(grouped).sort((a, b) => {
      const [aHour, aMin] = a.split(':').map(Number);
      const [bHour, bMin] = b.split(':').map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    });

    return sortedTimes.map((time) => ({
      time,
      games: grouped[time],
    }));
  };

  if (loading) {
    return (
      <main className="min-h-screen py-12 relative bg-[rgba(24,29,38,1)]">
        {/* Background SHL Logo */}
        <div className="fixed top-0 right-0 z-0" aria-hidden="true">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
            alt=""
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
            role="presentation"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header Row */}
          <div
            className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 py-6 rounded-lg"
            style={{ backgroundColor: 'rgba(24,29,38,1)' }}
          >
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
      <main className="min-h-screen py-12 relative bg-[rgba(24,29,38,1)]">
        {/* Background SHL Logo */}
        <div className="fixed top-0 right-0 z-0" aria-hidden="true">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
            alt=""
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
            role="presentation"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <LeagueHeader
            league="shl"
            gameDate=""
            logoUrl="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
            standingsPath="/shl/standings"
          />

          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {error || 'Inga Matcher Hittades'}
            </h2>
            <p className="text-gray-200 mb-6">
              {error || 'Inga kommande matcher tillgängliga just nu'}
            </p>
            <Link
              href="/"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
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
      {/* Sticky Background SHL Logo */}
      <div className="fixed top-0 right-0 z-0" aria-hidden="true">
        <Image
          src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
          alt=""
          width={400}
          height={400}
          className="opacity-10 transform rotate-12"
          role="presentation"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <LeagueHeader
          league="shl"
          gameDate=""
          logoUrl="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
          standingsPath="/shl/standings"
        />

        <div className="max-w-4xl mx-auto">
          {/* Previous Game Days */}
          {previousGameDays.length > 0 && (
            <PreviousGameDays
              previousGameDays={previousGameDays}
              league="shl"
            />
          )}

          {/* Current Game Day Date Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
              {gameDate}
            </h1>
          </div>

          {/* Current Game Day */}
          {groupGamesByTime(games).map((group) => (
            <GameGroup
              key={group.time}
              time={group.time}
              games={group.games}
              league="shl"
            />
          ))}
        </div>

        <LeagueFooter league="shl" />
      </div>
    </main>
  );
}
