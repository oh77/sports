'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StandingsData, TeamStats } from '../../../types/domain/standings';
import { League } from '@/app/types/domain/league';
import {
    getRankBorderClass,
    getRankDisplay,
    getTeamCode,
    getTeamName,
    getTeamLogo
} from "@/app/components/standings/standingsUtils";

interface CompactStandingsProps {
  standings: StandingsData;
  league: League;
  teamCode: string;
  opponentTeamCode?: string;
}

export function CompactStandings({ standings, league, teamCode, opponentTeamCode }: CompactStandingsProps) {

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
        return teams.findIndex(team => getTeamCode(team) === teamCode);
    }

    const getTeamIndices = () => {
        if (opponentTeamCode) {
            return [getTeamIndex(teamCode), getTeamIndex(opponentTeamCode)];
        }

        return [getTeamIndex(teamCode)];
      };

    // Add teams and their neighbors
  getTeamIndices().forEach(teamIndex => {
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
          rank
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
            rank: teamAboveRank
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
            rank: teamBelowRank
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
    const position = sortedTeams.findIndex(team => {
      return getTeamCode(team) === teamCode;
    });

    return position + 1; // Return 1-based position
  };

  const compactTeams = getCompactTeams();

  // Get total number of teams for colorization
  const totalTeams = standings.stats?.length || 0;

  if (!compactTeams.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          Ingen ligatabell tillgänglig för de valda lagen
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lag</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">M</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GM</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <td className={`px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 ${getRankBorderClass(league, fullPosition, totalTeams)}`}>
                    {getRankDisplay(rank)}
                  </td>

                  {/* Team */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Link
                      href={`/${league}/${encodeURIComponent(teamCode)}`}
                      className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        {teamLogo ? (
                          <Image
                            src={teamLogo}
                            alt={teamName}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">🏒</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{teamName}</div>
                      </div>
                    </Link>
                  </td>

                  {/* Games Played */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                    {gamesPlayed}
                  </td>

                  {/* Points */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                    {points}
                  </td>

                  {/* Goal Difference */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                    {goalDifference > 0 ? '+' : ''}{goalDifference}
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
