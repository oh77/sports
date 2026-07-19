'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FinalSeries } from '../../components/final-series';
import { GameDayHeader } from '../../components/game-day-header';
import { GameGroup } from '../../components/game-group';
import { PreviousGameDays } from '../../components/previous-game-days';
import { SeasonChampion } from '../../components/season-champion';
import { StatnetService } from '../../services/statnetService';
import type { GameInfo } from '../../types/domain/game';
import type { TeamInfo } from '../../types/domain/team';
import {
  buildFinalSeries,
  buildPreviousGameDays,
  buildUpcomingGameDays,
  type GameDayGroup,
  getGameWinner,
  getLastFinishedGame,
} from '../../utils/seasonEnd';
import { useSeason } from '../../utils/useSeason';

export default function HAPage() {
  const season = useSeason();
  const [gameDays, setGameDays] = useState<GameDayGroup[]>([]);
  const [previousGameDays, setPreviousGameDays] = useState<GameDayGroup[]>([]);
  const [champion, setChampion] = useState<{
    team: TeamInfo;
    series: GameInfo[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const leagueService = new StatnetService('ha', season);

        // Fetch games from API (cached server-side)
        const games = await leagueService.fetchGames();

        // Show the next game day(s) — keep adding whole dates until at least
        // 3 games are displayed.
        const upcoming = buildUpcomingGameDays(games, { minGames: 3 });

        if (upcoming.length > 0) {
          setGameDays(upcoming);
          const firstDate = new Date(upcoming[0].games[0].startDateTime);
          setPreviousGameDays(
            buildPreviousGameDays(games, { before: firstDate, limit: 2 }),
          );
          return;
        }

        // No current/upcoming regular-season games — the season is over, so
        // surface the playoff champion (winner of the last playoff game) and
        // the recent playoff game days. Fall back to the regular season if
        // there are no playoff games.
        const playoffGames = await leagueService.fetchGames('playoffs');
        const endGames = playoffGames.length > 0 ? playoffGames : games;
        const lastGame = getLastFinishedGame(endGames);
        const winner = lastGame ? getGameWinner(lastGame) : null;
        if (lastGame && winner) {
          setChampion({
            team: winner,
            series: buildFinalSeries(endGames, lastGame),
          });
        } else {
          setError(
            games.length > 0
              ? 'Inga kommande matcher hittades'
              : 'Ingen matchdata tillgänglig',
          );
        }
      } catch (err) {
        setError('Misslyckades att ladda matchdata');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [season]);

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
      <main className="relative py-6 md:py-8">
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

  // Season has no upcoming games: highlight the last game's winner.
  if (champion) {
    return (
      <main className="relative py-6 md:py-8">
        {/* Sticky Background HA Logo */}
        <div className="fixed top-0 right-0 z-0" aria-hidden="true">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg"
            alt=""
            width={400}
            height={400}
            className="opacity-[0.06] transform rotate-12"
            role="presentation"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <SeasonChampion team={champion.team} season={season} />

            <FinalSeries games={champion.series} />
          </div>
        </div>
      </main>
    );
  }

  if (error || gameDays.length === 0) {
    return (
      <main className="relative py-6 md:py-8">
        {/* Background HA Logo */}
        <div className="fixed top-0 right-0 z-0" aria-hidden="true">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg"
            alt=""
            width={400}
            height={400}
            className="opacity-[0.06] transform rotate-12"
            role="presentation"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="text-loss text-6xl mb-4">⚠️</div>
            <h2 className="display text-3xl font-bold uppercase tracking-[0.02em] text-ink mb-4">
              {error || 'Inga Matcher Hittades'}
            </h2>
            <p className="text-dim mb-6">
              {error || 'Inga kommande matcher tillgängliga just nu'}
            </p>
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
      {/* Sticky Background HA Logo */}
      <div className="fixed top-0 right-0 z-0" aria-hidden="true">
        <Image
          src="https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg"
          alt=""
          width={400}
          height={400}
          className="opacity-[0.06] transform rotate-12"
          role="presentation"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Previous Game Days */}
          {previousGameDays.length > 0 && (
            <PreviousGameDays previousGameDays={previousGameDays} league="ha" />
          )}

          {/* Upcoming game day(s) — enough dates to show at least 3 games */}
          {gameDays.map((day) => (
            <div key={day.date} className="mb-10">
              <GameDayHeader date={new Date(day.games[0].startDateTime)} />

              {groupGamesByTime(day.games).map((group) => (
                <GameGroup
                  key={group.time}
                  time={group.time}
                  games={group.games}
                  league="ha"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
