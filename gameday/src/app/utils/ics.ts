import { LEAGUES } from '@/app/config/leagues';
import type { Game } from '@/app/types/domain/game';
import type { Sport } from '@/app/types/domain/league';

/**
 * iCalendar (RFC 5545) feed builder for calendar subscriptions in Google
 * Calendar and Outlook. Times are written in UTC, so no VTIMEZONE is needed;
 * clients render them in the viewer's zone.
 */

/** Blocked-out event length per sport; providers don't publish end times. */
const DURATION_MINUTES: Record<Sport, number> = {
  football: 120,
  hockey: 150,
};

export type CalendarOptions = {
  name: string;
  description: string;
  /** How often clients that honour it should re-fetch the feed. */
  refreshHours: number;
};

export function buildCalendar(games: Game[], options: CalendarOptions): string {
  const stamp = formatUtc(new Date());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//oh77//Gameday//SV',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(options.name)}`,
    `X-WR-CALDESC:${escapeText(options.description)}`,
    'X-WR-TIMEZONE:Europe/Stockholm',
    `REFRESH-INTERVAL;VALUE=DURATION:PT${options.refreshHours}H`,
    `X-PUBLISHED-TTL:PT${options.refreshHours}H`,
    ...games.flatMap((game) => event(game, stamp)),
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

function event(game: Game, stamp: string): string[] {
  const start = new Date(game.startDateTime);
  const end = new Date(
    start.getTime() + DURATION_MINUTES[game.sport] * 60 * 1000,
  );
  const league = LEAGUES[game.league].name;
  const description = [league, game.roundLabel].filter(Boolean).join(' · ');

  return [
    'BEGIN:VEVENT',
    // Stable per game so clients update events in place on refresh.
    `UID:${game.league}-${escapeText(game.id)}@gameday`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${escapeText(summary(game))}`,
    `DESCRIPTION:${escapeText(description)}`,
    ...(game.venue ? [`LOCATION:${escapeText(game.venue)}`] : []),
    `CATEGORIES:${escapeText(league)}`,
    'STATUS:CONFIRMED',
    // Games shouldn't mark the subscriber as busy.
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
  ];
}

/** "Malmö FF – AIK", or with the score once the game has started. */
function summary({ state, home, away }: Game): string {
  return state === 'not-started'
    ? `${home.name} – ${away.name}`
    : `${home.name} ${home.score}–${away.score} ${away.name}`;
}

/** 20260913T170000Z */
function formatUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/\.\d{3}/, '')
    .replace(/[-:]/g, '');
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

const encoder = new TextEncoder();

/**
 * Fold a content line at 75 octets (RFC 5545 §3.1), never splitting a UTF-8
 * character. Continuation lines start with a space, which counts toward their
 * 75 octets.
 */
function fold(line: string): string {
  const parts: string[] = [];
  let current = '';
  let bytes = 0;
  let limit = 75;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > limit) {
      parts.push(current);
      current = '';
      bytes = 0;
      limit = 74;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join('\r\n ');
}
