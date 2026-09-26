'use client';

import React, { useEffect, useState } from 'react';
import GameStatsContainer from '@/app/components/gamestats-container';
import { HeadToHead } from '@/app/components/head-to-head';
import { MatchupTeams } from '@/app/components/matchup-teams';
import NextGame from '@/app/components/next-game';
import { CompactStandings } from '@/app/components/standings/compact-standings';
import { TeamPageError, TeamPageLoading } from '@/app/components/team-overview';
import { TopGoalie } from '@/app/components/top-goalie';
import { TopPlayer } from '@/app/components/top-player';
import { NHL_TEAMS } from '@/app/config/nhlTeams';
import type { GameInfo } from '@/app/types/domain/game';
import type { StandingsData } from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';
import { leagueBasePath } from '@/app/utils/leaguePaths';
import {
  fetchNhlMatchupGames,
  fetchNhlStandings,
} from '@/app/utils/nhlTeamData';
import { nextMeeting } from '@/app/utils/teamGames';

const findClub = (code: string): TeamInfo | undefined =>
  NHL_TEAMS.find((t) => t.code.toUpperCase() === code.toUpperCase());

export default function NhlMatchupPage({
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

  const [allGames, setAllGames] = useState<GameInfo[]>([]);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The clubs are static config entries; the abbrev is the URL code.
  const team = findClub(teamCode);
  const opponent = findClub(opponentTeamCode);

  useEffect(() => {
    if (!team || !opponent) {
      setLoading(false);
      return;
    }

    const loadMatchup = async () => {
      try {
        setLoading(true);
        const [games, standingsData] = await Promise.all([
          fetchNhlMatchupGames(team.code, opponent.code, season),
          fetchNhlStandings(season),
        ]);
        setAllGames(games);
        setStandings(standingsData);
      } catch (err) {
        setError('Misslyckades att ladda lagdata');
        console.error('NHL Matchup Page Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMatchup();
  }, [team, opponent, season]);

  if (loading) return <TeamPageLoading />;

  if (error || !team || !opponent || team.code === opponent.code) {
    return (
      <TeamPageError
        message={error || 'Lag inte hittat'}
        backHref={leagueBasePath('nhl', season)}
        leagueName="NHL"
      />
    );
  }

  const game = nextMeeting(allGames, team.code, opponent.code);
  // Home team first when the two have a meeting left; URL order otherwise.
  const [home, away] =
    game?.homeTeamInfo.teamInfo.code === opponent.code
      ? [opponent, team]
      : [team, opponent];

  return (
    <main className="relative py-6 md:py-8">
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="sr-only">
          {team.full} mot {opponent.full}
        </h1>

        <NextGame
          game={game}
          currentTeamCode={team.code}
          league="nhl"
          allGames={allGames}
        />

        <HeadToHead
          games={allGames}
          teamCode1={team.code}
          teamCode2={opponent.code}
        />

        {game && (
          <div className="max-w-6xl mx-auto mb-8">
            <GameStatsContainer allGames={allGames} currentGame={game} />
          </div>
        )}

        {/* Top scorer + goalie per club, home team first */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[home, away].map((club) => (
              <div key={club.code} className="grid grid-cols-1 gap-6">
                <TopPlayer league="nhl" teamCode={club.code} />
                <TopGoalie league="nhl" teamCode={club.code} />
              </div>
            ))}
          </div>
        </div>

        {standings && (
          <div className="max-w-6xl mx-auto mb-8">
            <CompactStandings
              standings={standings}
              league="nhl"
              teamCode={team.code}
              opponentTeamCode={opponent.code}
            />
          </div>
        )}

        <MatchupTeams
          games={allGames}
          homeTeamCode={home.code}
          awayTeamCode={away.code}
          league="nhl"
        />
      </div>
    </main>
  );
}
