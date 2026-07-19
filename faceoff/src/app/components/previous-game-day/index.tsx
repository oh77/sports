'use client';

import type React from 'react';
import type { League } from '@/app/types/domain/league';
import type { GameInfo } from '../../types/domain/game';
import { PreviousGame } from '../previous-game';

interface PreviousGameDayProps {
  date: string;
  games: GameInfo[];
  league: League;
}

export const PreviousGameDay: React.FC<PreviousGameDayProps> = ({
  date,
  games,
  league,
}) => {
  return (
    <div className="mb-4">
      {/* Date Header */}
      <div className="mb-2 text-center">
        <h2 className="text-lg font-bold text-gray-800">{date}</h2>
      </div>

      {/* Games in one container with dividers */}
      <div
        className="rounded-lg shadow-lg divide-y divide-gray-200"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
      >
        {games.map((game, index) => (
          <PreviousGame key={game.uuid || index} game={game} league={league} />
        ))}
      </div>
    </div>
  );
};
