import type React from 'react';
import ClickableTeamLogo from '@/app/components/game-container/ClickableTeamLogo';
import type { League } from '@/app/types/domain/league';
import type { GameInfo } from '../../types/domain/game';

interface PreviousGameProps {
  game: GameInfo;
  league: League;
}

export const PreviousGame: React.FC<PreviousGameProps> = ({ game, league }) => {
  const homeScore =
    typeof game.homeTeamInfo.score === 'number'
      ? game.homeTeamInfo.score
      : null;
  const awayScore =
    typeof game.awayTeamInfo.score === 'number'
      ? game.awayTeamInfo.score
      : null;

  const hasScore = homeScore !== null && awayScore !== null;

  return (
    <div
      className="rounded-lg shadow-lg p-6"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
    >
      <div className="flex items-center justify-between">
        {/* Home Team Logo */}
        <div className="text-center flex-1">
          <ClickableTeamLogo
            league={league}
            teamInfo={game.homeTeamInfo.teamInfo}
          />
        </div>

        {/* Score */}
        <div className="text-center mx-6">
          {hasScore ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-900">
                {homeScore}
              </span>
              <span className="text-gray-400">-</span>
              <span className="text-2xl font-bold text-gray-900">
                {awayScore}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">-</span>
          )}
        </div>

        {/* Away Team Logo */}
        <div className="text-center flex-1">
          <ClickableTeamLogo
            league={league}
            teamInfo={game.awayTeamInfo.teamInfo}
          />
        </div>
      </div>
    </div>
  );
};
