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

/** How many upcoming games to show per team. */
const GAME_COUNT = 10;

interface UpcomingEntry {
  opponent: TeamInfo;
  isHome: boolean;
  startDateTime: string;
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

  // Each team's next games in order; columns are game slots, not dates.
  const rows = useMemo(() => {
    const upcomingGames = games
      .filter((g) => g.state === 'not-started')
      .sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime(),
      );

    return teams.map((team) => {
      const entries: UpcomingEntry[] = [];
      for (const g of upcomingGames) {
        if (entries.length === GAME_COUNT) break;
        const isHome = g.homeTeamInfo.teamInfo.code === team.code;
        const isAway = g.awayTeamInfo.teamInfo.code === team.code;
        if (!isHome && !isAway) continue;
        entries.push({
          opponent: isHome ? g.awayTeamInfo.teamInfo : g.homeTeamInfo.teamInfo,
          isHome,
          startDateTime: g.startDateTime,
        });
      }
      return { team, entries };
    });
  }, [games, teams]);

  const slots = Array.from({ length: GAME_COUNT }, (_, i) => i);

  if (rows.every((row) => row.entries.length === 0)) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="p-8 text-center text-dim">
            Inga kommande matcher tillgängliga
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="rounded-lg border border-line bg-surface overflow-hidden">
        {/* Legend */}
        <div className="px-4 py-3 bg-surface-2 border-b border-line flex items-center gap-5 text-xs text-dim">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-5 rounded-full border-3 border-accent" />
            <span>Hemma</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-5 rounded-full border-3 border-otl" />
            <span>Borta</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2 border-b border-line">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-mute display uppercase tracking-[0.06em] w-16 sticky left-0 bg-surface-2 z-10">
                  Lag
                </th>
                {slots.map((slot) => (
                  <th
                    key={slot}
                    className="px-1.5 py-3 text-center text-[10px] num text-mute tracking-wider"
                  >
                    {slot + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rows.map(({ team, entries }) => (
                <tr
                  key={team.code}
                  className="hover:bg-white/[0.03] transition-colors"
                >
                  {/* Team logo */}
                  <td className="px-4 py-2 sticky left-0 bg-surface z-10">
                    <div className="w-10 h-10 flex items-center justify-center">
                      {team.logo ? (
                        <Image
                          src={team.logo}
                          alt={team.full}
                          title={team.long}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="text-sm font-semibold text-dim">
                          {team.short}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Opponent logos, next games in order */}
                  {slots.map((slot) => {
                    const entry = entries[slot];
                    if (!entry) {
                      return (
                        <td key={slot} className="px-1.5 py-2 text-center">
                          <div className="w-8 h-8 mx-auto" />
                        </td>
                      );
                    }
                    return (
                      <td key={slot} className="px-1.5 py-2 text-center">
                        <div
                          className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full overflow-hidden ${
                            entry.isHome
                              ? 'border-3 border-accent'
                              : 'border-3 border-otl'
                          }`}
                          title={`${formatShortDateFromString(entry.startDateTime)}: ${entry.isHome ? 'Hemma' : 'Borta'} mot ${entry.opponent.long}`}
                        >
                          {entry.opponent.logo ? (
                            <Image
                              src={entry.opponent.logo}
                              alt={entry.opponent.full}
                              width={24}
                              height={24}
                              className="w-6 h-6 object-contain"
                              unoptimized
                            />
                          ) : (
                            <span className="text-[10px] font-semibold text-dim">
                              {entry.opponent.short}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
