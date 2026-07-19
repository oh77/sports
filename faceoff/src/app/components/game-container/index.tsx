import type React from 'react';
import ClickableTeamLogo from '@/app/components/game-container/ClickableTeamLogo';
import { StadiumIcon } from '@/app/components/icons/stadium-icon';
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
    : 'rounded-lg border border-line bg-surface p-6';

  return (
    <div className={wrapperClass}>
      <div className="flex items-center">
        <div className="flex-1 flex justify-end pr-8">
          <ClickableTeamLogo
            league={league}
            teamInfo={game.homeTeamInfo.teamInfo}
            compact={compact}
          />
        </div>

        <div className="text-center w-40 shrink-0">
          <StadiumIcon className="mx-auto mb-2 h-[1.875rem] w-auto text-dim" />
          <p className="num text-sm text-dim mt-1 truncate">
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
          <div className="display inline-flex items-center text-sm uppercase tracking-[0.04em] text-dim mx-auto">
            <span className="w-2 h-2 rounded-full bg-otl inline-block mr-1"></span>
            Pågående
          </div>
        </div>
      )}
      {isGameFinished(game) && (
        <div className="flex items-center">
          <div className="display inline-flex items-center text-sm uppercase tracking-[0.04em] text-dim mx-auto">
            <span className="w-2 h-2 rounded-full bg-win inline-block mr-1"></span>
            Slut
          </div>
        </div>
      )}
    </div>
  );
};

export type { StatnetGameInfo } from '../../types/statnet/game';
