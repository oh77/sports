import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { GameList } from '@/app/components/game-list';
import { LeagueBadge } from '@/app/components/league-badge';
import { SiteHeader } from '@/app/components/site-header';
import { SourceNotice } from '@/app/components/source-notice';
import { FAVORITES } from '@/app/config/favorites';
import { LEAGUES } from '@/app/config/leagues';
import { getSchedule } from '@/app/services/scheduleService';
import { addDays, todayDateKey } from '@/app/utils/dateUtils';
import { favoriteEntries, isFavoriteGame } from '@/app/utils/favorites';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Favoriter · Gameday',
};

/** How far ahead to list the favorites' games. */
const HORIZON_DAYS = 14;

export default async function FavoritesPage() {
  const today = todayDateKey();
  const [{ games, failed }, calendar] = await Promise.all([
    getSchedule(today, addDays(today, HORIZON_DAYS - 1)),
    calendarUrls(),
  ]);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader current="favorites" />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
        <h1 className="display text-3xl font-bold uppercase tracking-[0.08em]">
          Favoriter
        </h1>
        <p className="mt-1 text-sm text-dim">
          Listan styrs av{' '}
          <code className="text-soft">src/app/config/favorites.ts</code>.
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {FAVORITES.map((team) => (
            <li
              key={team.name}
              className="rounded-lg border border-line bg-surface p-4"
            >
              <h2 className="display text-lg font-bold uppercase tracking-[0.06em]">
                {team.name}
              </h2>
              <ul className="mt-2 space-y-1.5">
                {favoriteEntries(team).map(({ league, code }) => (
                  <li
                    key={league}
                    className="flex items-center gap-2 text-sm text-soft"
                  >
                    <LeagueBadge league={league} />
                    {LEAGUES[league].name}
                    <code className="ml-auto text-xs text-mute">{code}</code>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <section
          aria-labelledby="kalender"
          className="mt-10 rounded-lg border border-line bg-surface p-4"
        >
          <h2
            id="kalender"
            className="display text-xl font-bold uppercase tracking-[0.08em]"
          >
            Kalender
          </h2>
          <p className="mt-1 text-sm text-dim">
            Prenumerera på favoritlagens matcher. Kalendern uppdateras
            automatiskt när nya matcher spikas.
          </p>
          <p className="mt-3 break-all rounded-md bg-surface-3 px-3 py-2">
            <code className="text-sm text-ink">{calendar.https}</code>
          </p>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            <li>
              <CalendarLink
                href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendar.webcal)}`}
              >
                Lägg till i Google Kalender
              </CalendarLink>
            </li>
            <li>
              <CalendarLink
                href={`https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(calendar.https)}&name=Gameday`}
              >
                Outlook.com
              </CalendarLink>
            </li>
            <li>
              <CalendarLink
                href={`https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(calendar.https)}&name=Gameday`}
              >
                Outlook (Microsoft 365)
              </CalendarLink>
            </li>
            <li>
              <CalendarLink href={calendar.webcal}>
                Öppna i kalenderapp
              </CalendarLink>
            </li>
          </ul>
          {calendar.local && (
            <p className="mt-3 text-sm text-dim">
              Obs: Google och Outlook hämtar kalendern från sina egna servrar,
              så prenumeration fungerar först när appen är driftsatt på en
              publik adress.
            </p>
          )}
        </section>

        <section aria-labelledby="kommande" className="mt-10">
          <h2
            id="kommande"
            className="display mb-4 text-xl font-bold uppercase tracking-[0.08em]"
          >
            Kommande {HORIZON_DAYS} dagar
          </h2>
          <SourceNotice failed={failed} />
          <GameList
            games={games.filter(isFavoriteGame)}
            emptyText="Inga matcher för favoritlagen"
          />
        </section>
      </main>
    </div>
  );
}

function CalendarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('https:') ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="inline-block rounded-md border border-line-strong px-3 py-1.5 text-soft transition-colors hover:border-accent hover:text-ink"
    >
      {children}
    </a>
  );
}

/** Absolute feed URLs for the host this page is served from. */
async function calendarUrls() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const local = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
  const proto = h.get('x-forwarded-proto') ?? (local ? 'http' : 'https');
  return {
    https: `${proto}://${host}/calendar.ics`,
    webcal: `webcal://${host}/calendar.ics`,
    local,
  };
}
