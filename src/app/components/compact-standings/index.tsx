'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StandingsData, TeamStats } from '../../types/standings';
import { CHLStandingsDataTransformed, CHLStandingsTeam } from '../../types/chl-standings';
import { getTeamLogoWithFallback } from '../../utils/teamLogos';

interface CompactStandingsProps {
  standings: StandingsData | CHLStandingsDataTransformed;
  league: 'shl' | 'sdhl' | 'chl';
  teamCode1: string;
  teamCode2: string;
}

export function CompactStandings({ standings, league, teamCode1, teamCode2 }: CompactStandingsProps) {
  // Helper functions for SHL/SDHL data
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

  // Helper functions for CHL data
  const getCHLTeamCode = (team: CHLStandingsTeam): string => {
    return team.shortName;
  };

  const getCHLTeamName = (team: CHLStandingsTeam): string => {
    return team.shortName;
  };

  const getCHLTeamLogo = (team: CHLStandingsTeam): string | undefined => {
    return team.logo;
  };

  const getCHLPoints = (team: CHLStandingsTeam): number => {
    return team.points;
  };

  // Universal helper functions
  const isCHLData = (data: StandingsData | CHLStandingsDataTransformed): data is CHLStandingsDataTransformed => {
    return 'teams' in data && Array.isArray(data.teams) && data.teams.length > 0 && 'rank' in data.teams[0];
  };

  const getTeams = () => {
    if (isCHLData(standings)) {
      return standings.teams;
    }
    return standings.stats || [];
  };


  // Find teams and their neighbors
  const getCompactTeams = () => {
    const teams = getTeams();
    if (!teams.length) return [];

    const selectedTeams = new Set<string>();
    const result: Array<{ team: TeamStats | CHLStandingsTeam; index: number; rank: number }> = [];

    // Find the two target teams
    const team1Index = teams.findIndex(team => {
      if (isCHLData(standings)) {
        return getCHLTeamCode(team as CHLStandingsTeam) === teamCode1;
      } else {
        return getTeamCode(team as TeamStats) === teamCode1;
      }
    });
    const team2Index = teams.findIndex(team => {
      if (isCHLData(standings)) {
        return getCHLTeamCode(team as CHLStandingsTeam) === teamCode2;
      } else {
        return getTeamCode(team as TeamStats) === teamCode2;
      }
    });

    // Add teams and their neighbors
    [team1Index, team2Index].forEach(teamIndex => {
      if (teamIndex === -1) return; // Team not found

      const team = teams[teamIndex];
      let teamCode: string;
      let rank: number;

      if (isCHLData(standings)) {
        const chlTeam = team as CHLStandingsTeam;
        teamCode = getCHLTeamCode(chlTeam);
        rank = chlTeam.rank;
      } else {
        const shlTeam = team as TeamStats;
        teamCode = getTeamCode(shlTeam);
        rank = shlTeam.Rank || teamIndex + 1;
      }
      
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
        let teamAboveCode: string;
        let teamAboveRank: number;

        if (isCHLData(standings)) {
          const chlTeamAbove = teamAbove as CHLStandingsTeam;
          teamAboveCode = getCHLTeamCode(chlTeamAbove);
          teamAboveRank = chlTeamAbove.rank;
        } else {
          const shlTeamAbove = teamAbove as TeamStats;
          teamAboveCode = getTeamCode(shlTeamAbove);
          teamAboveRank = shlTeamAbove.Rank || teamIndex;
        }

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
        let teamBelowCode: string;
        let teamBelowRank: number;

        if (isCHLData(standings)) {
          const chlTeamBelow = teamBelow as CHLStandingsTeam;
          teamBelowCode = getCHLTeamCode(chlTeamBelow);
          teamBelowRank = chlTeamBelow.rank;
        } else {
          const shlTeamBelow = teamBelow as TeamStats;
          teamBelowCode = getTeamCode(shlTeamBelow);
          teamBelowRank = shlTeamBelow.Rank || teamIndex + 2;
        }

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
      let aGoalDiff: number;
      let bGoalDiff: number;
      
      if (isCHLData(standings)) {
        aGoalDiff = (a.team as CHLStandingsTeam).goalDifference;
        bGoalDiff = (b.team as CHLStandingsTeam).goalDifference;
      } else {
        const aTeam = a.team as TeamStats;
        const bTeam = b.team as TeamStats;
        aGoalDiff = aTeam.G - aTeam.GA;
        bGoalDiff = bTeam.G - bTeam.GA;
      }
      
      return bGoalDiff - aGoalDiff; // Descending order
    });
  };

  // Helper function to get full standings position for a team
  const getFullStandingsPosition = (teamCode: string): number => {
    let allTeams;
    if (isCHLData(standings)) {
      allTeams = standings.teams;
    } else {
      allTeams = standings.stats || [];
    }
    
    // Sort all teams the same way as FullStandings
    const sortedTeams = allTeams.sort((a, b) => {
      // First sort by rank
      let aRank: number;
      let bRank: number;
      
      if (isCHLData(standings)) {
        aRank = (a as CHLStandingsTeam).rank;
        bRank = (b as CHLStandingsTeam).rank;
      } else {
        aRank = (a as TeamStats).Rank || 0;
        bRank = (b as TeamStats).Rank || 0;
      }
      
      if (aRank !== bRank) {
        return aRank - bRank;
      }
      
      // If ranks are equal, sort by goal difference (descending)
      let aGoalDiff: number;
      let bGoalDiff: number;
      
      if (isCHLData(standings)) {
        aGoalDiff = (a as CHLStandingsTeam).goalDifference;
        bGoalDiff = (b as CHLStandingsTeam).goalDifference;
      } else {
        const aTeam = a as TeamStats;
        const bTeam = b as TeamStats;
        aGoalDiff = aTeam.G - aTeam.GA;
        bGoalDiff = bTeam.G - bTeam.GA;
      }
      
      return bGoalDiff - aGoalDiff; // Descending order
    });
    
    // Find the position of the team
    const position = sortedTeams.findIndex(team => {
      if (isCHLData(standings)) {
        return (team as CHLStandingsTeam).shortName === teamCode;
      } else {
        return (team as TeamStats).info.teamNames.code === teamCode;
      }
    });
    
    return position + 1; // Return 1-based position
  };

  const compactTeams = getCompactTeams();
  
  // Get total number of teams for colorization
  const totalTeams = isCHLData(standings) ? standings.teams.length : (standings.stats?.length || 0);

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
            {compactTeams.map(({ team, rank }, index) => {
              let teamCode: string;
              let teamName: string;
              let teamLogo: string | undefined;
              let points: number;
              let goalDifference: number;
              let gamesPlayed: number;

              if (isCHLData(standings)) {
                const chlTeam = team as CHLStandingsTeam;
                teamCode = getCHLTeamCode(chlTeam);
                teamName = getCHLTeamName(chlTeam);
                teamLogo = getTeamLogoWithFallback({
                  shortName: chlTeam.shortName,
                  externalId: chlTeam.externalId
                });
                points = getCHLPoints(chlTeam);
                goalDifference = chlTeam.goalDifference;
                gamesPlayed = chlTeam.gamesPlayed;
              } else {
                const shlTeam = team as TeamStats;
                teamCode = getTeamCode(shlTeam);
                teamName = getTeamName(shlTeam);
                teamLogo = getTeamLogo(shlTeam);
                points = getPoints(shlTeam);
                goalDifference = shlTeam.G - shlTeam.GA;
                gamesPlayed = shlTeam.GP;
              }

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
