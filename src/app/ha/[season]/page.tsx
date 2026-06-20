'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GameGroup } from '../../components/game-group';
import LeagueFooter from '../../components/league-footer';
import { LeagueHeader } from '../../components/league-header';
import { PreviousGameDays } from '../../components/previous-game-days';
import { SeasonChampion } from '../../components/season-champion';
import { StatnetService } from '../../services/statnetService';
import type { GameInfo } from '../../types/domain/game';
import type { TeamInfo } from '../../types/domain/team';
import { standingsPath } from '../../utils/leaguePaths';
import {
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
    game: GameInfo;
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
          setChampion({ team: winner, game: lastGame });
          setPreviousGameDays(buildPreviousGameDays(endGames, { limit: 2 }));
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
      <main className="min-h-screen py-12 relative bg-[rgba(24,29,38,1)]">
        {/* Background HA Logo */}
        <div className="fixed top-0 right-0 z-0" aria-hidden="true">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg"
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

  // Season has no upcoming games: highlight the last game's winner.
  if (champion) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 relative">
        {/* Sticky Background HA Logo */}
        <div className="fixed top-0 right-0 z-0" aria-hidden="true">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg"
            alt=""
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
            role="presentation"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <LeagueHeader
            league="ha"
            gameDate=""
            logoUrl="https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg"
            standingsPath={standingsPath('ha', season)}
          />

          <div className="max-w-4xl mx-auto">
            <SeasonChampion team={champion.team} game={champion.game} />

            {previousGameDays.length > 0 && (
              <PreviousGameDays
                previousGameDays={previousGameDays}
                league="ha"
              />
            )}
          </div>

          <LeagueFooter league="ha" />
        </div>
      </main>
    );
  }

  if (error || gameDays.length === 0) {
    return (
      <main className="min-h-screen py-12 relative bg-[rgba(24,29,38,1)]">
        {/* Background HA Logo */}
        <div className="fixed top-0 right-0 z-0" aria-hidden="true">
          <Image
            src="https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg"
            alt=""
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
            role="presentation"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <LeagueHeader
            league="ha"
            gameDate=""
            logoUrl="https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg"
            standingsPath={standingsPath('ha', season)}
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
      {/* Sticky Background HA Logo */}
      <div className="fixed top-0 right-0 z-0" aria-hidden="true">
        <Image
          src="https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg"
          alt=""
          width={400}
          height={400}
          className="opacity-10 transform rotate-12"
          role="presentation"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <LeagueHeader
          league="ha"
          gameDate=""
          logoUrl="https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg"
          standingsPath={standingsPath('ha', season)}
        />

        <div className="max-w-4xl mx-auto">
          {/* Previous Game Days */}
          {previousGameDays.length > 0 && (
            <PreviousGameDays previousGameDays={previousGameDays} league="ha" />
          )}

          {/* Upcoming game day(s) — enough dates to show at least 3 games */}
          {gameDays.map((day) => (
            <div key={day.date} className="mb-10">
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
                  {day.date}
                </h1>
              </div>

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

        <LeagueFooter league="ha" />
      </div>
    </main>
  );
}
