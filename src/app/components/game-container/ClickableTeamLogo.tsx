import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import type { League } from '@/app/types/domain/league';
import type { TeamInfo } from '@/app/types/domain/team';

interface ClickableTeamLogoProps {
  league: League;
  teamInfo: TeamInfo;
  compact?: boolean;
}

const ClickableTeamLogo: React.FC<ClickableTeamLogoProps> = ({
  league,
  teamInfo,
  compact = false,
}) => {
  const containerSize = 'w-16 h-16';
  const logoSize = league === 'shl' ? 'w-12 h-12' : 'w-16 h-16';
  const logoPx = league === 'shl' ? 48 : 64;
  const marginBottom = compact ? 'mb-0' : 'mb-3';

  return (
    <Link
      href={`/${league}/${encodeURIComponent(teamInfo.code)}`}
      title={teamInfo.full}
      className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline"
    >
      <div
        className={`${containerSize} mx-auto ${marginBottom} bg-gray-100 rounded-full flex items-center justify-center`}
      >
        {teamInfo.logo ? (
          <Image
            src={teamInfo.logo}
            alt={teamInfo.short}
            width={logoPx}
            height={logoPx}
            className={`object-contain ${logoSize}`}
          />
        ) : (
          <span className={`text-gray-400 ${compact ? 'text-sm' : 'text-xl'}`}>
            {teamInfo.code}
          </span>
        )}
      </div>
    </Link>
  );
};

export default ClickableTeamLogo;
