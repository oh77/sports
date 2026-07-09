import Link from 'next/link';
import { leagueMeta } from '@/app/theme/pitch';
import type { League } from '@/app/types/domain/league';

type Props = {
  league: League;
};

export default function LeagueFooter({ league }: Props) {
  return (
    <footer className="mt-12 border-t border-line py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-sm text-mute md:px-6">
        <p className="display font-bold uppercase tracking-[0.1em]">
          {leagueMeta[league].name}
        </p>
        <Link href="/" className="text-soft transition-colors hover:text-ink">
          Till startsidan
        </Link>
      </div>
    </footer>
  );
}
