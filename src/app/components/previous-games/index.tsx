'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GameInfo, TeamInfo } from '../../types/game';

interface PreviousGamesProps {
  games: GameInfo[];
  currentTeamCode: string;
  league: 'shl' | 'sdhl' | 'chl';
}

export default function PreviousGames({ games, currentTeamCode, league }: PreviousGamesProps) {
  const getTeamCode = (teamInfo: TeamInfo): string => {
    return teamInfo.names?.code || teamInfo.code;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Tidigare Matcher</h2>
      <div className="space-y-3">
        {games.map((prevGame) => {
          const isHomeTeam = getTeamCode(prevGame.homeTeamInfo) === currentTeamCode;
          const opponentInfo = isHomeTeam ? prevGame.awayTeamInfo : prevGame.homeTeamInfo;
          const currentTeamScore = isHomeTeam ? prevGame.homeTeamInfo.score : prevGame.awayTeamInfo.score;
          const opponentScore = isHomeTeam ? prevGame.awayTeamInfo.score : prevGame.homeTeamInfo.score;

          return (
            <div key={prevGame.uuid} className="rounded-lg shadow-lg p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
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
                    {currentTeamScore} - {opponentScore}
                  </div>
                  {((prevGame.state && (prevGame.state.includes('Shootout') || prevGame.state.includes('Overtime'))) || 
                    ('shootout' in prevGame && prevGame.shootout) || 
                    ('overtime' in prevGame && prevGame.overtime)) && (
                    <div className="text-xs text-orange-600 font-medium">
                      {((prevGame.state && prevGame.state.includes('Shootout')) || ('shootout' in prevGame && prevGame.shootout)) ? 'SO' : 'OT'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {games.length === 0 && (
          <div className="text-center text-gray-200 py-4">
            Inga tidigare matcher hittades
          </div>
        )}
      </div>
    </div>
  );
}
