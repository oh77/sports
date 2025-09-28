'use client';

import React from 'react';
import Image from 'next/image';
import { StatnetGameInfo } from '../../types/statnet/game';

interface NextGameProps {
  game: StatnetGameInfo | null;
  currentTeamCode: string;
  league: 'shl' | 'sdhl' | 'chl';
}

export default function NextGame({ game, league }: NextGameProps) : React.JSX.Element | null {

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

  if (!game) {
    return null;
  }

  const stadiumIconUrl = league === 'sdhl'
    ? 'https://www.sdhl.se/assets/stadium-460843bd.svg'
    : league === 'chl'
    ? 'https://www.shl.se/assets/stadium-460843bd.svg' // Use SHL stadium icon for CHL
    : 'https://www.shl.se/assets/stadium-460843bd.svg';

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
        <div className="text-center mb-6">
          <p className="text-xl font-medium text-gray-800">
            {formatTime(game.startDateTime)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate(game.startDateTime)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              {game.homeTeamInfo.icon ? (
                <Image
                  src={game.homeTeamInfo.icon}
                  alt={game.homeTeamInfo.names.short}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <span className="text-gray-400 text-xl">🏒</span>
              )}
            </div>
            <p className="text-lg font-medium text-gray-800">
              {game.homeTeamInfo.names.short}
            </p>
          </div>

          <div className="text-center mx-6">
            <Image
              src={stadiumIconUrl}
              alt="Arena"
              width={40}
              height={40}
              className="mx-auto mb-2 brightness-0"
            />
            <p className="text-sm text-gray-500 mt-1">
              {game.venueInfo.name}
            </p>
          </div>

          <div className="text-center flex-1">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              {game.awayTeamInfo.icon ? (
                <Image
                  src={game.awayTeamInfo.icon}
                  alt={game.awayTeamInfo.names.short}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <span className="text-gray-400 text-xl">🏒</span>
              )}
            </div>
            <p className="text-lg font-medium text-gray-800">
              {game.awayTeamInfo.names.short}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
