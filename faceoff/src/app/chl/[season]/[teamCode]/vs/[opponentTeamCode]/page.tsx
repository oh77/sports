'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { MatchupTeams } from '@/app/components/matchup-teams';
import GameStatsContainer from '../../../../../components/gamestats-container';
import NextGame from '../../../../../components/next-game';
import { CompactStandings } from '../../../../../components/standings/compact-standings';
import { TopGoalie } from '../../../../../components/top-goalie';
import { TopPlayer } from '../../../../../components/top-player';
import type {
  GameInfo,
  LeagueResponse,
} from '../../../../../types/domain/game';
import type { StandingsData } from '../../../../../types/domain/standings';
import type { TeamInfo } from '../../../../../types/domain/team';
import { leagueBasePath, withSeason } from '../../../../../utils/leaguePaths';

export default function TeamPage({
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
  const [game, setGame] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [opponentInfo, setOpponentInfo] = useState<TeamInfo | null>(null);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [allGames, setAllGames] = useState<GameInfo[]>([]);

  // Helper function to match team code with short name
  const matchTeamCode = useCallback(
    (teamCode: string, teamShortName: string): boolean => {
      return teamShortName.toUpperCase() === teamCode.toUpperCase();
    },
    [],
  );

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);

        // Fetch CHL games and teams - use all games to get complete data
        const [upcomingGamesResponse, recentGamesResponse, teamsResponse] =
          await Promise.all([
            fetch(withSeason('/api/chl-games?type=all-upcoming', season)),
            fetch(withSeason('/api/chl-games?type=all-recent', season)),
            fetch(withSeason('/api/chl-teams', season)),
          ]);

        if (!upcomingGamesResponse.ok) {
          throw new Error(
            `Failed to fetch upcoming games: ${upcomingGamesResponse.status}`,
          );
        }
        if (!recentGamesResponse.ok) {
          throw new Error(
            `Failed to fetch recent games: ${recentGamesResponse.status}`,
          );
        }
        if (!teamsResponse.ok) {
          throw new Error(`Failed to fetch teams: ${teamsResponse.status}`);
        }

        const upcomingGamesData: LeagueResponse =
          await upcomingGamesResponse.json();
        const recentGamesData: LeagueResponse =
          await recentGamesResponse.json();
        const teamsData: TeamInfo[] = await teamsResponse.json();

        // Combine all games from both responses
        const allGamesData = [
          ...(recentGamesData.gameInfo || []),
          ...(upcomingGamesData.gameInfo || []),
        ];
        const teams = teamsData;

        // Store all games for trend indicators
        setAllGames(allGamesData);

        // Find the team by matching the team code with team short names
        const foundTeam = teams.find((team: TeamInfo) =>
          matchTeamCode(teamCode, team.short),
        );

        if (!foundTeam) {
          setError('Lag inte hittat');
          return;
        }

        setTeamInfo(foundTeam);

        // Find the opponent team
        const opponentTeam = teams.find((team: TeamInfo) =>
          matchTeamCode(opponentTeamCode, team.short),
        );

        if (!opponentTeam) {
          setError('Motståndare inte hittad');
          return;
        }
        setOpponentInfo(opponentTeam);

        // Find games between the two specific teams (using foundTeam.short and opponentTeam.short)
        const teamGames = allGamesData.filter(
          (game: GameInfo) =>
            (game.homeTeamInfo.teamInfo.code === foundTeam.short &&
              game.awayTeamInfo.teamInfo.code === opponentTeam.short) ||
            (game.homeTeamInfo.teamInfo.code === opponentTeam.short &&
              game.awayTeamInfo.teamInfo.code === foundTeam.short),
        );

        // Find next game between these teams - prioritize games from today, then upcoming games
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        // First check if there's a game today between these teams
        const todaysGames = teamGames.filter((game: GameInfo) => {
          const gameDate = new Date(game.startDateTime);
          return gameDate.toISOString().split('T')[0] === todayString;
        });

        let nextGame: GameInfo | undefined;

        if (todaysGames.length > 0) {
          // Return the earliest game today between these teams
          nextGame = todaysGames.sort(
            (a: GameInfo, b: GameInfo) =>
              new Date(a.startDateTime).getTime() -
              new Date(b.startDateTime).getTime(),
          )[0];
        } else {
          // No games today between these teams, find the next upcoming game
          nextGame = teamGames
            .filter((game: GameInfo) => new Date(game.startDateTime) >= today)
            .sort(
              (a: GameInfo, b: GameInfo) =>
                new Date(a.startDateTime).getTime() -
                new Date(b.startDateTime).getTime(),
            )[0];
        }

        // Set the game (even if null to show empty game box)
        setGame(nextGame || null);

        // Load standings data
        try {
          const standingsResponse = await fetch(
            withSeason('/api/chl-standings', season),
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
        console.error('CHL Team Page Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (teamCode) {
      loadTeamData();
    }
  }, [teamCode, opponentTeamCode, matchTeamCode, season]);

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
              {error || 'inget lag hittat'}
            </h1>
            <p className="text-dim mb-6">
              {error ||
                `Inga kommande matcher hittades för lagkod: ${teamCode}`}
            </p>
            <Link
              href={leagueBasePath('chl', season)}
              className="display inline-block rounded-lg bg-accent px-6 py-3 font-bold uppercase tracking-[0.04em] text-white transition-opacity hover:opacity-90"
            >
              Tillbaka till CHL
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
          {teamInfo.full} mot {opponentInfo?.full ?? opponentTeamCode}
        </h1>

        <NextGame
          game={game}
          currentTeamCode={teamCode}
          league="chl"
          allGames={allGames}
        />

        {/* Game Stats - Home/Away and Last 5 Games */}
        {game && (
          <div className="max-w-6xl mx-auto mb-8">
            <GameStatsContainer allGames={allGames} currentGame={game} />
          </div>
        )}

        {/* Top Scorers and Goalies for Both Teams */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Team 1 */}
            <div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <TopPlayer league="chl" teamCode={teamCode} />
                </div>
                <div>
                  <TopGoalie league="chl" teamCode={teamCode} />
                </div>
              </div>
            </div>

            {/* Team 2 */}
            <div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <TopPlayer league="chl" teamCode={opponentTeamCode} />
                </div>
                <div>
                  <TopGoalie league="chl" teamCode={opponentTeamCode} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Standings */}
        {standings && (
          <div className="max-w-6xl mx-auto mt-8">
            <CompactStandings
              standings={standings}
              league="chl"
              teamCode={teamCode}
              opponentTeamCode={opponentTeamCode}
            />
          </div>
        )}

        {/* Both teams' last and next games, home team first */}
        <MatchupTeams
          games={allGames}
          homeTeamCode={game ? game.homeTeamInfo.teamInfo.code : teamInfo.short}
          awayTeamCode={
            game
              ? game.awayTeamInfo.teamInfo.code
              : (opponentInfo?.short ?? opponentTeamCode)
          }
          league="chl"
        />
      </div>
    </main>
  );
}
