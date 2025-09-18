'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GameInfo, TeamInfo } from '../../types/game';

interface UpcomingGamesProps {
  games: GameInfo[];
  currentTeamCode: string;
  league: 'shl' | 'sdhl' | 'chl';
}

export default function UpcomingGames({ games, currentTeamCode, league }: UpcomingGamesProps) {
  const getTeamCode = (teamInfo: TeamInfo): string => {
    return teamInfo.names?.code || teamInfo.code;
  };

  const formatTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeStr;
    }
  };

  const formatDate = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleDateString('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateTimeStr;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Kommande Matcher</h2>
      <div className="space-y-3">
        {games.map((upcomingGame) => {
          const isHomeTeam = getTeamCode(upcomingGame.homeTeamInfo) === currentTeamCode;
          const opponentInfo = isHomeTeam ? upcomingGame.awayTeamInfo : upcomingGame.homeTeamInfo;

          return (
            <div key={upcomingGame.uuid} className="rounded-lg shadow-lg p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {opponentInfo.icon ? (
                      <Image
                        src={opponentInfo.icon}
                        alt={opponentInfo.names.short}
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
                    {opponentInfo.names.short} ({isHomeTeam ? 'H' : 'A'})
                  </Link>
                </div>

                <div className="text-center">
                  <div className="text-sm font-bold text-gray-800">
                    {formatTime(upcomingGame.startDateTime)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(upcomingGame.startDateTime)}
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
}
