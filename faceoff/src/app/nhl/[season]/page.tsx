'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FinalSeries } from '../../components/final-series';
import { GameDayHeader } from '../../components/game-day-header';
import { GameGroup } from '../../components/game-group';
import { SeasonChampion } from '../../components/season-champion';
import { CURRENT_NHL_SEASON } from '../../config/nhl';
import type { GameInfo, LeagueResponse } from '../../types/domain/game';
import type { TeamInfo } from '../../types/domain/team';
import { withSeason } from '../../utils/leaguePaths';
import {
  buildFinalSeries,
  buildUpcomingGameDays,
  type GameDayGroup,
  getGameWinner,
  getLastFinishedGame,
} from '../../utils/seasonEnd';
import { useSeason } from '../../utils/useSeason';

type Champion = { team: TeamInfo; series: GameInfo[] };

/** Derive the champion + final series from a finals-window set of games. */
function championFrom(games: GameInfo[]): Champion | null {
  const lastGame = getLastFinishedGame(games);
  const winner = lastGame ? getGameWinner(lastGame) : null;
  if (!lastGame || !winner) return null;
  return { team: winner, series: buildFinalSeries(games, lastGame) };
}

export default function NHLPage() {
  const season = useSeason();
  const [gameDays, setGameDays] = useState<GameDayGroup[]>([]);
  const [champion, setChampion] = useState<Champion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async (type: string): Promise<GameInfo[]> => {
      const response = await fetch(
        withSeason(`/api/nhl-games?type=${type}`, season),
      );
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data: LeagueResponse = await response.json();
      return data.gameInfo || [];
    };

    const loadGames = async () => {
      try {
        setLoading(true);
        setGameDays([]);
        setChampion(null);

        const isCurrent = season === CURRENT_NHL_SEASON.key;

        if (!isCurrent) {
          // Completed season: show the champion + final series only.
          setChampion(championFrom(await fetchGames('finals')));
          return;
        }

        // Ongoing season: the next game day(s); once the season is over the
        // finals fetch surfaces the champion instead.
        const upcoming = buildUpcomingGameDays(await fetchGames('all'), {
          minGames: 3,
        });
        if (upcoming.length > 0) {
          setGameDays(upcoming);
          return;
        }
        setChampion(championFrom(await fetchGames('finals')));
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
      {/* Background NHL Logo */}
      <div className="fixed top-0 right-0 z-0" aria-hidden="true">
        <Image
          src="https://assets.nhle.com/logos/nhl/svg/NHL_light.svg"
          alt=""
          width={400}
          height={400}
          className="opacity-[0.06] transform rotate-12"
          role="presentation"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Upcoming game day(s) */}
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
                    league="nhl"
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Completed season: champion + final series */}
        {gameDays.length === 0 && champion && (
          <div className="max-w-4xl mx-auto">
            <SeasonChampion team={champion.team} season={season} />
            <FinalSeries games={champion.series} />
          </div>
        )}

        {/* Nothing to show */}
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
