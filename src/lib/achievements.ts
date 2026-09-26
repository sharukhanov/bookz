import type { Store, AnswerRecord } from './storage';
import { MODE_ORDER } from '../data/modes';

export interface GameSummary {
  kind: 'daily' | 'practice';
  answers: AnswerRecord[];
  score: number;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  /** s — стор уже с учётом только что сыгранной партии */
  check: (s: Store, g: GameSummary) => boolean;
}

const correctOf = (s: Store, t: keyof Store['totals']['byType']) => s.totals.byType[t]?.correct ?? 0;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', icon: '📖', title: 'Первая закладка', desc: 'Сыграть первую игру дня', check: (s) => s.totals.games >= 1 },
  {
    id: 'perfect',
    icon: '💯',
    title: 'Без помарок',
    desc: '10 из 10 в игре дня',
    check: (_, g) => g.kind === 'daily' && g.answers.length > 0 && g.answers.every((a) => a.correct),
  },
  { id: 'streak3', icon: '🔥', title: 'Втянулся', desc: 'Серия 3 дня', check: (s) => s.streak.current >= 3 },
  { id: 'streak7', icon: '🗓', title: 'Неделя чтения', desc: 'Серия 7 дней', check: (s) => s.streak.current >= 7 },
  { id: 'streak30', icon: '🏛', title: 'Абонемент', desc: 'Серия 30 дней', check: (s) => s.streak.current >= 30 },
  { id: 'worm', icon: '🐛', title: 'Книжный червь', desc: '100 верных ответов всего', check: (s) => s.totals.correct >= 100 },
  { id: 'detective', icon: '🕵️', title: 'Детектив', desc: 'Разоблачить 10 выдуманных книг', check: (s) => correctOf(s, 'fake') >= 10 },
  { id: 'casting', icon: '🎭', title: 'Кастинг-директор', desc: 'Узнать 10 персонажей', check: (s) => correctOf(s, 'character') >= 10 },
  { id: 'cinephile', icon: '🎬', title: 'Киноман', desc: '10 верных ответов в «Книге или кино»', check: (s) => correctOf(s, 'screen') >= 10 },
  { id: 'erudite', icon: '🧠', title: 'Эрудит', desc: '5 сложных вопросов подряд без ошибок', check: (s) => s.totals.hardRunBest >= 5 },
  { id: 'firstclue', icon: '🔎', title: 'С первой подсказки', desc: '5 раз угадать героя или автора без подсказок', check: (s) => s.totals.firstClue >= 5 },
  {
    id: 'speed',
    icon: '⚡',
    title: 'Скорочтение',
    desc: '5 быстрых ответов за одну игру',
    check: (_, g) => g.answers.filter((a) => a.fast && a.correct).length >= 5,
  },
  { id: 'score3000', icon: '🏆', title: 'Рекордсмен', desc: '3000 очков за одну игру дня', check: (_, g) => g.kind === 'daily' && g.score >= 3000 },
  {
    id: 'omnivore',
    icon: '🧭',
    title: 'Всеядный',
    desc: 'Верно ответить хотя бы раз в каждом режиме',
    check: (s) => MODE_ORDER.every((t) => correctOf(s, t) > 0),
  },
  { id: 'practice', icon: '🎯', title: 'Тренировка', desc: 'Сыграть 10 разминок по режимам', check: (s) => s.totals.practice >= 10 },
  {
    id: 'night',
    icon: '🌙',
    title: 'Полуночник',
    desc: 'Доиграть партию между полуночью и пятью утра',
    check: () => new Date().getHours() < 5,
  },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
