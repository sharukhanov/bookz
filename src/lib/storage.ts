import { useSyncExternalStore } from 'react';
import type { QuestionType } from '../data/types';

/** Весь прогресс игрока живёт в одном ключе localStorage. Без аккаунтов и сервера. */

const KEY = 'zakladka:v1';

export interface AnswerRecord {
  id: string;
  type: QuestionType;
  difficulty: number;
  correct: boolean;
  /** выбранный вариант (null — если ответа нет) */
  choice: string | null;
  hints: number;
  timeMs: number;
  points: number;
  fast: boolean;
}

export interface DailyRecord {
  day: string;
  correct: number;
  total: number;
  score: number;
  answers: AnswerRecord[];
  finishedAt: number;
}

/** Незаконченная игра дня — чтобы refresh не сбрасывал прогресс. */
export interface SavedSession {
  day: string;
  ids: string[];
  options: string[][];
  answers: AnswerRecord[];
}

export interface Totals {
  games: number;
  practice: number;
  answered: number;
  correct: number;
  byType: Partial<Record<QuestionType, { seen: number; correct: number }>>;
  hardRun: number;
  hardRunBest: number;
  firstClue: number;
}

export interface StreakState {
  current: number;
  best: number;
  last?: string;
  /** Заморозка: одна пропущенная игра не сжигает серию. Выдаётся за каждые 7 дней подряд, максимум одна. */
  freezes: number;
  savedByFreeze: number;
}

export interface Store {
  daily: Record<string, DailyRecord>;
  current?: SavedSession;
  streak: StreakState;
  totals: Totals;
  achievements: Record<string, string>;
  theme?: 'light' | 'dark';
}

function empty(): Store {
  return {
    daily: {},
    streak: { current: 0, best: 0, freezes: 0, savedByFreeze: 0 },
    totals: { games: 0, practice: 0, answered: 0, correct: 0, byType: {}, hardRun: 0, hardRunBest: 0, firstClue: 0 },
    achievements: {},
  };
}

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<Store>;
    const base = empty();
    return {
      ...base,
      ...parsed,
      streak: { ...base.streak, ...parsed.streak },
      totals: { ...base.totals, ...parsed.totals },
    };
  } catch {
    return empty();
  }
}

let state: Store = load();
const listeners = new Set<() => void>();

export function getStore(): Store {
  return state;
}

export function updateStore(fn: (s: Store) => Store): void {
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* приватный режим или переполнение — играем без сохранения */
  }
  listeners.forEach((l) => l());
}

export function resetStore(): void {
  updateStore(() => empty());
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

// Синхронизация между вкладками.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}

export function useStore(): Store {
  return useSyncExternalStore(subscribe, getStore, getStore);
}
