import Image from 'next/image';
import type { TeamInfo } from '@/app/types/domain/team';

type Props = {
  team: TeamInfo;
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_PX = { sm: 24, md: 32, lg: 72 } as const;

/**
 * Team identity chip: the provider logo when one exists, otherwise an
 * initials fallback.
 */
export function TeamBadge({ team, size = 'md' }: Props) {
  const px = SIZE_PX[size];

  if (team.logo) {
    return (
      <Image
        src={team.logo}
        alt=""
        aria-hidden="true"
        width={px}
        height={px}
        className="shrink-0 object-contain"
        style={{ width: px, height: px }}
      />
    );
  }

  const box = {
    sm: 'h-6 w-6 text-[9px]',
    md: 'h-8 w-8 text-[10px]',
    lg: 'h-18 w-18 text-lg',
  }[size];
  return (
    <span
      aria-hidden="true"
      className={`${box} display flex shrink-0 items-center justify-center rounded-full bg-surface-3 font-bold uppercase tracking-wide text-soft`}
    >
      {team.short.slice(0, 3)}
    </span>
  );
}
