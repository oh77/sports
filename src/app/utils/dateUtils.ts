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
