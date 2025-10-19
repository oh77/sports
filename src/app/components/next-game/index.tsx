'use client';

import React from 'react';
import Image from 'next/image';
import { GameInfo } from '../../types/domain/game';
import { TrendMarkers } from '../trend-markers';
import {League} from "@/app/types/domain/league";

interface NextGameProps {
  game: GameInfo | null;
  currentTeamCode: string;
  league: League;
  allGames?: GameInfo[];
}

export default function NextGame({ game, currentTeamCode, league, allGames = [] }: NextGameProps) : React.JSX.Element | null {

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

  // Determine opponent
  const isHomeTeam = game.homeTeamInfo.teamInfo.code === currentTeamCode;
  const opponentInfo = isHomeTeam ? game.awayTeamInfo : game.homeTeamInfo;
  const homeOrAway = isHomeTeam ? 'H' : 'B';

  const stadiumIconUrl = league === 'sdhl'
    ? 'https://www.sdhl.se/assets/stadium-460843bd.svg'
    : league === 'chl'
    ? 'https://www.shl.se/assets/stadium-460843bd.svg' // Use SHL stadium icon for CHL
    : 'https://www.shl.se/assets/stadium-460843bd.svg';

  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="rounded-lg shadow-lg overflow-hidden relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
        {/* Container for content with logos (excludes trend markers) */}
        <div className="relative py-8" style={{ minHeight: '250px' }}>
          {/* Home Team Logo - Left side, mobile: 70% hidden, desktop: 35% hidden */}
          <div className="absolute left-0 top-4 bottom-4 w-64 -ml-[179px] md:-ml-[90px]">
            {game.homeTeamInfo.teamInfo.logo ? (
              <Image
                src={game.homeTeamInfo.teamInfo.logo}
                alt={game.homeTeamInfo.teamInfo.short}
                width={256}
                height={256}
                className="w-full h-full object-contain opacity-80"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-8xl">🏒</span>
              </div>
            )}
          </div>

          {/* Away Team Logo - Right side, mobile: 70% hidden, desktop: 35% hidden */}
          <div className="absolute right-0 top-4 bottom-4 w-64 -mr-[179px] md:-mr-[90px]">
            {game.awayTeamInfo.teamInfo.logo ? (
              <Image
                src={game.awayTeamInfo.teamInfo.logo}
                alt={game.awayTeamInfo.teamInfo.short}
                width={256}
                height={256}
                className="w-full h-full object-contain opacity-80"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-8xl">🏒</span>
              </div>
            )}
          </div>

          {/* Content - centered with higher z-index */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <p className="text-xl font-medium text-gray-800">
                {formatTime(game.startDateTime)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(game.startDateTime)}
              </p>
            </div>

            <div className="text-center mb-8">
              <p className="text-2xl font-bold text-gray-800">
                {opponentInfo.teamInfo.full} ({homeOrAway})
              </p>
            </div>

            <div className="text-center">
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
          </div>
        </div>

        {/* Trend Markers - outside logo container */}
        <div className="relative z-10 px-4 md:px-8 pb-4">
          <TrendMarkers
            games={allGames}
            homeTeamCode={game.homeTeamInfo.teamInfo.code}
            awayTeamCode={game.awayTeamInfo.teamInfo.code}
          />
        </div>
      </div>
    </div>
  );
}
