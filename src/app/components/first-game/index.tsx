import Image from 'next/image';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { League } from '@/app/types/domain/league';
import { formatLongDateTimeFromString } from '@/app/utils/dateUtils';
import { StatnetService } from '../../services/statnetService';
import type { GameInfo } from '../../types/domain/game';

interface FirstGameProps {
  league?: League;
}

const FirstGame: React.FC<FirstGameProps> = ({ league = 'shl' }) => {
  const [game, setGame] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        const leagueService = new StatnetService(league);

        // Fetch games from API (cached server-side)
        await leagueService.fetchGames();
        const firstGame = leagueService.getFirstGame();

        setGame(firstGame);
      } catch (err) {
        setError('Failed to load game data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [league]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 w-full md:w-80">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="h-32 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 w-full md:w-80">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Game Data
          </h3>
          <p className="text-gray-600">Unable to load upcoming games</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full md:w-80">
      <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">
        Next {league.toUpperCase()} Game
      </h3>

      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 mb-1">Date & Time</p>
        <p className="text-lg font-medium text-gray-800">
          {formatLongDateTimeFromString(game.startDateTime)}
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
            {game.homeTeamInfo.teamInfo.logo ? (
              <Image
                src={game.homeTeamInfo.teamInfo.logo}
                alt={game.homeTeamInfo.teamInfo.short}
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <span className="text-gray-400 text-xs">🏒</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800">
            {game.homeTeamInfo.teamInfo.short}
          </p>
        </div>

        <div className="text-center mx-4">
          <span className="text-2xl font-bold text-gray-600">VS</span>
        </div>

        <div className="text-center flex-1">
          <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
            {game.awayTeamInfo.teamInfo.logo ? (
              <Image
                src={game.awayTeamInfo.teamInfo.logo}
                alt={game.awayTeamInfo.teamInfo.short}
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <span className="text-gray-400 text-xs">🏒</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800">
            {game.awayTeamInfo.teamInfo.short}
          </p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-1">Venue</p>
        <p className="text-base font-medium text-gray-800">
          {game.venueInfo.name}
        </p>
      </div>
    </div>
  );
};
export default FirstGame;
