'use client';

import React, { useEffect, useState } from 'react';
import {
  TeamOverview,
  TeamPageError,
  TeamPageLoading,
} from '@/app/components/team-overview';
import type { GameInfo, LeagueResponse } from '@/app/types/domain/game';
import type { StandingsData } from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';
import { leagueBasePath, withSeason } from '@/app/utils/leaguePaths';

export default function TeamPage({
  params,
}: {
  params: Promise<{ season: string; teamCode: string }>;
}) {
  const resolvedParams = React.use(params);
  const season = resolvedParams.season;
  const teamCode = decodeURIComponent(resolvedParams.teamCode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [allGames, setAllGames] = useState<GameInfo[]>([]);
  const [standings, setStandings] = useState<StandingsData | null>(null);

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
        const teams: TeamInfo[] = await teamsResponse.json();

        setAllGames([
          ...(recentGamesData.gameInfo || []),
          ...(upcomingGamesData.gameInfo || []),
        ]);

        // CHL team codes are the teams' short names, in any case.
        const foundTeam = teams.find(
          (team) => team.short.toUpperCase() === teamCode.toUpperCase(),
        );
        if (!foundTeam) {
          setError('Lag inte hittat');
          return;
        }
        setTeamInfo(foundTeam);

        // Load standings data
        try {
          const standingsResponse = await fetch(
            withSeason('/api/chl-standings', season),
          );
          if (standingsResponse.ok) {
            setStandings(await standingsResponse.json());
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
  }, [teamCode, season]);

  if (loading) return <TeamPageLoading />;

  if (error || !teamInfo) {
    return (
      <TeamPageError
        message={error || 'Lag inte hittat'}
        backHref={leagueBasePath('chl', season)}
        leagueName="CHL"
      />
    );
  }

  return (
    <TeamOverview
      team={teamInfo}
      games={allGames}
      standings={standings}
      league="chl"
    />
  );
}
