import Link from 'next/link';
import { GameList } from '@/app/components/game-list';
import { SiteHeader } from '@/app/components/site-header';
import { SourceNotice } from '@/app/components/source-notice';
import { getSchedule } from '@/app/services/scheduleService';
import { addDays, todayDateKey } from '@/app/utils/dateUtils';
import { isFavoriteGame } from '@/app/utils/favorites';

// Schedules are time-relative and fetched live; render per request.
export const dynamic = 'force-dynamic';

/** Calendar days shown, starting today. */
const UPCOMING_DAYS = 3;

type Props = {
  searchParams: Promise<{ visa?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const onlyFavorites = (await searchParams).visa === 'favoriter';

  const today = todayDateKey();
  const days = Array.from({ length: UPCOMING_DAYS }, (_, i) =>
    addDays(today, i),
  );
  const { games, failed } = await getSchedule(days[0], days[days.length - 1]);
  const shown = onlyFavorites ? games.filter(isFavoriteGame) : games;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader current="matcher" />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-3xl font-bold uppercase tracking-[0.08em]">
              Kommande matcher
            </h1>
            <p className="mt-1 text-sm text-dim">
              Fotboll och hockey idag och de närmaste {UPCOMING_DAYS - 1}{' '}
              dagarna.
            </p>
          </div>
          <nav aria-label="Filter" className="flex gap-1 text-sm">
            <FilterLink href="/" active={!onlyFavorites}>
              Alla
            </FilterLink>
            <FilterLink href="/?visa=favoriter" active={onlyFavorites}>
              Favoriter
            </FilterLink>
          </nav>
        </div>

        <SourceNotice failed={failed} />
        <GameList
          games={shown}
          days={days}
          emptyText={
            onlyFavorites ? 'Inga matcher för favoritlagen' : 'Inga matcher'
          }
        />
      </main>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded-md px-3 py-1.5 transition-colors ${
        active
          ? 'bg-surface-3 font-semibold text-ink'
          : 'text-dim hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}
