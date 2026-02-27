import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import type { League } from '@/app/types/domain/league';
import type { TeamInfo } from '@/app/types/domain/team';
import type { GameInfo } from '../../types/domain/game';

interface PreviousGameProps {
  game: GameInfo;
  league: League;
}

function SmallTeamLogo({
  league,
  teamInfo,
}: { league: League; teamInfo: TeamInfo }) {
  return (
    <Link
      href={`/${league}/${encodeURIComponent(teamInfo.code)}`}
      title={teamInfo.full}
      className="hover:opacity-80"
    >
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        {teamInfo.logo ? (
          <Image
            src={teamInfo.logo}
            alt={teamInfo.short}
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
        ) : (
          <span className="text-gray-400 text-xs">{teamInfo.code}</span>
        )}
      </div>
    </Link>
  );
}

function getResultSuffix(game: GameInfo): string | null {
  if (game.shootout) return 'Str';
  if (game.overtime) return 'ÖT';
  return null;
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
  const suffix = getResultSuffix(game);

  return (
    <div className="px-4 py-3">
      <div className="flex items-center">
        {/* Home Team */}
        <div className="flex-1 flex justify-end pr-6">
          <SmallTeamLogo league={league} teamInfo={game.homeTeamInfo.teamInfo} />
        </div>

        {/* Score */}
        <div className="text-center w-24 shrink-0">
          {hasScore ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {homeScore}
                </span>
                <span className="text-gray-400">-</span>
                <span className="text-lg font-bold text-gray-900">
                  {awayScore}
                </span>
              </div>
              {suffix && (
                <span className="text-[10px] font-medium text-gray-400 uppercase">
                  {suffix}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-500">-</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex justify-start pl-6">
          <SmallTeamLogo league={league} teamInfo={game.awayTeamInfo.teamInfo} />
        </div>
      </div>
    </div>
  );
};
