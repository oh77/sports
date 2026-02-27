'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import type { TeamInfo } from '@/app/types/domain/team';
import { formatShortDateFromString } from '@/app/utils/dateUtils';

interface UpcomingGamesTableProps {
  league: League;
  games: GameInfo[];
}

/** Normalize a datetime string to a YYYY-MM-DD date key */
function toDateKey(dateTimeStr: string): string {
  return dateTimeStr.slice(0, 10);
}

interface UpcomingEntry {
  opponent: TeamInfo;
  isHome: boolean;
  dateKey: string;
  date: string;
}

export function UpcomingGamesTable({
  league: _league,
  games,
}: UpcomingGamesTableProps) {
  const teams = useMemo(() => {
    const teamMap = new Map<string, TeamInfo>();
    for (const game of games) {
      const home = game.homeTeamInfo.teamInfo;
      const away = game.awayTeamInfo.teamInfo;
      if (!teamMap.has(home.code)) teamMap.set(home.code, home);
      if (!teamMap.has(away.code)) teamMap.set(away.code, away);
    }
    return Array.from(teamMap.values()).sort((a, b) =>
      a.long.localeCompare(b.long, 'sv'),
    );
  }, [games]);

  // Build per-team upcoming map keyed by date
  const { rows, dateCols, padCount } = useMemo(() => {
    const upcomingGames = games
      .filter((g) => g.state === 'not-started')
      .sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime(),
      );

    // Collect all unique date keys from upcoming games, sorted chronologically
    const dateSet = new Set<string>();
    for (const g of upcomingGames) {
      dateSet.add(toDateKey(g.startDateTime));
    }
    const allDates = Array.from(dateSet).sort();

    // For each team, build a map of dateKey -> entry
    const teamRows = teams.map((team) => {
      const entryMap = new Map<string, UpcomingEntry>();
      for (const g of upcomingGames) {
        const isHome = g.homeTeamInfo.teamInfo.code === team.code;
        const isAway = g.awayTeamInfo.teamInfo.code === team.code;
        if (!isHome && !isAway) continue;

        const dateKey = toDateKey(g.startDateTime);
        if (entryMap.has(dateKey)) continue; // one game per date per team
        entryMap.set(dateKey, {
          opponent: isHome
            ? g.awayTeamInfo.teamInfo
            : g.homeTeamInfo.teamInfo,
          isHome,
          dateKey,
          date: g.startDateTime,
        });
      }
      return { team, entryMap };
    });

    // Limit to dates where at least one team has a game, take first N
    // To keep the table reasonable, find the date by which every team has at least 10 games
    // or just cap at a reasonable number of date columns
    const MAX_DATE_COLS = 20;
    const limitedDates = allDates.slice(0, MAX_DATE_COLS);

    const padCount = Math.max(0, MAX_DATE_COLS - limitedDates.length);
    return { rows: teamRows, dateCols: limitedDates, padCount };
  }, [games, teams]);

  if (teams.length === 0 || dateCols.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 text-center text-gray-500">
            Inga kommande matcher tillgängliga
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Legend */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-5 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-5 rounded-full border-3 border-blue-400" />
            <span>Hemma</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-5 rounded-full border-3 border-orange-400" />
            <span>Borta</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 sticky left-0 bg-gray-100 z-10">
                  Lag
                </th>
                {dateCols.map((dateKey) => (
                  <th
                    key={dateKey}
                    className="px-2 py-3 text-center text-[10px] font-medium text-gray-500 tracking-wider whitespace-nowrap"
                  >
                    {formatShortDateFromString(dateKey)}
                  </th>
                ))}
                {Array.from({ length: padCount }, (_, i) => (
                  <th key={`pad-${i}`} className="px-2 py-3" />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map(({ team, entryMap }) => (
                <tr key={team.code} className="hover:bg-gray-50 transition-colors">
                  {/* Team logo */}
                  <td className="px-4 py-2 sticky left-0 bg-white z-10">
                    <div className="w-10 h-10 flex items-center justify-center">
                      {team.logo ? (
                        <Image
                          src={team.logo}
                          alt={team.full}
                          title={team.long}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-600">
                          {team.short}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Opponent logos per date */}
                  {dateCols.map((dateKey) => {
                    const entry = entryMap.get(dateKey);
                    if (!entry) {
                      return (
                        <td key={dateKey} className="px-2 py-2 text-center">
                          <div className="w-10 h-10 mx-auto" />
                        </td>
                      );
                    }
                    return (
                      <td key={dateKey} className="px-2 py-2 text-center">
                        <div
                          className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full overflow-hidden ${
                            entry.isHome
                              ? 'border-3 border-blue-400'
                              : 'border-3 border-orange-400'
                          }`}
                          title={`${entry.isHome ? 'Hemma' : 'Borta'} mot ${entry.opponent.long}`}
                        >
                          {entry.opponent.logo ? (
                            <Image
                              src={entry.opponent.logo}
                              alt={entry.opponent.full}
                              width={32}
                              height={32}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-gray-600">
                              {entry.opponent.short}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  {Array.from({ length: padCount }, (_, i) => (
                    <td key={`pad-${i}`} className="px-2 py-2" />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
