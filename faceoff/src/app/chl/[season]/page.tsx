'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GameDayHeader } from '../../components/game-day-header';
import { GameGroup } from '../../components/game-group';
import { PreviousGameDays } from '../../components/previous-game-days';
import { SeasonChampion } from '../../components/season-champion';
import type { GameInfo, LeagueResponse } from '../../types/domain/game';
import type { TeamInfo } from '../../types/domain/team';
import { withSeason } from '../../utils/leaguePaths';
import {
  buildPreviousGameDays,
  buildUpcomingGameDays,
  type GameDayGroup,
  getGameWinner,
  getLastFinishedGame,
} from '../../utils/seasonEnd';
import { useSeason } from '../../utils/useSeason';

export default function CHLPage() {
  const season = useSeason();
  const [gameDays, setGameDays] = useState<GameDayGroup[]>([]);
  const [previousGameDays, setPreviousGameDays] = useState<GameDayGroup[]>([]);
  const [champion, setChampion] = useState<{
    team: TeamInfo;
    game: GameInfo;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          withSeason('/api/chl-games?type=all', season),
        );
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data: LeagueResponse = await response.json();
        const allGames = data.gameInfo || [];

        // Show the next game day(s) — keep adding whole dates until at least
        // 3 games are displayed.
        const upcoming = buildUpcomingGameDays(allGames, { minGames: 3 });

        if (upcoming.length > 0) {
          setGameDays(upcoming);
          const firstDate = new Date(upcoming[0].games[0].startDateTime);
          setPreviousGameDays(
            buildPreviousGameDays(allGames, { before: firstDate, limit: 2 }),
          );
          return;
        }

        // No current/upcoming games — the season is over, so surface the
        // winner of the last game (most likely the champion) plus the recent
        // game days.
        const lastGame = getLastFinishedGame(allGames);
        const winner = lastGame ? getGameWinner(lastGame) : null;
        if (lastGame && winner) {
          setChampion({ team: winner, game: lastGame });
          setPreviousGameDays(buildPreviousGameDays(allGames, { limit: 2 }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadGames();
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
      <main className="relative py-6 md:py-8" aria-busy="true">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto mb-8 h-9 w-48 animate-pulse rounded bg-surface-3"></div>
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-lg bg-surface"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative py-6 md:py-8">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="text-loss text-6xl mb-4">⚠️</div>
            <h2 className="display text-3xl font-bold uppercase tracking-[0.02em] text-ink mb-4">
              {error}
            </h2>
            <p className="text-dim mb-6">{error}</p>
            <Link
              href="/"
              className="display inline-block rounded-lg bg-accent px-6 py-3 font-bold uppercase tracking-[0.04em] text-white transition-opacity hover:opacity-90"
            >
              Tillbaka till Hem
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative py-6 md:py-8">
      {/* Background CHL Logo */}
      <div className="fixed top-0 right-0 z-0" aria-hidden="true">
        <Image
          src="https://www.chl.hockey/static/img/logo.png"
          alt=""
          width={400}
          height={400}
          className="opacity-[0.06] transform rotate-12"
          role="presentation"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Upcoming game day(s) — enough dates to show at least 3 games */}
        {gameDays.length > 0 && (
          <div className="max-w-4xl mx-auto">
            {gameDays.map((day) => (
              <div key={day.date} className="mb-10">
                <GameDayHeader date={new Date(day.games[0].startDateTime)} />

                {groupGamesByTime(day.games).map((group) => (
                  <GameGroup
                    key={group.time}
                    time={group.time}
                    games={group.games}
                    league="chl"
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Season has no upcoming games: highlight the last game's winner */}
        {gameDays.length === 0 && champion && (
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
        {gameDays.length === 0 && !champion && (
          <div className="px-6">
            <div className="text-center text-dim text-xl">
              Inga matcher idag
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
