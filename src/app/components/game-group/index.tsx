import { GameInfo } from '../../types/domain/game';
import { League } from '@/app/types/domain/league';
import { GameContainer } from '../game-container';

interface GameGroupProps {
  time: string;
  games: GameInfo[];
  league: League;
}

export function GameGroup({ time, games, league }: GameGroupProps) {
  return (
    <div className="mb-8">
      <div className="text-center mb-4">
        <h2 className={`text-2xl font-bold mb-2 ${league === 'chl' ? 'text-white' : 'text-gray-800'}`}>
          {time}
        </h2>
      </div>
      
      <div className="space-y-4">
        {games.map((game, index) => (
          <GameContainer
            key={game.uuid || index}
            game={game}
            league={league}
          />
        ))}
      </div>
    </div>
  );
}
