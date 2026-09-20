const DAY_MS = 24 * 60 * 60 * 1000;

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
