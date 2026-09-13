export const getDay = (gameDate: Date) => gameDate.getDate();

export const formatShortMonthFromDate = (gameDate: Date) =>
  gameDate.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '');

export const formatTimeFromDate = (gameDate: Date) =>
  gameDate.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatTimeFromString = (dateTimeStr: string) => {
  try {
    return formatTimeFromDate(new Date(dateTimeStr));
  } catch {
    return dateTimeStr;
  }
};

export const formatLongDateFromString = (dateTimeStr: string) => {
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateTimeStr;
  }
};

export const formatLongDateTimeFromString = (dateTimeStr: string) => {
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateTimeStr;
  }
};

export const isDateTimePassed = (startDateTime: Date, offsetMs: number = 0) => {
  const now = new Date();
  return now.getTime() - startDateTime.getTime() > offsetMs;
};

export const formatShortDateFromString = (dateTimeStr: string) => {
  try {
    const date = new Date(dateTimeStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('sv-SE', { month: 'short' });
    return `${day} ${month}`;
  } catch {
    return dateTimeStr;
  }
};

/** Ends in `Z` or a `±HH:MM` / `±HHMM` offset. */
const HAS_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * An ISO 8601 UTC string for a provider timestamp. Statnet (SHL/SDHL/HA) sends
 * zone-less Swedish wall-clock times ("2026-09-13T19:00:00"), which `new Date`
 * would read in the runtime's zone — UTC on Vercel, two hours off in summer.
 * Zone-less input is therefore read in `timeZone`; anything with an offset is
 * already an instant and only normalized.
 */
export function toUtcIso(
  dateTime: string,
  timeZone = 'Europe/Stockholm',
): string {
  const value = dateTime.trim().replace(' ', 'T');
  if (HAS_OFFSET.test(value)) return new Date(value).toISOString();

  const utcGuess = new Date(`${value}Z`);
  if (Number.isNaN(utcGuess.getTime())) return dateTime;
  // Two passes so times near a DST switch pick up the offset in force then.
  const first = utcGuess.getTime() - timeZoneOffsetMs(utcGuess, timeZone);
  const offset = timeZoneOffsetMs(new Date(first), timeZone);
  return new Date(utcGuess.getTime() - offset).toISOString();
}

/** Offset of a time zone (ms east of UTC) at a given instant. */
function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  // Intl drops milliseconds; compare at whole-second precision.
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}
