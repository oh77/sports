export const TIME_ZONE = 'Europe/Stockholm';

/** Swedish local calendar day (YYYY-MM-DD) of an ISO timestamp. */
export const dateKeyFromString = (dateTimeStr: string) =>
  new Date(dateTimeStr).toLocaleDateString('sv-SE', { timeZone: TIME_ZONE });

/** Today's date key (YYYY-MM-DD) in Swedish local time. */
export const todayDateKey = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: TIME_ZONE });

/** Shift a date key by whole calendar days. */
export function addDays(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export const formatTimeFromString = (dateTimeStr: string) =>
  new Date(dateTimeStr).toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  });

/**
 * Day heading for a date key, e.g. "Idag · lördag 13 sep",
 * "Imorgon · söndag 14 sep", "måndag 15 sep".
 */
export function formatDayLabel(key: string): string {
  const [year, month, day] = key.split('-').map(Number);
  // A date key names a calendar day, not an instant — format it in UTC.
  const label = new Date(Date.UTC(year, month - 1, day, 12))
    .toLocaleDateString('sv-SE', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })
    .replace('.', '');

  const today = todayDateKey();
  if (key === today) return `Idag · ${label}`;
  if (key === addDays(today, 1)) return `Imorgon · ${label}`;
  return label;
}
