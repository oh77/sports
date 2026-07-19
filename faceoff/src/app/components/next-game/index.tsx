import Image from 'next/image';
import type React from 'react';
import { StadiumIcon } from '@/app/components/icons/stadium-icon';
import type { League } from '@/app/types/domain/league';
import { formatTimeFromDate } from '@/app/utils/dateUtils';
import type { GameInfo } from '../../types/domain/game';
import { TrendMarkers } from '../trend-markers';

interface NextGameProps {
  game: GameInfo | null;
  currentTeamCode: string;
  league: League;
  allGames?: GameInfo[];
}

const NextGame: React.FC<NextGameProps> = ({
  game,
  currentTeamCode,
  allGames = [],
}) => {
  const formatTime = (dateTimeStr: string) => {
    try {
      return formatTimeFromDate(new Date(dateTimeStr));
    } catch {
      return dateTimeStr;
    }
  };

  const formatDate = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleDateString('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateTimeStr;
    }
  };

  if (!game) {
    return null;
  }

  // Determine opponent
  const isHomeTeam = game.homeTeamInfo.teamInfo.code === currentTeamCode;
  const opponentInfo = isHomeTeam ? game.awayTeamInfo : game.homeTeamInfo;
  const homeOrAway = isHomeTeam ? 'H' : 'B';

  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="rounded-lg overflow-hidden relative bg-surface border border-line">
        {/* Container for content with logos (excludes trend markers) */}
        <div className="relative py-8" style={{ minHeight: '250px' }}>
          {/* Home Team Logo - Left side, mobile: 70% hidden, desktop: 35% hidden */}
          <div className="absolute left-0 top-4 bottom-4 w-64 -ml-[179px] md:-ml-[90px]">
            {game.homeTeamInfo.teamInfo.logo ? (
              <Image
                src={game.homeTeamInfo.teamInfo.logo}
                alt={game.homeTeamInfo.teamInfo.short}
                width={256}
                height={256}
                className="w-full h-full object-contain opacity-80"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-mute text-8xl">🏒</span>
              </div>
            )}
          </div>

          {/* Away Team Logo - Right side, mobile: 70% hidden, desktop: 35% hidden */}
          <div className="absolute right-0 top-4 bottom-4 w-64 -mr-[179px] md:-mr-[90px]">
            {game.awayTeamInfo.teamInfo.logo ? (
              <Image
                src={game.awayTeamInfo.teamInfo.logo}
                alt={game.awayTeamInfo.teamInfo.short}
                width={256}
                height={256}
                className="w-full h-full object-contain opacity-80"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-mute text-8xl">🏒</span>
              </div>
            )}
          </div>

          {/* Content - centered with higher z-index */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <p className="display num text-xl font-medium text-ink tracking-[0.04em]">
                {formatTime(game.startDateTime)}
              </p>
              <p className="text-sm text-dim mt-1">
                {formatDate(game.startDateTime)}
              </p>
            </div>

            <div className="text-center mb-8">
              <p className="display text-2xl font-bold text-ink uppercase tracking-[0.04em]">
                {opponentInfo.teamInfo.full} ({homeOrAway})
              </p>
            </div>

            <div className="text-center">
              <StadiumIcon className="mx-auto mb-2 h-[1.875rem] w-auto text-dim" />
              <p className="text-sm text-mute mt-1">{game.venueInfo.name}</p>
            </div>
          </div>
        </div>

        {/* Trend Markers - outside logo container */}
        <div className="relative z-10 px-4 md:px-8 pb-4">
          <TrendMarkers
            games={allGames}
            homeTeamCode={game.homeTeamInfo.teamInfo.code}
            awayTeamCode={game.awayTeamInfo.teamInfo.code}
          />
        </div>
      </div>
    </div>
  );
};
export default NextGame;
