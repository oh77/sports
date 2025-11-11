'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import NextGame from '../../components/next-game';
import PreviousGames from '../../components/previous-games';
import { CompactStandings } from '../../components/standings/compact-standings';
import UpcomingGames from '../../components/upcoming-games';
import type { GameInfo, LeagueResponse } from '../../types/domain/game';
import type { StandingsData } from '../../types/domain/standings';
import type { TeamInfo } from '../../types/domain/team';

export default function TeamPage({
  params,
}: {
  params: Promise<{ teamCode: string }>;
}) {
  const resolvedParams = React.use(params);
  const teamCode = decodeURIComponent(resolvedParams.teamCode);
  const [game, setGame] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [previousGames, setPreviousGames] = useState<GameInfo[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<GameInfo[]>([]);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [allTeams, setAllTeams] = useState<TeamInfo[]>([]);

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
            fetch('/api/chl-games?type=all-upcoming'),
            fetch('/api/chl-games?type=all-recent'),
            fetch('/api/chl-teams'),
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
        const allGames = [
          ...(recentGamesData.gameInfo || []),
          ...(upcomingGamesData.gameInfo || []),
        ];
        const teams = teamsData;

        // Store all teams for footer
        setAllTeams(teams);

        // Find the team by matching the team code with team short names
        const foundTeam = teams.find((team: TeamInfo) =>
          matchTeamCode(teamCode, team.short),
        );

        if (!foundTeam) {
          setError('Lag inte hittat');
          return;
        }

        setTeamInfo(foundTeam);

        // Find games for this team (now using domain GameInfo models)
        const teamGames = allGames.filter(
          (game: GameInfo) =>
            game.homeTeamInfo.teamInfo.code === foundTeam.short ||
            game.awayTeamInfo.teamInfo.code === foundTeam.short,
        );

        // Find next game - prioritize games from today (including started ones), then upcoming games
        const now = new Date();
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        // First check if there's a game today (regardless of whether it's started)
        const todaysGames = teamGames.filter((game: GameInfo) => {
          const gameDate = new Date(game.startDateTime);
          return gameDate.toISOString().split('T')[0] === todayString;
        });

        let nextGame: GameInfo | undefined;

        if (todaysGames.length > 0) {
          // Return the earliest game today (in case there are multiple)
          nextGame = todaysGames.sort(
            (a: GameInfo, b: GameInfo) =>
              new Date(a.startDateTime).getTime() -
              new Date(b.startDateTime).getTime(),
          )[0];
        } else {
          // No games today, find the next upcoming game
          nextGame = teamGames
            .filter(
              (game: GameInfo) =>
                game.state === 'not-started' &&
                new Date(game.startDateTime) > now,
            )
            .sort(
              (a: GameInfo, b: GameInfo) =>
                new Date(a.startDateTime).getTime() -
                new Date(b.startDateTime).getTime(),
            )[0];
        }

        setGame(nextGame || null);

        // Get previous and upcoming games
        const previous = teamGames
          .filter((game: GameInfo) => {
            const gameDate = new Date(game.startDateTime);
            const gameDateString = gameDate.toISOString().split('T')[0];
            // Exclude games from today - only show games from before today
            return game.state === 'finished' && gameDateString !== todayString;
          })
          .sort(
            (a: GameInfo, b: GameInfo) =>
              new Date(b.startDateTime).getTime() -
              new Date(a.startDateTime).getTime(),
          )
          .slice(0, 3); // Show up to 3 previous games

        const upcoming = teamGames
          .filter((game: GameInfo) => {
            const gameDate = new Date(game.startDateTime);
            const gameDateString = gameDate.toISOString().split('T')[0];
            // Exclude games from today and the next game - they're shown in the "next game" container
            return (
              game.state === 'not-started' &&
              gameDateString !== todayString &&
              game.uuid !== nextGame?.uuid
            );
          })
          .sort(
            (a: GameInfo, b: GameInfo) =>
              new Date(a.startDateTime).getTime() -
              new Date(b.startDateTime).getTime(),
          )
          .slice(0, 3); // Show up to 3 upcoming games (excluding today's games and the next game)

        setPreviousGames(previous);
        setUpcomingGames(upcoming);

        // Load standings data
        try {
          const standingsResponse = await fetch('/api/chl-standings');
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
  }, [teamCode, matchTeamCode]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-8 w-1/3 mx-auto"></div>
            <div className="h-64 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !teamInfo) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {error || 'inget lag hittat'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error ||
                `Inga kommande matcher hittades för lagkod: ${teamCode}`}
            </p>
            <Link
              href="/chl"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Tillbaka till CHL
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 relative">
      {/* Background Team Logo */}
      <div className="absolute inset-0 flex items-center justify-center z-0 px-8">
        <div className="opacity-10 w-full h-full flex items-center justify-center">
          <Image
            src={teamInfo.logo || '/placeholder-team.png'}
            alt={`${teamInfo.full} background logo`}
            width={400}
            height={400}
            className="w-96 h-96 object-contain transform rotate-12"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 py-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Image
              src={teamInfo.logo || '/placeholder-team.png'}
              alt={`${teamInfo.full} logo`}
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 uppercase tracking-wider text-center md:text-left">
            {teamInfo.full}
          </h1>
        </div>

        <NextGame game={game} currentTeamCode={teamCode} league="chl" />

        {/* Compact Standings */}
        {standings && (
          <div className="max-w-6xl mx-auto mt-8">
            <CompactStandings
              standings={standings}
              league="chl"
              teamCode={teamCode}
              opponentTeamCode={
                game
                  ? game.homeTeamInfo.teamInfo.code === teamCode
                    ? game.awayTeamInfo.teamInfo.code
                    : game.homeTeamInfo.teamInfo.code
                  : undefined
              }
            />
          </div>
        )}

        {/* Previous and Upcoming Games */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PreviousGames
              games={previousGames}
              currentTeamCode={teamCode}
              league="chl"
            />

            <UpcomingGames
              games={upcomingGames}
              currentTeamCode={teamCode}
              league="chl"
            />
          </div>
        </div>

        {/* Teams Footer */}
        {allTeams.length > 0 && (
          <footer className="bg-gray-800 py-8 mt-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
                {[
                  // CHL league logo as first item
                  {
                    key: 'league-chl',
                    href: '/chl',
                    logo: 'https://www.chl.hockey/static/img/logo.png',
                    alt: 'CHL Logo',
                    tooltip: 'CHL',
                    isLeague: true,
                  },
                  // Team logos
                  ...allTeams.map((team) => ({
                    key: `team-${team.short}`,
                    href: `/chl/${team.short.toUpperCase()}`,
                    logo: team.logo || '/placeholder-team.png',
                    alt: `${team.full} logo`,
                    tooltip: team.full,
                    isCurrentTeam:
                      team.short.toUpperCase() === teamCode.toUpperCase(),
                    isLeague: false,
                  })),
                ].map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`group relative transition-all duration-200 ${
                      'isCurrentTeam' in item && item.isCurrentTeam
                        ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800'
                        : 'hover:scale-110'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 ${item.isLeague ? 'bg-gray-800' : 'bg-gray-100'} rounded-full flex items-center justify-center overflow-hidden`}
                    >
                      <Image
                        src={item.logo}
                        alt={item.alt}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain"
                      />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.tooltip}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}
