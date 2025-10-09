'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StandingsData, TeamStats } from '../../types/domain/standings';
import { getTeamLogoWithFallback } from '../../utils/teamLogos';

interface FullStandingsProps {
  standings: StandingsData;
  league: 'shl' | 'sdhl' | 'chl';
}

export function FullStandings({ standings, league }: FullStandingsProps) {
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
    const teams = standings.stats || [];

    // Sort by rank first, then by goal difference descending
    return teams.sort((a, b) => {
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
  };

  const getRankBorderClass = (tablePosition: number, totalTeams: number): string => {
    if (league === 'shl') {
      // SHL: playoff (top 6), playoff qualification (next 4), relegation (last 2)
      if (tablePosition <= 6) return 'border-r-4 border-yellow-400'; // Playoff spots
      if (tablePosition <= 10) return 'border-r-4 border-blue-400'; // Playoff qualification
      if (tablePosition >= totalTeams - 1) return 'border-r-4 border-red-400'; // Relegation zone
    } else if (league === 'sdhl') {
      // SDHL: playoff (top 8), no playoff qualification, relegation (last 2)
      if (tablePosition <= 8) return 'border-r-4 border-yellow-400'; // Playoff spots
      if (tablePosition >= totalTeams - 1) return 'border-r-4 border-red-400'; // Relegation zone
    } else if (league === 'chl') {
      // CHL: playoff (top 16), no playoff qualification, no relegation
      if (tablePosition <= 16) return 'border-r-4 border-yellow-400'; // Playoff spots
    }
    return '';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-800 text-white px-6 py-4">
          <h2 className="text-2xl font-bold text-center">Ligatabell</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lag</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">M</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">V</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">O</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">F</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">G</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GA</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GM</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getTeams().length ? getTeams().map((team, index) => {
                const teamCode = getTeamCode(team);
                const teamName = getTeamName(team);
                const teamLogo = league === 'chl' 
                  ? getTeamLogoWithFallback({
                      shortName: team.info.code,
                      externalId: team.info.externalId
                    })
                  : getTeamLogo(team);
                const points = getPoints(team);
                const goalDifference = team.G - team.GA;
                const actualRank = team.Rank || index + 1;
                const gamesPlayed = team.GP;
                const wins = team.W;
                const ties = team.T;
                const losses = team.L;
                const goalsFor = team.G;
                const goalsAgainst = team.GA;
                const fullTeamName = team.info.full;

                return (
                  <tr
                    key={teamCode}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Rank */}
                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${getRankBorderClass(index + 1, getTeams().length)}`}>
                      {getRankDisplay(actualRank)}
                    </td>

                    {/* Team */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link
                        href={`/${league}/${encodeURIComponent(teamCode)}`}
                        className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {teamLogo ? (
                            <Image
                              src={teamLogo}
                              alt={teamName}
                              width={32}
                              height={32}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">🏒</span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{teamName}</div>
                          <div className="text-xs text-gray-500">{fullTeamName}</div>
                        </div>
                      </Link>
                    </td>

                    {/* Games Played */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {gamesPlayed}
                    </td>

                    {/* Wins */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                      {wins}
                    </td>

                    {/* Ties */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {ties}
                    </td>

                    {/* Losses */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {losses}
                    </td>

                    {/* Points */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      {points}
                    </td>

                    {/* Goals For */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                      {goalsFor}
                    </td>

                    {/* Goals Against */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {goalsAgainst}
                    </td>

                    {/* Goal Difference */}
                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-center font-medium ${
                      goalDifference > 0 ? 'text-green-600' : 
                      goalDifference < 0 ? 'text-red-600' : 
                      'text-gray-900'
                    }`}>
                      {goalDifference > 0 ? '+' : ''}{goalDifference}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    Ingen ligatabell tillgänglig
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-200 rounded"></div>
              <span>
                {league === 'shl' ? 'Topp 6 (Slutspel)' :
                 league === 'sdhl' ? 'Topp 8 (Slutspel)' :
                 'Topp 16 (Playoffs)'}
              </span>
            </div>
            {league === 'shl' && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-200 rounded"></div>
                <span>Kvalspel (7-10)</span>
              </div>
            )}
            {league !== 'chl' && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-200 rounded"></div>
                <span>Nedflyttning/Kval (sista 2)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
