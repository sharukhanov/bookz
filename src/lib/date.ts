/** Даты хранятся как локальные ключи YYYY-MM-DD: у каждого игрока «сегодня» — по его часам. */

/** День запуска: выпуск №1. */
export const LAUNCH_DAY = '2026-09-26';

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toUTC(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const t = new Date(toUTC(key) + n * 86400000);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toUTC(b) - toUTC(a)) / 86400000);
}

/** Номер выпуска: 26.09.2026 — №1. */
export function issueNumber(key: string): number {
  return daysBetween(LAUNCH_DAY, key) + 1;
}

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

function parse(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDay(key: string): string {
  const d = parse(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function weekday(key: string): string {
  return WEEKDAYS[parse(key).getDay()];
}

export function weekdayShort(key: string): string {
  return WEEKDAYS_SHORT[parse(key).getDay()];
}

/** «сегодня» / «вчера» / «24 сентября» */
export function relativeDay(key: string, today = dayKey()): string {
  const diff = daysBetween(key, today);
  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Вчера';
  return formatDay(key);
}

/** Миллисекунды до следующей локальной полуночи. */
export function msUntilTomorrow(now = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function plural(n: number, one: string, few: string, many: string): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
