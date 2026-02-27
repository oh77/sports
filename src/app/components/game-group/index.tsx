import type React from 'react';
import type { League } from '@/app/types/domain/league';
import type { GameInfo } from '../../types/domain/game';
import { GameContainer } from '../game-container';

interface GameGroupProps {
  time: string;
  games: GameInfo[];
  league: League;
}

export const GameGroup: React.FC<GameGroupProps> = ({
  time,
  games,
  league,
}) => (
  <div className="mb-6">
    <div className="text-center mb-3">
      <h2
        className={`text-xl font-bold ${league === 'chl' ? 'text-white' : 'text-gray-800'}`}
      >
        {time}
      </h2>
    </div>

    <div
      className="rounded-lg shadow-lg divide-y divide-gray-200"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
    >
      {games.map((game, index) => (
        <GameContainer
          key={game.uuid || index}
          game={game}
          league={league}
          compact
        />
      ))}
    </div>
  </div>
);
