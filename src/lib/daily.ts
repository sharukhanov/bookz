import type { Difficulty, Question, QuestionType } from '../data/types';
import { QUESTIONS } from '../data/questions';
import { addDays, LAUNCH_DAY } from './date';
import { seeded, shuffle, type Rng } from './random';

/**
 * Игра дня: 10 вопросов, одинаковых для всех, вычисляются только из даты.
 *
 * - сложность растёт: 3 лёгких → 4 средних → 3 сложных;
 * - первый вопрос — всегда «плохой пересказ» (фирменный вход в игру);
 * - два вопроса одного режима не идут подряд, и режим встречается не больше 2 раз;
 * - вопросы, выпадавшие в последние 7 дней, по возможности не повторяются.
 */
export const DAILY_SLOTS: Difficulty[] = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3];
const RECENT_WINDOW = 7;
const SALT = 'zakladka';

function pickFrom(pool: Question[], rng: Rng): Question {
  return pool[Math.floor(rng() * pool.length)];
}

function composeDay(key: string, exclude: Set<string>): Question[] {
  const rng = seeded(`${SALT}:${key}`);
  const chosen: Question[] = [];
  const used = new Set<string>();
  const typeCount: Partial<Record<QuestionType, number>> = {};

  DAILY_SLOTS.forEach((difficulty, i) => {
    const prev = chosen[i - 1]?.type;
    const fresh = QUESTIONS.filter((q) => !used.has(q.id) && !exclude.has(q.id));
    const all = QUESTIONS.filter((q) => !used.has(q.id));
    const count = (t: QuestionType) => typeCount[t] ?? 0;

    const tiers: Question[][] = [];
    for (const base of [fresh, all]) {
      const byDiff = base.filter((q) => q.difficulty === difficulty);
      if (i === 0) tiers.push(byDiff.filter((q) => q.type === 'retell'));
      tiers.push(
        byDiff.filter((q) => q.type !== prev && count(q.type) === 0),
        byDiff.filter((q) => q.type !== prev && count(q.type) < 2),
        byDiff.filter((q) => q.type !== prev),
        byDiff,
      );
    }
    tiers.push(all);

    const pool = tiers.find((t) => t.length > 0)!;
    const q = pickFrom(pool, rng);
    chosen.push(q);
    used.add(q.id);
    typeCount[q.type] = count(q.type) + 1;
  });

  return chosen;
}

const cache = new Map<string, Question[]>();

/**
 * Вопросы игры дня для даты YYYY-MM-DD.
 * Дни считаются последовательно от дня запуска: каждый день исключает вопросы
 * настоящих игр предыдущих 7 дней. Это детерминированно и дёшево (кэшируется).
 */
export function dailyQuestions(key: string): Question[] {
  const hit = cache.get(key);
  if (hit) return hit;
  if (key <= LAUNCH_DAY) {
    const qs = composeDay(key, new Set());
    cache.set(key, qs);
    return qs;
  }
  let day = LAUNCH_DAY;
  while (cache.has(addDays(day, 1)) && addDays(day, 1) < key) day = addDays(day, 1);
  let qs: Question[] = dailyQuestions(day);
  while (day < key) {
    day = addDays(day, 1);
    const recent = new Set<string>();
    for (let d = 1; d <= RECENT_WINDOW; d++) {
      const prev = addDays(day, -d);
      if (prev < LAUNCH_DAY) break;
      for (const q of cache.get(prev) ?? []) recent.add(q.id);
    }
    qs = composeDay(day, recent);
    cache.set(day, qs);
  }
  return qs;
}

/** Порядок вариантов ответа. Для игры дня — одинаковый у всех. */
export function optionOrder(q: Question, seed?: string): string[] {
  if (q.fixedOrder) return q.options.slice();
  return shuffle(q.options, seed ? seeded(`${SALT}:${seed}:${q.id}`) : Math.random);
}

/** Тренировка: случайные вопросы одного режима, от лёгких к сложным. */
export function practiceQuestions(type: QuestionType, count = 8): Question[] {
  const pool = shuffle(QUESTIONS.filter((q) => q.type === type));
  return pool.slice(0, count).sort((a, b) => a.difficulty - b.difficulty);
}
