'use client';

import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import type { League } from '@/app/types/domain/league';
import type { TeamInfo } from '@/app/types/domain/team';
import { teamPath } from '@/app/utils/leaguePaths';
import { useSeason } from '@/app/utils/useSeason';

/** lg — hero cards; md — game rows; sm — the dense rows of previous days. */
export type LogoSize = 'lg' | 'md' | 'sm';

interface ClickableTeamLogoProps {
  league: League;
  teamInfo: TeamInfo;
  size?: LogoSize;
}

const ClickableTeamLogo: React.FC<ClickableTeamLogoProps> = ({
  league,
  teamInfo,
  size = 'md',
}) => {
  const season = useSeason();
  const small = size === 'sm';
  const containerSize = small ? 'w-10 h-10' : 'w-16 h-16';
  // SHL logos carry their own padding, so they sit a size down inside the well.
  const logoSize = small
    ? league === 'shl'
      ? 'w-7 h-7'
      : 'w-9 h-9'
    : league === 'shl'
      ? 'w-12 h-12'
      : 'w-16 h-16';
  const logoPx = small ? 36 : league === 'shl' ? 48 : 64;
  const marginBottom = size === 'lg' ? 'mb-3' : 'mb-0';

  return (
    <Link
      href={teamPath(league, season, teamInfo.code)}
      title={teamInfo.full}
      className="text-lg font-medium text-accent hover:text-ink hover:underline"
    >
      <div
        className={`${containerSize} mx-auto ${marginBottom} bg-surface-3 rounded-full flex items-center justify-center`}
      >
        {teamInfo.logo ? (
          <Image
            src={teamInfo.logo}
            alt={teamInfo.short}
            width={logoPx}
            height={logoPx}
            className={`object-contain ${logoSize}`}
            unoptimized
          />
        ) : (
          <span
            className={`display text-mute ${size === 'lg' ? 'text-xl' : small ? 'text-xs' : 'text-sm'}`}
          >
            {teamInfo.code}
          </span>
        )}
      </div>
    </Link>
  );
};

export default ClickableTeamLogo;
