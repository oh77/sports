'use client';

import Image from 'next/image';
import Link from 'next/link';

interface StandingsData {
  dataColumns: Array<{
    name: string;
    type: string;
    highlighted: boolean;
    group: string;
  }>;
  stats: Array<{
    Rank: number | null;
    Team: number;
    GP: number;
    W: number;
    T: number;
    L: number;
    G: number;
    GPG: string;
    GA: number;
    GAPG: string;
    OTW: number;
    OTL: number;
    SOW: number;
    SOL: number;
    info: {
      teamNames: {
        code: string;
        short: string;
        long: string;
        full: string;
      };
      logo: string;
    };
  }>;
}

interface FullStandingsProps {
  standings: StandingsData;
  league: 'shl' | 'sdhl';
}

export function FullStandings({ standings, league }: FullStandingsProps) {
  const getTeamCode = (team: any): string => {
    return team.info.teamNames.code;
  };

  const getTeamName = (team: any): string => {
    return team.info.teamNames.short;
  };

  const getTeamLogo = (team: any): string => {
    return team.info.logo;
  };

  const getRankDisplay = (rank: number | null): string => {
    if (rank === null) return '-';
    return rank.toString();
  };

  const getPoints = (team: any): number => {
    // Calculate points: 3 for win, 1 for tie, 0 for loss
    return (team.W * 3) + (team.T * 1);
  };

  const getTeamRowClass = (actualRank: number, totalTeams: number): string => {
    if (league === 'shl') {
      // SHL: playoff (top 6), playoff qualification (next 4), relegation (last 2)
      if (actualRank <= 6) return 'bg-yellow-50'; // Playoff spots
      if (actualRank <= 10) return 'bg-blue-50'; // Playoff qualification
      if (actualRank >= totalTeams - 1) return 'bg-red-50'; // Relegation zone
    } else if (league === 'sdhl') {
      // SDHL: playoff (top 8), no playoff qualification, relegation (last 2)
      if (actualRank <= 8) return 'bg-yellow-50'; // Playoff spots
      if (actualRank >= totalTeams - 1) return 'bg-red-50'; // Relegation zone
    }
    return '';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-800 text-white px-6 py-4">
          <h2 className="text-2xl font-bold text-center">League Standings</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GP</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">T</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PTS</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">G</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GA</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GD</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.stats?.length ? standings.stats.map((team, index) => {
                const teamCode = getTeamCode(team);
                const teamName = getTeamName(team);
                const teamLogo = getTeamLogo(team);
                const points = getPoints(team);
                const goalDifference = team.G - team.GA;
                const actualRank = team.Rank || index + 1;

                return (
                  <tr 
                    key={teamCode} 
                    className={`hover:bg-gray-50 transition-colors ${getTeamRowClass(actualRank, standings.stats?.length || 0)}`}
                  >
                    {/* Rank */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                          <div className="text-xs text-gray-500">{team.info.teamNames.full}</div>
                        </div>
                      </Link>
                    </td>

                    {/* Games Played */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {team.GP}
                    </td>

                    {/* Wins */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                      {team.W}
                    </td>

                    {/* Ties */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {team.T}
                    </td>

                    {/* Losses */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {team.L}
                    </td>

                    {/* Points */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      {points}
                    </td>

                    {/* Goals For */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                      {team.G}
                    </td>

                    {/* Goals Against */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {team.GA}
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
                    No standings data available
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
                {league === 'shl' ? 'Top 6 (Playoff spots)' : 'Top 8 (Playoff spots)'}
              </span>
            </div>
            {league === 'shl' && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-200 rounded"></div>
                <span>Playoff qualification (7-10)</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-200 rounded"></div>
              <span>Relegation zone (last 2)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
