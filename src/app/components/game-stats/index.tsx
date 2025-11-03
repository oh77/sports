import React from 'react';
import type { GameInfo } from '@/app/types/domain/game';

interface HomeAwayStatsProps {
  games: GameInfo[];
  teamCode: string; // TeamCode
}

interface AggregatedStats {
  GP: number; // Games Played (finished)
  W: number; // Wins in regulation
  OTW: number; // Overtime/Shootout Wins
  OTL: number; // Overtime/Shootout Losses
  L: number; // Losses in regulation
  GF: number; // Goals For
  GA: number; // Goals Against
  GM: number; // Goal Margin (GF - GA)
}

function aggregateStats(games: GameInfo[], teamCode: string): AggregatedStats {
  let W = 0,
    OTW = 0,
    OTL = 0,
    L = 0,
    GF = 0,
    GA = 0;

  for (const g of games) {
    const isHome = g.homeTeamInfo.teamInfo.code === teamCode;
    const teamGoals = isHome ? g.homeTeamInfo.score : g.awayTeamInfo.score;
    const oppGoals = isHome ? g.awayTeamInfo.score : g.homeTeamInfo.score;

    if (typeof teamGoals === 'number' && typeof oppGoals === 'number') {
      GF += teamGoals;
      GA += oppGoals;

      const won = teamGoals > oppGoals;
      const wentOT = Boolean(g.overtime || g.shootout);

      if (won) {
        if (wentOT) OTW++;
        else W++;
      } else if (teamGoals < oppGoals) {
        if (wentOT) OTL++;
        else L++;
      }
    }
  }

  const GP = games.length;
  const GM = GF - GA;

  return { GP, W, OTW, OTL, L, GF, GA, GM };
}

export const HomeAwayStats: React.FC<HomeAwayStatsProps> = ({
  games,
  teamCode,
}) => {
  const stats = React.useMemo(
    () => aggregateStats(games, teamCode),
    [games, teamCode],
  );

  const getPoints = (stats: AggregatedStats) => {
    return stats.W * 3 + stats.OTW * 2 + stats.OTL;
  };
  // Display format: {Games Played} {W} {OTW} {OTL} {L} {GF} {GA} {GM}
  return (
    <div className="text-sm text-gray-800">
      <table className="w-full">
        <tbody className="bg-white divide-y divide-gray-200">
          <tr key={teamCode} className="hover:bg-gray-50 transition-colors">
            {/*<td className="hidden md:table-cell px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-center">*/}
            {/*    {stats.GP}*/}
            {/*</td>*/}
            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
              {stats.W}
            </td>
            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
              <span className="hidden md:table-cell">
                {stats.OTW} | {stats.OTL}
              </span>
              <span className="md:hidden">{stats.OTW + stats.OTL}</span>
            </td>
            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
              {stats.L}
            </td>
            <td className="hidden md:table-cell px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
              {stats.GF}-{stats.GA}
            </td>
            <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-medium text-gray-900">
              {stats.GM > 0 ? '+' : ''}
              {stats.GM}
            </td>

            {/* Points */}
            <td className="hidden md:table-cell px-3 py-3 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
              {getPoints(stats)} p
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default HomeAwayStats;

// Helper export in case other components need raw numbers
export { aggregateStats };
