'use client';

import React, { useEffect, useState } from 'react';
import {
  TeamOverview,
  TeamPageError,
  TeamPageLoading,
} from '@/app/components/team-overview';
import { StatnetService } from '@/app/services/statnetService';
import type { GameInfo } from '@/app/types/domain/game';
import type { StandingsData } from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';
import { leagueBasePath, withSeason } from '@/app/utils/leaguePaths';
import { teamInfoFromGames } from '@/app/utils/teamGames';

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
    const loadTeam = async () => {
      try {
        setLoading(true);
        const leagueService = new StatnetService('ha', season);

        // Fetch games from API (cached server-side)
        const games = await leagueService.fetchGames();
        setAllGames(games);

        const team = teamInfoFromGames(games, teamCode);
        if (!team) {
          setError('Lag inte hittat');
          return;
        }
        setTeamInfo(team);

        // Load standings data
        try {
          const standingsResponse = await fetch(
            withSeason('/api/ha-standings', season),
          );
          if (standingsResponse.ok) {
            setStandings(await standingsResponse.json());
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

    loadTeam();
  }, [teamCode, season]);

  if (loading) return <TeamPageLoading />;

  if (error || !teamInfo) {
    return (
      <TeamPageError
        message={error || 'Lag inte hittat'}
        backHref={leagueBasePath('ha', season)}
        leagueName="HA"
      />
    );
  }

  return (
    <TeamOverview
      team={teamInfo}
      games={allGames}
      standings={standings}
      league="ha"
    />
  );
}
