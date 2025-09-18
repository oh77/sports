'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StandingsData, TeamStats } from '../../types/standings';

interface CompactStandingsProps {
  standings: StandingsData;
  league: 'shl' | 'sdhl';
  teamCode1: string;
  teamCode2: string;
}

export function CompactStandings({ standings, league, teamCode1, teamCode2 }: CompactStandingsProps) {
  const getTeamCode = (team: TeamStats): string => {
    return team.info.teamNames.code;
  };

  const getTeamName = (team: TeamStats): string => {
    return team.info.teamNames.short;
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


  // Find teams and their neighbors
  const getCompactTeams = () => {
    if (!standings.stats?.length) return [];

    const teams = standings.stats;
    const selectedTeams = new Set<string>();
    const result: Array<{ team: TeamStats; index: number; rank: number }> = [];

    // Find the two target teams
    const team1Index = teams.findIndex(team => getTeamCode(team) === teamCode1);
    const team2Index = teams.findIndex(team => getTeamCode(team) === teamCode2);

    // Add teams and their neighbors
    [team1Index, team2Index].forEach(teamIndex => {
      if (teamIndex === -1) return; // Team not found

      const team = teams[teamIndex];
      const teamCode = getTeamCode(team);
      
      // Add the team itself
      if (!selectedTeams.has(teamCode)) {
        selectedTeams.add(teamCode);
        result.push({
          team,
          index: teamIndex,
          rank: team.Rank || teamIndex + 1
        });
      }

      // Add team above (if exists and not already added)
      if (teamIndex > 0) {
        const teamAbove = teams[teamIndex - 1];
        const teamAboveCode = getTeamCode(teamAbove);
        if (!selectedTeams.has(teamAboveCode)) {
          selectedTeams.add(teamAboveCode);
          result.push({
            team: teamAbove,
            index: teamIndex - 1,
            rank: teamAbove.Rank || teamIndex
          });
        }
      }

      // Add team below (if exists and not already added)
      if (teamIndex < teams.length - 1) {
        const teamBelow = teams[teamIndex + 1];
        const teamBelowCode = getTeamCode(teamBelow);
        if (!selectedTeams.has(teamBelowCode)) {
          selectedTeams.add(teamBelowCode);
          result.push({
            team: teamBelow,
            index: teamIndex + 1,
            rank: teamBelow.Rank || teamIndex + 2
          });
        }
      }
    });

    // Sort by rank to maintain standings order
    return result.sort((a, b) => a.rank - b.rank);
  };

  const compactTeams = getCompactTeams();

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

              return (
                <tr 
                  key={teamCode} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
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
                    {team.GP}
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
