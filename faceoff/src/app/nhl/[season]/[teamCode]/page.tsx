'use client';

import React, { useEffect, useState } from 'react';
import {
  TeamOverview,
  TeamPageError,
  TeamPageLoading,
} from '@/app/components/team-overview';
import { NHL_TEAMS } from '@/app/config/nhlTeams';
import type { GameInfo } from '@/app/types/domain/game';
import type { StandingsData } from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';
import { leagueBasePath } from '@/app/utils/leaguePaths';
import { fetchNhlStandings, fetchNhlTeamGames } from '@/app/utils/nhlTeamData';

export default function NhlTeamPage({
  params,
}: {
  params: Promise<{ season: string; teamCode: string }>;
}) {
  const resolvedParams = React.use(params);
  const season = resolvedParams.season;
  const teamCode = decodeURIComponent(resolvedParams.teamCode);

  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [allGames, setAllGames] = useState<GameInfo[]>([]);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);

        // The club is a static config entry; the abbrev is the URL code.
        const foundTeam = NHL_TEAMS.find(
          (t) => t.code.toUpperCase() === teamCode.toUpperCase(),
        );
        if (!foundTeam) {
          setError('Lag inte hittat');
          return;
        }
        setTeamInfo(foundTeam);

        // The whole season for this club in one call.
        const [gamesData, standingsData] = await Promise.all([
          fetchNhlTeamGames(foundTeam.code, season),
          fetchNhlStandings(season),
        ]);
        setAllGames(gamesData);
        setStandings(standingsData);
      } catch (err) {
        setError('Misslyckades att ladda lagdata');
        console.error('NHL Team Page Error:', err);
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
        message={error || 'Inget lag hittat'}
        backHref={leagueBasePath('nhl', season)}
        leagueName="NHL"
      />
    );
  }

  return (
    <TeamOverview
      team={teamInfo}
      games={allGames}
      standings={standings}
      league="nhl"
    />
  );
}
