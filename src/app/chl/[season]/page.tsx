'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { GameGroup } from '../../components/game-group';
import LeagueFooter from '../../components/league-footer';
import { LeagueHeader } from '../../components/league-header';
import { PreviousGameDays } from '../../components/previous-game-days';
import { SeasonChampion } from '../../components/season-champion';
import type { GameInfo, LeagueResponse } from '../../types/domain/game';
import type { TeamInfo } from '../../types/domain/team';
import { standingsPath, withSeason } from '../../utils/leaguePaths';
import {
  buildPreviousGameDays,
  type GameDayGroup,
  getGameWinner,
  getLastFinishedGame,
} from '../../utils/seasonEnd';
import { useSeason } from '../../utils/useSeason';

export default function CHLPage() {
  const season = useSeason();
  const [todaysGames, setTodaysGames] = useState<GameInfo[]>([]);
  const [previousGameDays, setPreviousGameDays] = useState<GameDayGroup[]>([]);
  const [champion, setChampion] = useState<{
    team: TeamInfo;
    game: GameInfo;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameDate, setGameDate] = useState<string>('');

  useEffect(() => {
    const fetchNextGameDay = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // First check if there are any games today (including started ones)
        const todayResponse = await fetch(
          withSeason(`/api/chl-games?type=date&date=${today}`, season),
        );
        if (!todayResponse.ok) {
          throw new Error("Failed to fetch today's games");
        }
        const todayData: LeagueResponse = await todayResponse.json();

        if (todayData.gameInfo && todayData.gameInfo.length > 0) {
          // Show all games from today, including started ones
          setTodaysGames(todayData.gameInfo);
          const displayDate = new Date(todayData.gameInfo[0].startDateTime);
          setGameDate(
            displayDate.toLocaleDateString('sv-SE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          );
        } else {
          // No games today, find the next upcoming game date
          const upcomingResponse = await fetch(
            withSeason('/api/chl-games?type=upcoming', season),
          );
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
            const dateResponse = await fetch(
              withSeason(
                `/api/chl-games?type=date&date=${nextGameDateString}`,
                season,
              ),
            );
            if (!dateResponse.ok) {
              throw new Error('Failed to fetch games for date');
            }
            const dateData: LeagueResponse = await dateResponse.json();

            if (dateData.gameInfo && dateData.gameInfo.length > 0) {
              setTodaysGames(dateData.gameInfo);
              setGameDate(
                nextGameDate.toLocaleDateString('sv-SE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
              );
            } else {
              setTodaysGames([]);
            }
          } else {
            // No upcoming games — show the winner of the last game
            // (most likely the champion) plus the recent game days.
            const allResponse = await fetch(
              withSeason('/api/chl-games?type=all', season),
            );
            if (allResponse.ok) {
              const allData: LeagueResponse = await allResponse.json();
              const allGames = allData.gameInfo || [];
              const lastGame = getLastFinishedGame(allGames);
              const winner = lastGame ? getGameWinner(lastGame) : null;
              if (lastGame && winner) {
                setChampion({ team: winner, game: lastGame });
                setPreviousGameDays(
                  buildPreviousGameDays(allGames, { limit: 2 }),
                );
              }
            }
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
  }, [season]);

  const formatGameTime = (startDate: string) => {
    const date = new Date(startDate);
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
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#20001c' }}
        aria-busy="true"
      >
        <h1 className="text-white text-xl">Loading CHL games...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#20001c' }}
      >
        <h1 className="text-white text-xl">Error: {error}</h1>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen relative"
      style={{ backgroundColor: '#20001c' }}
    >
      {/* Background CHL Logo */}
      <div className="fixed top-0 right-0 z-0" aria-hidden="true">
        <Image
          src="https://www.chl.hockey/static/img/logo.png"
          alt=""
          width={400}
          height={400}
          className="opacity-10 transform rotate-12"
          role="presentation"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <LeagueHeader
          league="chl"
          gameDate={gameDate || (champion ? '' : 'Inga matcher tillgängliga')}
          logoUrl="https://www.chl.hockey/static/img/logo.png"
          backgroundColor="#20001c"
          standingsPath={standingsPath('chl', season)}
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

        {/* Season has no upcoming games: highlight the last game's winner */}
        {todaysGames.length === 0 && champion && (
          <div className="max-w-4xl mx-auto">
            <SeasonChampion team={champion.team} game={champion.game} />

            {previousGameDays.length > 0 && (
              <PreviousGameDays
                previousGameDays={previousGameDays}
                league="chl"
              />
            )}
          </div>
        )}

        {/* No Games Message */}
        {todaysGames.length === 0 && !champion && (
          <div className="px-6">
            <div className="text-center text-white text-xl">
              Inga matcher idag
            </div>
          </div>
        )}

        <LeagueFooter league="chl" />
      </div>
    </main>
  );
}
