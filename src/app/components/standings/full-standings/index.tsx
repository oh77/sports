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
import type { StandingsData } from '@/app/types/domain/standings';
import type { StandingsFilter } from '@/app/types/domain/standingsFilter';
import { teamPath } from '@/app/utils/leaguePaths';
import { useSeason } from '@/app/utils/useSeason';

interface FullStandingsProps {
  standings: StandingsData;
  league: League;
  filter?: StandingsFilter | undefined;
}

export function FullStandings({ standings, league }: FullStandingsProps) {
  const season = useSeason();
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="rounded-lg border border-line bg-surface overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2 border-b border-line">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-mute display uppercase tracking-[0.06em]">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs text-mute display uppercase tracking-[0.06em]">
                  Lag
                </th>
                <th className="px-4 py-3 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                  M
                </th>
                <th className="px-4 py-3 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                  V
                </th>
                <th className="px-4 py-3 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                  O
                </th>
                <th className="px-4 py-3 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                  F
                </th>
                <th className="px-4 py-3 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                  P
                </th>
                <th className="px-4 py-3 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                  G
                </th>
                <th className="px-4 py-3 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                  GA
                </th>
                <th className="px-4 py-3 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                  GM
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {getTeams().length ? (
                getTeams().map((team, index) => {
                  const teamCode = getTeamCode(team);
                  const teamName = getTeamName(team);
                  const teamLogo = getTeamLogo(team);
                  const points = team.Points;
                  const goalDifference = team.G - team.GA;
                  const actualRank = team.Rank || index + 1;
                  const gamesPlayed = team.GP;
                  const wins = team.W;
                  const tiesText =
                    team.OTW === null && team.OTL === null
                      ? `${team.T}`
                      : `${team.OTW || 0} | ${team.OTL || 0}`;
                  const losses = team.L;
                  const goalsFor = team.G;
                  const goalsAgainst = team.GA;
                  const fullTeamName = team.info.full;

                  return (
                    <tr
                      key={teamCode}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Rank */}
                      <td
                        className={`px-4 py-4 whitespace-nowrap text-sm display text-ink ${getRankBorderClass(league, index + 1, getTeams().length)}`}
                      >
                        {getRankDisplay(actualRank)}
                      </td>

                      {/* Team */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link
                          href={teamPath(league, season, teamCode)}
                          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                        >
                          <div className="w-8 h-8 bg-surface-3 rounded-full flex items-center justify-center overflow-hidden">
                            {teamLogo ? (
                              <Image
                                src={teamLogo}
                                alt={teamName}
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                              />
                            ) : (
                              <span className="text-mute text-sm">🏒</span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-ink">
                              {teamName}
                            </div>
                            <div className="text-xs text-mute">
                              {fullTeamName}
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Games Played */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm num text-soft text-center">
                        {gamesPlayed}
                      </td>

                      {/* Wins */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm num text-soft text-center font-medium">
                        {wins}
                      </td>

                      {/* Overtime wins */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm num text-soft text-center">
                        {tiesText}
                      </td>

                      {/* Losses */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm num text-soft text-center">
                        {losses}
                      </td>

                      {/* Points */}
                      <td className="px-4 py-4 whitespace-nowrap display num font-bold text-ink text-lg text-center">
                        {points}
                      </td>

                      {/* Goals For */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm num text-soft text-center font-medium">
                        {goalsFor}
                      </td>

                      {/* Goals Against */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm num text-soft text-center">
                        {goalsAgainst}
                      </td>

                      {/* Goal Difference */}
                      <td
                        className={`px-4 py-4 whitespace-nowrap text-sm num text-center font-medium ${
                          goalDifference > 0
                            ? 'text-win'
                            : goalDifference < 0
                              ? 'text-loss'
                              : 'text-dim'
                        }`}
                      >
                        {goalDifference > 0 ? '+' : ''}
                        {goalDifference}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-dim">
                    Ingen ligatabell tillgänglig
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="bg-surface-2 border-t border-line px-6 py-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-dim">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-win rounded"></div>
              <span>{league === 'chl' ? 'Playoff' : 'Slutspel'}</span>
            </div>
            {league === 'shl' && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-otl rounded"></div>
                <span>Kval</span>
              </div>
            )}
            {league !== 'chl' && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-loss rounded"></div>
                <span>Kval</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
