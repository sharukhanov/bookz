import type { Difficulty, Question } from '../data/types';

/**
 * Очки («страницы»):
 *  - база за сложность: 100 / 200 / 300;
 *  - каждая открытая подсказка снимает 30% базы;
 *  - быстрый ответ: +25% (порог зависит от длины текста — длинный пересказ никто не читает за 3 секунды);
 *  - серия верных ответов подряд умножает очки: ×1 → ×1.25 → ×1.5 → ×1.75 → ×2, ошибка сбрасывает;
 *  - идеальная игра дня: +500.
 */
export const BASE_POINTS: Record<Difficulty, number> = { 1: 100, 2: 200, 3: 300 };
export const HINT_FACTOR = [1, 0.7, 0.4, 0.4];
export const PERFECT_BONUS = 500;
export const MAX_MULTIPLIER = 2;

export function comboMultiplier(streakBefore: number): number {
  return Math.min(MAX_MULTIPLIER, 1 + 0.25 * streakBefore);
}

/** Сколько секунд считается «быстрым» ответом на этот вопрос. */
export function fastThreshold(q: Question, hintsUsed: number): number {
  const shown = [q.prompt, ...(q.clues ?? []).slice(0, hintsUsed)].join(' ').length;
  return 5 + shown / 22;
}

export interface Scored {
  points: number;
  fast: boolean;
  multiplier: number;
}

export function scoreAnswer(opts: {
  q: Question;
  correct: boolean;
  hintsUsed: number;
  timeMs: number;
  streakBefore: number;
}): Scored {
  const { q, correct, hintsUsed, timeMs, streakBefore } = opts;
  if (!correct) return { points: 0, fast: false, multiplier: 1 };
  const base = BASE_POINTS[q.difficulty] * HINT_FACTOR[Math.min(hintsUsed, 3)];
  const fast = timeMs / 1000 <= fastThreshold(q, hintsUsed);
  const multiplier = comboMultiplier(streakBefore);
  const points = Math.round(((base + (fast ? base * 0.25 : 0)) * multiplier) / 5) * 5;
  return { points, fast, multiplier };
}

export interface Rank {
  title: string;
  line: string;
}

/** Литературный уровень по доле верных ответов. */
export function rankFor(correct: number, total: number): Rank {
  const r = total ? correct / total : 0;
  if (r >= 1) return { title: 'Живой классик', line: 'Ни одной помарки. Можно издавать собрание сочинений.' };
  if (r >= 0.9) return { title: 'Библиотекарь', line: 'Знаешь, где что стоит, даже без каталога.' };
  if (r >= 0.7) return { title: 'Книжный червь', line: 'Очень уверенно. Кажется, ты правда это читал.' };
  if (r >= 0.5) return { title: 'Читатель', line: 'Крепкая середина. Завтра будет лучше.' };
  if (r >= 0.3) return { title: 'Читал краткое содержание', line: 'Главное помнишь, детали — не очень.' };
  return { title: 'Смотрел экранизацию', line: 'Тоже путь. Приходи завтра за реваншем.' };
}
