import Image from 'next/image';
import { LEAGUES } from '@/app/config/leagues';
import type { League } from '@/app/types/domain/league';

export function LeagueBadge({ league }: { league: League }) {
  const meta = LEAGUES[league];
  return (
    <span
      title={meta.name}
      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
      style={{ backgroundColor: meta.chipBg }}
    >
      <Image
        src={meta.logo}
        alt={meta.name}
        fill
        sizes="32px"
        className="object-contain p-1"
      />
    </span>
  );
}
