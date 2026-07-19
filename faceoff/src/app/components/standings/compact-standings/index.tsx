'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  getRankBorderClass,
  getRankDisplay,
  getTeamCode,
  getTeamLogo,
  getTeamName,
} from '@/app/components/standings/standingsUtils';
import type { League } from '@/app/types/domain/league';
import { teamPath } from '@/app/utils/leaguePaths';
import { useSeason } from '@/app/utils/useSeason';
import type { StandingsData, TeamStats } from '../../../types/domain/standings';

interface CompactStandingsProps {
  standings: StandingsData;
  league: League;
  teamCode: string;
  opponentTeamCode?: string;
}

export function CompactStandings({
  standings,
  league,
  teamCode,
  opponentTeamCode,
}: CompactStandingsProps) {
  const season = useSeason();
  const getTeams = () => {
    return standings.stats || [];
  };

  // Find teams and their neighbors
  const getCompactTeams = () => {
    const teams = getTeams();
    if (!teams.length) return [];

    const selectedTeams = new Set<string>();
    const result: Array<{ team: TeamStats; index: number; rank: number }> = [];

    const getTeamIndex = (teamCode: string) => {
      return teams.findIndex((team) => getTeamCode(team) === teamCode);
    };

    const getTeamIndices = () => {
      if (opponentTeamCode) {
        return [getTeamIndex(teamCode), getTeamIndex(opponentTeamCode)];
      }

      return [getTeamIndex(teamCode)];
    };

    // Add teams and their neighbors
    getTeamIndices().forEach((teamIndex) => {
      if (teamIndex === -1) return; // Team not found

      const team = teams[teamIndex];
      const teamCode = getTeamCode(team);
      const rank = team.Rank || teamIndex + 1;

      // Add the team itself
      if (!selectedTeams.has(teamCode)) {
        selectedTeams.add(teamCode);
        result.push({
          team,
          index: teamIndex,
          rank,
        });
      }

      // Add team above (if exists and not already added)
      if (teamIndex > 0) {
        const teamAbove = teams[teamIndex - 1];
        const teamAboveCode = getTeamCode(teamAbove);
        const teamAboveRank = teamAbove.Rank || teamIndex;

        if (!selectedTeams.has(teamAboveCode)) {
          selectedTeams.add(teamAboveCode);
          result.push({
            team: teamAbove,
            index: teamIndex - 1,
            rank: teamAboveRank,
          });
        }
      }

      // Add team below (if exists and not already added)
      if (teamIndex < teams.length - 1) {
        const teamBelow = teams[teamIndex + 1];
        const teamBelowCode = getTeamCode(teamBelow);
        const teamBelowRank = teamBelow.Rank || teamIndex + 2;

        if (!selectedTeams.has(teamBelowCode)) {
          selectedTeams.add(teamBelowCode);
          result.push({
            team: teamBelow,
            index: teamIndex + 1,
            rank: teamBelowRank,
          });
        }
      }
    });

    // Sort by rank first, then by goal difference descending
    return result.sort((a, b) => {
      // First sort by rank
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }

      // If ranks are equal, sort by goal difference (descending)
      const aGoalDiff = a.team.G - a.team.GA;
      const bGoalDiff = b.team.G - b.team.GA;

      return bGoalDiff - aGoalDiff; // Descending order
    });
  };

  // Helper function to get full standings position for a team
  const getFullStandingsPosition = (teamCode: string): number => {
    const allTeams = standings.stats || [];

    // Sort all teams the same way as FullStandings
    const sortedTeams = allTeams.sort((a, b) => {
      // First sort by rank
      const aRank = a.Rank || 0;
      const bRank = b.Rank || 0;

      if (aRank !== bRank) {
        return aRank - bRank;
      }

      // If ranks are equal, sort by goal difference (descending)
      const aGoalDiff = a.G - a.GA;
      const bGoalDiff = b.G - b.GA;

      return bGoalDiff - aGoalDiff; // Descending order
    });

    // Find the position of the team
    const position = sortedTeams.findIndex((team) => {
      return getTeamCode(team) === teamCode;
    });

    return position + 1; // Return 1-based position
  };

  const compactTeams = getCompactTeams();

  // Get total number of teams for colorization
  const totalTeams = standings.stats?.length || 0;

  // No standings for the selected teams (e.g. early in a new season). Stay
  // silent for the user — the section just collapses.
  if (!compactTeams.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-line bg-surface overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-2 border-b border-line">
            <tr>
              <th className="px-3 py-2 text-left text-xs text-mute display uppercase tracking-[0.06em]">
                #
              </th>
              <th className="px-3 py-2 text-left text-xs text-mute display uppercase tracking-[0.06em]">
                Lag
              </th>
              <th className="px-3 py-2 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                M
              </th>
              <th className="px-3 py-2 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                P
              </th>
              <th className="px-3 py-2 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                GM
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {compactTeams.map(({ team, rank }) => {
              const teamCode = getTeamCode(team);
              const teamName = getTeamName(team);
              const teamLogo = getTeamLogo(team);
              const points = team.Points;
              const goalDifference = team.G - team.GA;
              const gamesPlayed = team.GP;
              const fullPosition = getFullStandingsPosition(teamCode);

              return (
                <tr
                  key={teamCode}
                  className="hover:bg-white/[0.03] transition-colors"
                >
                  {/* Rank */}
                  <td
                    className={`px-3 py-3 whitespace-nowrap text-sm display text-ink ${getRankBorderClass(league, fullPosition, totalTeams)}`}
                  >
                    {getRankDisplay(rank)}
                  </td>

                  {/* Team */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Link
                      href={teamPath(league, season, teamCode)}
                      className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-6 h-6 bg-surface-3 rounded-full flex items-center justify-center overflow-hidden">
                        {teamLogo ? (
                          <Image
                            src={teamLogo}
                            alt={teamName}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <span className="text-mute text-xs">🏒</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-ink">
                          {teamName}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Games Played */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm num text-soft text-center">
                    {gamesPlayed}
                  </td>

                  {/* Points */}
                  <td className="px-3 py-3 whitespace-nowrap display num font-bold text-ink text-lg text-center">
                    {points}
                  </td>

                  {/* Goal Difference */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm num text-center font-medium text-dim">
                    {goalDifference > 0 ? '+' : ''}
                    {goalDifference}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
