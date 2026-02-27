'use client';

import Image from 'next/image';
import React, { useMemo } from 'react';
import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import type { TeamInfo } from '@/app/types/domain/team';

interface GoalDistributionTableProps {
  league: League;
  games: GameInfo[];
}

const GOAL_COLUMNS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function heatmapStyle(
  count: number,
  max: number,
  type: 'scored' | 'conceded',
): React.CSSProperties {
  if (count === 0 || max === 0) return {};
  const intensity = count / max;
  // Green for scored, red for conceded — scale alpha from 0.1 to 0.65
  const alpha = 0.1 + intensity * 0.55;
  const color =
    type === 'scored'
      ? `rgba(34, 197, 94, ${alpha})`  // green-500
      : `rgba(239, 68, 68, ${alpha})`; // red-500
  return { backgroundColor: color };
}

function getDistribution(
  games: GameInfo[],
  teamCode: string,
): { scored: number[]; conceded: number[] } {
  const scored = new Array(10).fill(0);
  const conceded = new Array(10).fill(0);

  for (const game of games) {
    if (game.state !== 'finished') continue;

    let goalsFor: number | undefined;
    let goalsAgainst: number | undefined;

    if (game.homeTeamInfo.teamInfo.code === teamCode) {
      goalsFor = game.homeTeamInfo.score;
      goalsAgainst = game.awayTeamInfo.score;
    } else if (game.awayTeamInfo.teamInfo.code === teamCode) {
      goalsFor = game.awayTeamInfo.score;
      goalsAgainst = game.homeTeamInfo.score;
    }

    if (goalsFor === undefined || goalsAgainst === undefined) continue;

    const scoredIdx = Math.min(goalsFor, 9);
    const concededIdx = Math.min(goalsAgainst, 9);
    scored[scoredIdx]++;
    conceded[concededIdx]++;
  }

  return { scored, conceded };
}

export function GoalDistributionTable({
  league: _league,
  games,
}: GoalDistributionTableProps) {
  const teams = useMemo(() => {
    const teamMap = new Map<string, TeamInfo>();
    for (const game of games) {
      if (game.state !== 'finished') continue;
      const home = game.homeTeamInfo.teamInfo;
      const away = game.awayTeamInfo.teamInfo;
      if (!teamMap.has(home.code)) teamMap.set(home.code, home);
      if (!teamMap.has(away.code)) teamMap.set(away.code, away);
    }
    return Array.from(teamMap.values()).sort((a, b) =>
      a.long.localeCompare(b.long, 'sv'),
    );
  }, [games]);

  const { distributions, maxScored, maxConceded } = useMemo(() => {
    const dists = teams.map((team) => ({
      team,
      ...getDistribution(games, team.code),
    }));
    let mxS = 0;
    let mxC = 0;
    for (const d of dists) {
      for (const v of d.scored) mxS = Math.max(mxS, v);
      for (const v of d.conceded) mxC = Math.max(mxC, v);
    }
    return { distributions: dists, maxScored: mxS, maxConceded: mxC };
  }, [games, teams]);

  if (teams.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 text-center text-gray-500">
            Ingen matchdata tillgänglig
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Mål
                </th>
                {GOAL_COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col === 9 ? '9+' : col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {distributions.map(({ team, scored, conceded }) => (
                <React.Fragment key={team.code}>
                  {/* Team divider row */}
                  <tr className="bg-gray-50 border-t-2 border-gray-300">
                    <td
                      colSpan={11}
                      className="px-4 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {team.logo && (
                          <Image
                            src={team.logo}
                            alt={team.full}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <span className="text-sm font-semibold text-gray-800">
                          {team.long}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Scored row */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      Gjorda
                    </td>
                    {scored.map((count, idx) => (
                      <td
                        key={idx}
                        className={`px-3 py-2 text-center text-sm ${
                          count > 0
                            ? 'font-semibold text-gray-900'
                            : 'text-gray-300'
                        }`}
                        style={heatmapStyle(count, maxScored, 'scored')}
                      >
                        {count}
                      </td>
                    ))}
                  </tr>
                  {/* Conceded row */}
                  <tr className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      Insläppta
                    </td>
                    {conceded.map((count, idx) => (
                      <td
                        key={idx}
                        className={`px-3 py-2 text-center text-sm ${
                          count > 0
                            ? 'font-semibold text-gray-900'
                            : 'text-gray-300'
                        }`}
                        style={heatmapStyle(count, maxConceded, 'conceded')}
                      >
                        {count}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
