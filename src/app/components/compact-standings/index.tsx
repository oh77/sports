'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StandingsData, TeamStats } from '../../types/domain/standings';

interface CompactStandingsProps {
  standings: StandingsData;
  league: 'shl' | 'sdhl' | 'chl';
  teamCode1: string;
  teamCode2: string;
}

export function CompactStandings({ standings, league, teamCode1, teamCode2 }: CompactStandingsProps) {
  // Helper functions for domain data
  const getTeamCode = (team: TeamStats): string => {
    return team.info.code;
  };

  const getTeamName = (team: TeamStats): string => {
    return team.info.short;
  };

  const getTeamLogo = (team: TeamStats): string => {
    return team.info.logo;
  };

  const getRankDisplay = (rank: number | null): string => {
    if (rank === null) return '-';
    return rank.toString();
  };

  const getPoints = (team: TeamStats): number => {
    // Calculate points: 3 for win, 1 for tie, 0 for loss
    return (team.W * 3) + (team.T * 1);
  };

  const getTeams = () => {
    return standings.stats || [];
  };


  // Find teams and their neighbors
  const getCompactTeams = () => {
    const teams = getTeams();
    if (!teams.length) return [];

    const selectedTeams = new Set<string>();
    const result: Array<{ team: TeamStats; index: number; rank: number }> = [];

    // Find the two target teams
    const team1Index = teams.findIndex(team => {
      return getTeamCode(team) === teamCode1;
    });
    const team2Index = teams.findIndex(team => {
      return getTeamCode(team) === teamCode2;
    });

    // Add teams and their neighbors
    [team1Index, team2Index].forEach(teamIndex => {
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

  // Helper function for rank column border based on full standings position
  const getRankBorderClass = (teamCode: string, totalTeams: number): string => {
    const fullPosition = getFullStandingsPosition(teamCode);

    if (league === 'shl') {
      // SHL: playoff (top 6), playoff qualification (next 4), relegation (last 2)
      if (fullPosition <= 6) return 'border-r-4 border-yellow-400'; // Playoff spots
      if (fullPosition <= 10) return 'border-r-4 border-blue-400'; // Playoff qualification
      if (fullPosition >= totalTeams - 1) return 'border-r-4 border-red-400'; // Relegation zone
    } else if (league === 'sdhl') {
      // SDHL: playoff (top 8), no playoff qualification, relegation (last 2)
      if (fullPosition <= 8) return 'border-r-4 border-yellow-400'; // Playoff spots
      if (fullPosition >= totalTeams - 1) return 'border-r-4 border-red-400'; // Relegation zone
    } else if (league === 'chl') {
      // CHL: playoff (top 16), no playoff qualification, no relegation
      if (fullPosition <= 16) return 'border-r-4 border-yellow-400'; // Playoff spots
    }
    return '';
  };

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
              const points = getPoints(team);
              const goalDifference = team.G - team.GA;
              const gamesPlayed = team.GP;

              return (
                <tr
                  key={teamCode}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <td className={`px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 ${getRankBorderClass(teamCode, totalTeams)}`}>
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
