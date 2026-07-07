import Image from 'next/image';
import type { TeamInfo } from '@/app/types/domain/team';

type Props = {
  team: TeamInfo;
  size?: 'sm' | 'md';
};

/**
 * Team identity chip: the provider logo when one exists, otherwise an
 * initials fallback (fixture leagues have no logo URLs yet).
 */
export function TeamBadge({ team, size = 'md' }: Props) {
  const px = size === 'sm' ? 24 : 32;

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

  const box = size === 'sm' ? 'h-6 w-6 text-[9px]' : 'h-8 w-8 text-[10px]';
  return (
    <span
      aria-hidden="true"
      className={`${box} display flex shrink-0 items-center justify-center rounded-full bg-surface-3 font-bold uppercase tracking-wide text-soft`}
    >
      {team.short.slice(0, 3)}
    </span>
  );
}
