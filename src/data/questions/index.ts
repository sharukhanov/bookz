import type { Question, QuestionType } from '../types';
import { retell } from './retell';
import { line } from './line';
import { character } from './character';
import { author } from './author';
import { emoji } from './emoji';
import { fake } from './fake';
import { screen } from './screen';
import { fame } from './fame';
import { money } from './money';

/** Все вопросы игры. Новый режим = новый файл + строка здесь + запись в modes.ts. */
export const QUESTIONS: Question[] = [
  ...retell,
  ...line,
  ...character,
  ...author,
  ...emoji,
  ...fake,
  ...screen,
  ...fame,
  ...money,
];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

export function questionsOfType(type: QuestionType): Question[] {
  return QUESTIONS.filter((q) => q.type === type);
}
