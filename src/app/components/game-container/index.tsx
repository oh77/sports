import Image from 'next/image';
import type React from 'react';
import ClickableTeamLogo from '@/app/components/game-container/ClickableTeamLogo';
import type { League } from '@/app/types/domain/league';
import { isDateTimePassed } from '@/app/utils/dateUtils';
import type { GameInfo } from '../../types/domain/game';

interface GameContainerProps {
  game: GameInfo;
  league: League;
  compact?: boolean;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  game,
  league,
  compact = false,
}) => {
  const getStadiumIcon = () => {
    return league === 'shl'
      ? 'https://www.shl.se/assets/stadium-460843bd.svg'
      : 'https://www.sdhl.se/assets/stadium-460843bd.svg';
  };

  const isGameLive = (game: GameInfo) => {
    return (
      game.state === 'live' ||
      (game.state === 'not-started' &&
        isDateTimePassed(new Date(game.startDateTime)))
    );
  };

  const isGameFinished = (game: GameInfo) => game.state === 'finished';

  const wrapperClass = compact
    ? 'px-4 py-3'
    : 'rounded-lg shadow-lg p-6';
  const wrapperStyle = compact
    ? undefined
    : { backgroundColor: 'rgba(255, 255, 255, 0.8)' };

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <div className="flex items-center">
        <div className="flex-1 flex justify-end pr-8">
          <ClickableTeamLogo
            league={league}
            teamInfo={game.homeTeamInfo.teamInfo}
            compact={compact}
          />
        </div>

        <div className="text-center w-40 shrink-0">
          <Image
            src={getStadiumIcon()}
            alt="Arena"
            width={40}
            height={40}
            className="mx-auto mb-2 brightness-0"
          />
          <p className="text-sm text-gray-500 mt-1 truncate">
            {game.venueInfo.name}
          </p>
        </div>

        <div className="flex-1 flex justify-start pl-8">
          <ClickableTeamLogo
            league={league}
            teamInfo={game.awayTeamInfo.teamInfo}
            compact={compact}
          />
        </div>
      </div>

      {isGameLive(game) && (
        <div className="flex items-center">
          <div className="inline-flex items-center text-sm text-gray-500 mx-auto">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block mr-1"></span>
            Pågående
          </div>
        </div>
      )}
      {isGameFinished(game) && (
        <div className="flex items-center">
          <div className="inline-flex items-center text-sm text-gray-500 mx-auto">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1"></span>
            Slut
          </div>
        </div>
      )}
    </div>
  );
};

export type { StatnetGameInfo } from '../../types/statnet/game';
