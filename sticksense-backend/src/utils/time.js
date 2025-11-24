export function toUtcDate(isoString) {
  if (!isoString) {
    return null;
  }

  return new Date(isoString);
}

export function toLocalDate(isoStringOrDate, timezone = 'America/Toronto') {
  if (!isoStringOrDate) {
    return null;
  }

  const utcDate =
    isoStringOrDate instanceof Date
      ? isoStringOrDate
      : new Date(isoStringOrDate);

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const partsArray = formatter.formatToParts(utcDate);
  const parts = {};

  for (const p of partsArray) {
    parts[p.type] = p.value;
  }

  const localStr =
    `${parts.year}-${parts.month}-${parts.day}` +
    `T${parts.hour}:${parts.minute}:${parts.second}`;

  return new Date(localStr);
}

export function formatLocal(
  date,
  timezone = 'America/Toronto',
  withSeconds = false
) {
  if (!date) {
    return '';
  }

  const options = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };

  if (withSeconds) {
    options.second = '2-digit';
  }

  const formatter = new Intl.DateTimeFormat('en-CA', options);
  const formatted = formatter.format(date);

  return formatted.replace(',', '');
}

export function isPrimeTime(date, timezone = 'America/Toronto') {
  if (!date) {
    return false;
  }

  const local = toLocalDate(date, timezone);
  if (!local) {
    return false;
  }

  const hour = local.getHours();
  const minute = local.getMinutes();

  return hour === 19 && minute === 0;
}

export function isToday(date, timezone = 'America/Toronto') {
  if (!date) {
    return false;
  }

  const now = new Date();
  const localNow = toLocalDate(now, timezone);
  const localDate = toLocalDate(date, timezone);

  if (!localNow || !localDate) {
    return false;
  }

  const sameYear = localNow.getFullYear() === localDate.getFullYear();
  const sameMonth = localNow.getMonth() === localDate.getMonth();
  const sameDay = localNow.getDate() === localDate.getDate();

  return sameYear && sameMonth && sameDay;
}

export function isTomorrow(date, timezone = 'America/Toronto') {
  if (!date) {
    return false;
  }

  const now = new Date();
  const localNow = toLocalDate(now, timezone);
  const localDate = toLocalDate(date, timezone);

  if (!localNow || !localDate) {
    return false;
  }

  const diffMs = localDate.getTime() - localNow.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return Math.floor(diffDays) === 1;
}
