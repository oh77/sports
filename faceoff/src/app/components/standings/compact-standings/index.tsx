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
  /**
   * Single-team mode: always show this many rows around the team, shifted
   * down at the top of the table and up at the bottom (1st → the four below).
   * Ignored when an opponent is given.
   */
  rows?: number;
}

export function CompactStandings({
  standings,
  league,
  teamCode,
  opponentTeamCode,
  rows,
}: CompactStandingsProps) {
  const season = useSeason();
  const getTeams = () => {
    return standings.stats || [];
  };

  // Find teams and their neighbors
  const getCompactTeams = () => {
    const teams = getTeams();
    if (!teams.length) return [];

    if (rows && !opponentTeamCode) {
      return windowAround(teams, teamCode, rows);
    }

    const codes = opponentTeamCode ? [teamCode, opponentTeamCode] : [teamCode];
    return excerptAround(teams, codes);
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
                GM
              </th>
              <th className="px-3 py-2 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                P
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
                            unoptimized
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

                  {/* Goal Difference */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm num text-center font-medium text-dim">
                    {goalDifference > 0 ? '+' : ''}
                    {goalDifference}
                  </td>

                  {/* Points */}
                  <td className="px-3 py-3 whitespace-nowrap display num font-bold text-ink text-lg text-center">
                    {points}
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

/** Table order: rank, then goal difference — as FullStandings sorts. */
function byTableOrder(a: TeamStats, b: TeamStats): number {
  const aRank = a.Rank || 0;
  const bRank = b.Rank || 0;
  if (aRank !== bRank) return aRank - bRank;
  return b.G - b.GA - (a.G - a.GA);
}

/** Tables this small are always shown whole. */
const SMALL_TABLE = 4;

/** Rows kept below 1st and above last when a shown team holds either. */
const EDGE_ROWS = 2;

/**
 * Each team's row plus its neighbours above and below, merged in table order.
 * A team in 1st also brings 2nd and 3rd, a team in last the two places above
 * it, and a table of four or fewer is shown whole.
 */
function excerptAround(
  teams: TeamStats[],
  codes: string[],
): Array<{ team: TeamStats; index: number; rank: number }> {
  const ordered = [...teams].sort(byTableOrder);
  const last = ordered.length - 1;
  const picked = new Set<number>();
  for (const code of codes) {
    const i = ordered.findIndex((team) => getTeamCode(team) === code);
    if (i === -1) continue;
    let from = i - 1;
    let to = i + 1;
    if (ordered.length <= SMALL_TABLE) {
      from = 0;
      to = last;
    }
    if (i === 0) to = Math.max(to, EDGE_ROWS);
    if (i === last) from = Math.min(from, last - EDGE_ROWS);
    for (let j = Math.max(from, 0); j <= Math.min(to, last); j++) picked.add(j);
  }
  return [...picked]
    .sort((a, b) => a - b)
    .map((index) => ({
      team: ordered[index],
      index,
      rank: ordered[index].Rank || index + 1,
    }));
}

/**
 * `size` consecutive table rows containing the team, as centred on it as the
 * table's ends allow. Empty when the team isn't in the table.
 */
function windowAround(
  teams: TeamStats[],
  teamCode: string,
  size: number,
): Array<{ team: TeamStats; index: number; rank: number }> {
  const ordered = [...teams].sort(byTableOrder);
  const index = ordered.findIndex((team) => getTeamCode(team) === teamCode);
  if (index === -1) return [];

  const start = Math.max(
    0,
    Math.min(index - Math.floor(size / 2), ordered.length - size),
  );
  return ordered.slice(start, start + size).map((team, offset) => ({
    team,
    index: start + offset,
    rank: team.Rank || start + offset + 1,
  }));
}
