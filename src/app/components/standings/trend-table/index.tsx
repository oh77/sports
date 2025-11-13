'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import { calculateStreaks, type TeamStreak } from '../streakUtils';

interface TrendTableProps {
  league: League;
  games: GameInfo[];
}

export function TrendTable({ league, games }: TrendTableProps) {
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="animate-pulse p-8">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (streaks.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 text-center text-gray-500">
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lag
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Längsta
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {streaks.map((team, index) => (
                <tr
                  key={team.teamCode}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>

                  {/* Team */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Link
                      href={`/${league}/${encodeURIComponent(team.teamCode)}`}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        {team.teamLogo ? (
                          <Image
                            src={team.teamLogo}
                            alt={team.teamName}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">🏒</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {team.teamName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {team.teamFullName}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Longest Streaks */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                    <span className="font-medium">
                      {team.longestWinStreak > 0 ? (
                        <span className="text-green-600">
                          {team.longestWinStreak}
                        </span>
                      ) : (
                        <span className="text-green-600">-</span>
                      )}
                      <span className="text-gray-500 mx-1">:</span>
                      {team.longestLossStreak > 0 ? (
                        <span className="text-red-600">
                          {team.longestLossStreak}
                        </span>
                      ) : (
                        <span className="text-red-600">-</span>
                      )}
                    </span>
                  </td>

                  {/* Current Streak */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                    <span
                      className={`font-medium ${
                        team.streakType === 'win'
                          ? 'text-green-600'
                          : 'text-red-600'
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
