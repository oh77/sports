'use client';

import type React from 'react';
import { useState } from 'react';
import type { League } from '@/app/types/domain/league';
import type { GameInfo } from '../../types/domain/game';
import { PreviousGameDay } from '../previous-game-day';

interface PreviousGameDaysProps {
  previousGameDays: Array<{ date: string; games: GameInfo[] }>;
  league: League;
}

export const PreviousGameDays: React.FC<PreviousGameDaysProps> = ({
  previousGameDays,
  league,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-8">
      {/* Thin row with toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full focus:outline-none mb-4"
      >
        <div className="flex flex-col items-center py-2 border-b border-gray-300">
          <span className="text-sm font-medium text-gray-700 mb-1">
            Tidigare matcher
          </span>
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Tidigare Matcher</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* All previous game days in one container */}
      {isExpanded && (
        <div className="space-y-6">
          {previousGameDays.map((previousDay) => (
            <PreviousGameDay
              key={previousDay.date}
              date={previousDay.date}
              games={previousDay.games}
              league={league}
            />
          ))}
        </div>
      )}
    </div>
  );
};
