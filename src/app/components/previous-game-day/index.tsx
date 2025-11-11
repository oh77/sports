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
    <div className="mb-6">
      {/* Date Header */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">{date}</h2>
      </div>

      {/* Games - no time grouping */}
      <div className="space-y-4">
        {games.map((game, index) => (
          <PreviousGame key={game.uuid || index} game={game} league={league} />
        ))}
      </div>
    </div>
  );
};
