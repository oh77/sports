import type React from 'react';
import type { GameInfo } from '@/app/types/domain/game';
import { isDateTimePassed } from '@/app/utils/dateUtils';

interface ScoreOrStatusProps {
  gameInfo: GameInfo;
  isHomeTeam: boolean;
}

export const ScoreOrStatus: React.FC<ScoreOrStatusProps> = ({
  gameInfo,
  isHomeTeam,
}) => {
  const homeScore = gameInfo.homeTeamInfo.score as unknown as string | number;
  const awayScore = gameInfo.awayTeamInfo.score as unknown as string | number;
  const hasNA =
    String(homeScore).includes('N/A') || String(awayScore).includes('N/A');

  if (hasNA) {
    const threeHoursMs = 3 * 60 * 60 * 1000;

    if (isDateTimePassed(new Date(gameInfo.startDateTime), threeHoursMs)) {
      return (
        <span className="inline-flex items-center text-sm text-dim">
          <span className="w-2 h-2 rounded-full bg-accent inline-block mr-1"></span>
          Saknas
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-sm text-dim">
        <span className="w-2 h-2 rounded-full bg-otl inline-block mr-1"></span>
        Pågående
      </span>
    );
  }

  const currentTeamScore = isHomeTeam ? homeScore : awayScore;
  const opponentScore = isHomeTeam ? awayScore : homeScore;

  return (
    <>
      <div className="display num text-sm font-bold text-ink">
        {currentTeamScore} - {opponentScore}
      </div>
      {(gameInfo.overtime || gameInfo.shootout) && (
        <div className="text-xs text-otl font-medium">
          {gameInfo.shootout ? 'Str' : 'ÖT'}
        </div>
      )}
    </>
  );
};
