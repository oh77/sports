'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import { teamPath } from '@/app/utils/leaguePaths';
import { useSeason } from '@/app/utils/useSeason';
import { calculateStreaks, type TeamStreak } from '../streakUtils';

interface TrendTableProps {
  league: League;
  games: GameInfo[];
}

export function TrendTable({ league, games }: TrendTableProps) {
  const season = useSeason();
  const [streaks, setStreaks] = useState<TeamStreak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (games.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const calculatedStreaks = calculateStreaks(games);
      setStreaks(calculatedStreaks);
    } catch (error) {
      console.error('Error calculating streaks:', error);
    } finally {
      setLoading(false);
    }
  }, [games]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="animate-pulse p-8">
            <div className="h-6 bg-surface-3 rounded mb-4"></div>
            <div className="h-64 bg-surface-3 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (streaks.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="p-8 text-center text-dim">
            Ingen trenddata tillgänglig
          </div>
        </div>
      </div>
    );
  }

  const getString = (team: TeamStreak) => {
    if (team.streakType === 'win') {
      return team.streak === 1 ? 'vinst' : 'vinster';
    } else {
      return team.streak === 1 ? 'förlust' : 'förluster';
    }
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
                  Längsta
                </th>
                <th className="px-4 py-3 text-center text-xs text-mute display uppercase tracking-[0.06em]">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {streaks.map((team, index) => (
                <tr
                  key={team.teamCode}
                  className="hover:bg-white/[0.03] transition-colors"
                >
                  {/* Rank */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm display text-ink">
                    {index + 1}
                  </td>

                  {/* Team */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Link
                      href={teamPath(league, season, team.teamCode)}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-8 h-8 bg-surface-3 rounded-full flex items-center justify-center overflow-hidden">
                        {team.teamLogo ? (
                          <Image
                            src={team.teamLogo}
                            alt={team.teamName}
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
                          {team.teamName}
                        </div>
                        <div className="text-xs text-mute">
                          {team.teamFullName}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Longest Streaks */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm num text-center">
                    <span className="font-medium">
                      {team.longestWinStreak > 0 ? (
                        <span className="text-win">
                          {team.longestWinStreak}
                        </span>
                      ) : (
                        <span className="text-win">-</span>
                      )}
                      <span className="text-mute mx-1">:</span>
                      {team.longestLossStreak > 0 ? (
                        <span className="text-loss">
                          {team.longestLossStreak}
                        </span>
                      ) : (
                        <span className="text-loss">-</span>
                      )}
                    </span>
                  </td>

                  {/* Current Streak */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                    <span
                      className={`font-medium ${
                        team.streakType === 'win' ? 'text-win' : 'text-loss'
                      }`}
                    >
                      {team.streak} {getString(team)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
