'use client';

import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import type { League } from '@/app/types/domain/league';
import {
  formatLongDateFromString,
  formatTimeFromString,
} from '@/app/utils/dateUtils';
import { teamPath } from '@/app/utils/leaguePaths';
import { useSeason } from '@/app/utils/useSeason';
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
  const season = useSeason();
  const getTeamCode = (teamInfo: GameTeamInfo): string => {
    return teamInfo.teamInfo.code;
  };

  return (
    <div>
      <h2 className="display text-2xl font-bold text-ink uppercase tracking-[0.04em] mb-4 text-center">
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
              className="rounded-lg p-3 bg-surface border border-line"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-surface-3 rounded-full flex items-center justify-center">
                    {opponentInfo.teamInfo.logo ? (
                      <Image
                        src={opponentInfo.teamInfo.logo}
                        alt={opponentInfo.teamInfo.short}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <span className="text-mute text-xs">🏒</span>
                    )}
                  </div>
                  <Link
                    href={teamPath(league, season, getTeamCode(opponentInfo))}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {opponentInfo.teamInfo.short} ({isHomeTeam ? 'H' : 'A'})
                  </Link>
                </div>

                <div className="text-center">
                  <div className="display num text-sm font-bold text-ink">
                    {formatTimeFromString(upcomingGame.startDateTime)}
                  </div>
                  <div className="text-xs text-mute">
                    {formatLongDateFromString(upcomingGame.startDateTime)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {games.length === 0 && (
          <div className="text-center text-dim py-4">
            Inga kommande matcher hittades
          </div>
        )}
      </div>
    </div>
  );
};
export default UpcomingGames;
