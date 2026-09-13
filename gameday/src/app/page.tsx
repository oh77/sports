import Link from 'next/link';
import { LiveSchedule } from '@/app/components/live-schedule';
import { SiteHeader } from '@/app/components/site-header';
import { addDays, todayDateKey } from '@/app/utils/dateUtils';

// The day window is relative to today; render per request.
export const dynamic = 'force-dynamic';

/** Calendar days shown, starting today. */
const UPCOMING_DAYS = 3;

type Props = {
  searchParams: Promise<{ show?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const onlyFavorites = (await searchParams).show === 'favorites';

  const today = todayDateKey();
  const days = Array.from({ length: UPCOMING_DAYS }, (_, i) =>
    addDays(today, i),
  );

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader current="games" />

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
            <FilterLink href="/?show=favorites" active={onlyFavorites}>
              Favoriter
            </FilterLink>
          </nav>
        </div>

        {/* Keyed by day so a new day starts from a clean slate; switching the
            filter keeps the loaded leagues. */}
        <LiveSchedule key={today} days={days} onlyFavorites={onlyFavorites} />
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
