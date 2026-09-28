const DAY_MS = 24 * 60 * 60 * 1000;

export const getLocalTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export const isValidTimeZone = (timeZone) => {
  if (typeof timeZone !== 'string' || !timeZone.trim()) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return true;
  } catch {
    return false;
  }
};

// Convert a wall-clock date/time in an IANA zone to an absolute timestamp.
// Iterating the offset handles normal DST offset changes without relying on
// the browser's own time zone.
export const zonedDateTimeToEpoch = ({ year, month, day, hour, minute, timeZone }) => {
  if (!isValidTimeZone(timeZone)) return null;
  const targetUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  let epoch = targetUtc;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(epoch)).map(({ type, value }) => [type, value])
    );
    const representedUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    const correction = targetUtc - representedUtc;
    epoch += correction;
    if (correction === 0) return epoch;
  }
  return null;
};

export const formatLocalDateTime = (timestamp, options = {}) => {
  const value = Number(timestamp);
  if (!Number.isFinite(value) || value <= 0) return '';
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    ...options,
  }).format(new Date(value));
};

export const toTimeInputValue = (value, fallback = '09:00') => {
  const text = String(value || '').trim();
  const exact = text.match(/^(\d{1,2}):(\d{2})$/);
  if (exact && Number(exact[1]) <= 23 && Number(exact[2]) <= 59) {
    return `${String(Number(exact[1])).padStart(2, '0')}:${exact[2]}`;
  }
  const clock = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (clock) {
    let hour = Number(clock[1]);
    const period = (clock[3] || '').toUpperCase();
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    if (hour >= 0 && hour <= 23 && Number(clock[2]) <= 59) {
      return `${String(hour).padStart(2, '0')}:${clock[2]}`;
    }
  }
  const lower = text.toLowerCase();
  if (lower.includes('morning')) return '09:00';
  if (lower.includes('afternoon')) return '14:00';
  if (lower.includes('evening')) return '17:00';
  return fallback;
};

export const dateFromToday = (days = 1) => {
  const date = new Date(Date.now() + days * DAY_MS);
  date.setHours(12, 0, 0, 0);
  return date;
};

export const toDateInput = (dateOrDays = 1) => {
  const date =
    typeof dateOrDays === 'number' ? dateFromToday(dateOrDays) : new Date(dateOrDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toLocalDayKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatAcademicDate = (dateOrDays = 1, includeYear = true) => {
  const date =
    typeof dateOrDays === 'number' ? dateFromToday(dateOrDays) : new Date(dateOrDays);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
};

export const formatAvailability = (days = 1, time = '02:30 PM') =>
  `${formatAcademicDate(days, false)} (${time})`;
