'use client';

import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import type { League } from '@/app/types/domain/league';
import {
  formatLongDateFromString,
  formatTimeFromString,
} from '@/app/utils/dateUtils';
import type { GameInfo, GameTeamInfo } from '../../types/domain/game';

interface UpcomingGamesProps {
  games: GameInfo[];
  currentTeamCode: string;
  league: League;
}

const UpcomingGames: React.FC<UpcomingGamesProps> = ({
  games,
  currentTeamCode,
  league,
}) => {
  const getTeamCode = (teamInfo: GameTeamInfo): string => {
    return teamInfo.teamInfo.code;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Kommande Matcher
      </h2>
      <div className="space-y-3">
        {games.map((upcomingGame) => {
          const isHomeTeam =
            getTeamCode(upcomingGame.homeTeamInfo) === currentTeamCode;
          const opponentInfo = isHomeTeam
            ? upcomingGame.awayTeamInfo
            : upcomingGame.homeTeamInfo;

          return (
            <div
              key={upcomingGame.uuid}
              className="rounded-lg shadow-lg p-3"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {opponentInfo.teamInfo.logo ? (
                      <Image
                        src={opponentInfo.teamInfo.logo}
                        alt={opponentInfo.teamInfo.short}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">🏒</span>
                    )}
                  </div>
                  <Link
                    href={`/${league}/${encodeURIComponent(getTeamCode(opponentInfo))}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {opponentInfo.teamInfo.short} ({isHomeTeam ? 'H' : 'A'})
                  </Link>
                </div>

                <div className="text-center">
                  <div className="text-sm font-bold text-gray-800">
                    {formatTimeFromString(upcomingGame.startDateTime)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatLongDateFromString(upcomingGame.startDateTime)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {games.length === 0 && (
          <div className="text-center text-gray-200 py-4">
            Inga kommande matcher hittades
          </div>
        )}
      </div>
    </div>
  );
};
export default UpcomingGames;
