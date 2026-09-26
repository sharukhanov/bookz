import { addDays, dayKey } from './date';
import { PERFECT_BONUS } from './scoring';
import { getStore, updateStore, type AnswerRecord, type DailyRecord, type StreakState, type Store } from './storage';
import { ACHIEVEMENTS, type GameSummary } from './achievements';
import type { QuestionType } from '../data/types';

/** Серия, которую видит игрок сегодня (0 — если серия сгорела). */
export function liveStreak(s: StreakState, today = dayKey()): { days: number; playedToday: boolean; atRisk: boolean } {
  if (!s.last) return { days: 0, playedToday: false, atRisk: false };
  if (s.last === today) return { days: s.current, playedToday: true, atRisk: false };
  if (s.last === addDays(today, -1)) return { days: s.current, playedToday: false, atRisk: false };
  if (s.last === addDays(today, -2) && s.freezes > 0) return { days: s.current, playedToday: false, atRisk: true };
  return { days: 0, playedToday: false, atRisk: false };
}

function nextStreak(s: StreakState, day: string): StreakState {
  if (s.last === day) return s;
  let { current, freezes, savedByFreeze } = s;
  if (s.last === addDays(day, -1)) current += 1;
  else if (s.last === addDays(day, -2) && freezes > 0) {
    current += 1;
    freezes -= 1;
    savedByFreeze += 1;
  } else current = 1;
  if (current > 0 && current % 7 === 0 && freezes < 1) freezes = 1;
  return { current, best: Math.max(s.best, current), last: day, freezes, savedByFreeze };
}

function addTotals(s: Store, answers: AnswerRecord[]): Store['totals'] {
  const t = { ...s.totals, byType: { ...s.totals.byType } };
  for (const a of answers) {
    t.answered++;
    if (a.correct) t.correct++;
    const bt = t.byType[a.type] ?? { seen: 0, correct: 0 };
    t.byType[a.type] = { seen: bt.seen + 1, correct: bt.correct + (a.correct ? 1 : 0) };
    if (a.difficulty === 3) {
      t.hardRun = a.correct ? t.hardRun + 1 : 0;
      t.hardRunBest = Math.max(t.hardRunBest, t.hardRun);
    }
    if (a.correct && a.hints === 0 && (a.type === 'character' || a.type === 'author')) t.firstClue++;
  }
  return t;
}

function unlock(s: Store, summary: GameSummary): { store: Store; unlocked: string[] } {
  const unlocked: string[] = [];
  const achievements = { ...s.achievements };
  for (const a of ACHIEVEMENTS) {
    if (!achievements[a.id] && a.check(s, summary)) {
      achievements[a.id] = dayKey();
      unlocked.push(a.id);
    }
  }
  return { store: { ...s, achievements }, unlocked };
}

export function scoreOf(answers: AnswerRecord[]): number {
  const base = answers.reduce((sum, a) => sum + a.points, 0);
  const perfect = answers.length > 0 && answers.every((a) => a.correct);
  return base + (perfect ? PERFECT_BONUS : 0);
}

export interface FinishResult {
  record: DailyRecord;
  unlocked: string[];
}

/** Завершение игры дня: результат, серия, статистика, достижения. */
export function finishDaily(day: string, answers: AnswerRecord[]): FinishResult {
  const existing = getStore().daily[day];
  if (existing) return { record: existing, unlocked: [] };
  const record: DailyRecord = {
    day,
    correct: answers.filter((a) => a.correct).length,
    total: answers.length,
    score: scoreOf(answers),
    answers,
    finishedAt: Date.now(),
  };
  let unlocked: string[] = [];
  updateStore((s) => {
    const next: Store = {
      ...s,
      current: undefined,
      daily: { ...s.daily, [day]: record },
      streak: nextStreak(s.streak, day),
      totals: { ...addTotals(s, answers), games: s.totals.games + 1 },
    };
    const r = unlock(next, { kind: 'daily', answers, score: record.score });
    unlocked = r.unlocked;
    return r.store;
  });
  return { record, unlocked };
}

/** Завершение тренировки: в серию и историю не идёт, но копит статистику и достижения. */
export function finishPractice(answers: AnswerRecord[]): { score: number; unlocked: string[] } {
  const score = scoreOf(answers);
  let unlocked: string[] = [];
  updateStore((s) => {
    const next: Store = { ...s, totals: { ...addTotals(s, answers), practice: s.totals.practice + 1 } };
    const r = unlock(next, { kind: 'practice', answers, score });
    unlocked = r.unlocked;
    return r.store;
  });
  return { score, unlocked };
}

/** Доля верных ответов по режимам за всё время. */
export function typeAccuracy(s: Store): { type: QuestionType; seen: number; rate: number }[] {
  return (Object.entries(s.totals.byType) as [QuestionType, { seen: number; correct: number }][])
    .filter(([, v]) => v.seen > 0)
    .map(([type, v]) => ({ type, seen: v.seen, rate: v.correct / v.seen }));
}
