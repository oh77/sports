import { getSchedule } from '@/app/services/scheduleService';
import { addDays, todayDateKey } from '@/app/utils/dateUtils';
import { isFavoriteGame } from '@/app/utils/favorites';
import { buildCalendar } from '@/app/utils/ics';

export const dynamic = 'force-dynamic';

/** Keep past games (without scores) in the calendar for a week. */
const PAST_DAYS = 7;
/**
 * How far ahead to publish. Kept within the NHL schedule walk in faceoff
 * (3 week-windows, the first containing today).
 */
const FUTURE_DAYS = 14;

/**
 * Refresh hint for calendar clients (`REFRESH-INTERVAL`/`X-PUBLISHED-TTL`).
 * Google ignores it. Server-side caching is the `Cache-Control` header below.
 */
const REFRESH_HOURS = 6;

/**
 * Subscribable calendar of the favorite teams' games (see
 * `config/favorites.ts`). Google Calendar and Outlook fetch it from their own
 * servers, so the app must be reachable on a public URL.
 */
export async function GET() {
  const today = todayDateKey();
  const { games, failed } = await getSchedule(
    addDays(today, -PAST_DAYS),
    addDays(today, FUTURE_DAYS),
  );

  // A feed missing a sport would delete those events from every subscriber
  // until the next refresh; failing lets clients keep their previous copy.
  if (failed.length > 0) {
    return new Response(`Upstream unavailable: ${failed.join(', ')}`, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const body = buildCalendar(games.filter(isFavoriteGame), {
    name: 'Gameday – favoritlag',
    description: 'Matcher för mina favoritlag i fotboll och hockey',
    refreshHours: REFRESH_HOURS,
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="gameday.ics"',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
    },
  });
}
