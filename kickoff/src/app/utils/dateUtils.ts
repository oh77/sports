const TIME_ZONE = 'Europe/Stockholm';

export const formatTimeFromDate = (date: Date) =>
  date.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
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
      timeZone: TIME_ZONE,
    });
  } catch {
    return dateTimeStr;
  }
};

export const formatShortDateFromString = (dateTimeStr: string) => {
  try {
    const date = new Date(dateTimeStr);
    const day = date.toLocaleDateString('sv-SE', {
      day: 'numeric',
      timeZone: TIME_ZONE,
    });
    const month = date
      .toLocaleDateString('sv-SE', { month: 'short', timeZone: TIME_ZONE })
      .replace('.', '');
    return `${day} ${month}`;
  } catch {
    return dateTimeStr;
  }
};

/** Today's date key (YYYY-MM-DD) in Swedish local time. */
export const todayDateKey = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: TIME_ZONE });

/** Stable per-day grouping key (YYYY-MM-DD) in Swedish local time. */
export const dateKeyFromString = (dateTimeStr: string) => {
  try {
    return new Date(dateTimeStr).toLocaleDateString('sv-SE', {
      timeZone: TIME_ZONE,
    });
  } catch {
    return dateTimeStr;
  }
};

export const isDateTimePassed = (startDateTime: Date, offsetMs: number = 0) => {
  const now = new Date();
  return now.getTime() - startDateTime.getTime() > offsetMs;
};

/**
 * Convert a zone-naive local timestamp ("2025-08-22 20:00:00") in the given
 * IANA time zone to an ISO 8601 UTC string. Used for providers that send
 * kick-off times as stadium-local wall clock time.
 */
export function zonedTimeToIso(
  naiveDateTime: string,
  timeZone: string,
): string {
  const utcGuess = new Date(`${naiveDateTime.replace(' ', 'T')}Z`);
  const offsetMs = timeZoneOffsetMs(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMs).toISOString();
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
  return asUtc - instant.getTime();
}
