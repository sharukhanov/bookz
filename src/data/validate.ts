import type { Question } from './types';
import { MODES } from './modes';

/** Возвращает список проблем в датасете. Пустой массив — всё в порядке. */
export function validateQuestions(questions: Question[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const q of questions) {
    const at = `[${q.id}]`;
    if (!q.id) errors.push('Вопрос без id');
    if (ids.has(q.id)) errors.push(`${at} повторяющийся id`);
    ids.add(q.id);
    if (!MODES[q.type]) errors.push(`${at} неизвестный type "${q.type}"`);
    if (![1, 2, 3].includes(q.difficulty)) errors.push(`${at} difficulty должен быть 1, 2 или 3`);
    if (!q.prompt?.trim()) errors.push(`${at} пустой prompt`);
    if (!q.explanation?.trim()) errors.push(`${at} пустой explanation`);
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4)
      errors.push(`${at} вариантов должно быть от 2 до 4`);
    if (new Set(q.options).size !== q.options.length) errors.push(`${at} варианты повторяются`);
    if (!q.options.includes(q.answer)) errors.push(`${at} answer не совпадает ни с одним вариантом`);
    if ((q.type === 'character' || q.type === 'author') && !q.clues?.length)
      errors.push(`${at} для ${q.type} нужны clues`);
    if (q.type === 'emoji' && !q.emoji) errors.push(`${at} для emoji нужно поле emoji`);
  }
  return errors;
}
