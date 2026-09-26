'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import GameStatsContainer from '@/app/components/gamestats-container';
import { MatchupTeams } from '@/app/components/matchup-teams';
import { teamInfoFromGames } from '@/app/utils/teamGames';
import { HeadToHead } from '../../../../../components/head-to-head';
import NextGame from '../../../../../components/next-game';
import { CompactStandings } from '../../../../../components/standings/compact-standings';
import { TopPlayers } from '../../../../../components/top-players';
import { StatnetService } from '../../../../../services/statnetService';
import type { GameInfo, GameTeamInfo } from '../../../../../types/domain/game';
import type { StandingsData } from '../../../../../types/domain/standings';
import { leagueBasePath, withSeason } from '../../../../../utils/leaguePaths';

export default function SDHLTeamPage({
  params,
}: {
  params: Promise<{
    season: string;
    teamCode: string;
    opponentTeamCode: string;
  }>;
}) {
  const resolvedParams = React.use(params);
  const season = resolvedParams.season;
  const teamCode = decodeURIComponent(resolvedParams.teamCode);
  const opponentTeamCode = decodeURIComponent(resolvedParams.opponentTeamCode);
  const [teamInfo, setTeamInfo] = useState<GameTeamInfo | null>(null);
  const [game, setGame] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [allGames, setAllGames] = useState<GameInfo[]>([]);

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);
        const leagueService = new StatnetService('sdhl', season);

        // Fetch games from API (cached server-side)
        const games = await leagueService.fetchGames();
        setAllGames(games);

        if (games.length === 0) {
          setError('Ingen matchdata tillgänglig');
          return;
        }

        // Find next game between the two specific teams
        const today = new Date();
        const teamGames = games.filter(
          (game: GameInfo) =>
            (game.homeTeamInfo.teamInfo.code === teamCode &&
              game.awayTeamInfo.teamInfo.code === opponentTeamCode) ||
            (game.homeTeamInfo.teamInfo.code === opponentTeamCode &&
              game.awayTeamInfo.teamInfo.code === teamCode),
        );

        const nextGame = teamGames
          .filter((game: GameInfo) => new Date(game.startDateTime) >= today)
          .sort(
            (a: GameInfo, b: GameInfo) =>
              new Date(a.startDateTime).getTime() -
              new Date(b.startDateTime).getTime(),
          )[0];

        // Set the game (even if null to show empty game box)
        setGame(nextGame || null);

        // Set team info - find from any game involving the team
        const teamGameForInfo = games.find(
          (game) =>
            game.homeTeamInfo.teamInfo.code === teamCode ||
            game.awayTeamInfo.teamInfo.code === teamCode,
        );

        if (!teamGameForInfo) {
          setError('Lag inte hittat');
          return;
        }

        // Set team info
        const isHomeTeam =
          teamGameForInfo.homeTeamInfo.teamInfo.code === teamCode;
        const team = isHomeTeam
          ? teamGameForInfo.homeTeamInfo
          : teamGameForInfo.awayTeamInfo;
        setTeamInfo(team);

        // Load standings data
        try {
          const standingsResponse = await fetch(
            withSeason('/api/sdhl-standings', season),
          );
          if (standingsResponse.ok) {
            const standingsData = await standingsResponse.json();
            setStandings(standingsData);
          }
        } catch (err) {
          console.error('Failed to load standings:', err);
        }
      } catch (err) {
        setError('Misslyckades att ladda lagdata');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [teamCode, opponentTeamCode, season]);

  if (loading) {
    return (
      <main className="relative py-6 md:py-8">
        <div className="container mx-auto px-4 relative z-10">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-3 rounded mb-8 w-1/3 mx-auto"></div>
            <div className="h-64 bg-surface rounded mb-4"></div>
            <div className="h-4 bg-surface-3 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !teamInfo) {
    return (
      <main className="relative py-6 md:py-8">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="text-loss text-6xl mb-4">⚠️</div>
            <h1 className="display text-3xl font-bold uppercase tracking-[0.02em] text-ink mb-4">
              {error || 'Lag Inte Hittat'}
            </h1>
            <p className="text-dim mb-6">
              {error || `Lag "${teamCode}" kunde inte hittas`}
            </p>
            <Link
              href={leagueBasePath('sdhl', season)}
              className="display inline-block rounded-lg bg-accent px-6 py-3 font-bold uppercase tracking-[0.04em] text-white transition-opacity hover:opacity-90"
            >
              Tillbaka till SDHL
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative py-6 md:py-8">
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="sr-only">
          {teamInfo.teamInfo.full} mot{' '}
          {teamInfoFromGames(allGames, opponentTeamCode)?.full ??
            opponentTeamCode}
        </h1>

        <NextGame
          game={game}
          currentTeamCode={teamCode}
          league="sdhl"
          allGames={allGames}
        />

        {/* Head to Head */}
        <HeadToHead
          games={allGames}
          teamCode1={teamCode}
          teamCode2={opponentTeamCode}
        />

        {game && (
          <div className="max-w-6xl mx-auto mb-8">
            <GameStatsContainer allGames={allGames} currentGame={game} />
          </div>
        )}

        {/* Top Players */}
        <TopPlayers
          teamCode1={teamCode}
          teamCode2={opponentTeamCode}
          league="sdhl"
        />

        {/* Compact Standings */}
        {standings && (
          <div className="max-w-6xl mx-auto mb-8">
            <CompactStandings
              standings={standings}
              league="sdhl"
              teamCode={teamCode}
              opponentTeamCode={opponentTeamCode}
            />
          </div>
        )}

        {/* Both teams' last and next games, home team first */}
        <MatchupTeams
          games={allGames}
          homeTeamCode={game ? game.homeTeamInfo.teamInfo.code : teamCode}
          awayTeamCode={
            game ? game.awayTeamInfo.teamInfo.code : opponentTeamCode
          }
          league="sdhl"
        />
      </div>
    </main>
  );
}
