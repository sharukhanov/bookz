import type { QuestionType } from '../data/types';

// Единый набор линейных иконок режимов (24×24, обводка currentColor).
const PATHS: Record<QuestionType, string> = {
  // облачко реплики с «пересказом»
  retell: 'M4 5h16v11H9l-5 4zM8 9h8M8 12.5h5',
  // кавычки
  line: 'M5 17c2-1 3-3 3-6H5V6h5v5c0 4-2 6.5-5 7.5M14 17c2-1 3-3 3-6h-3V6h5v5c0 4-2 6.5-5 7.5',
  // силуэт с вопросом
  character: 'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c.8-3.8 3.5-6 7-6s6.2 2.2 7 6',
  // перо
  author: 'M4 20l4.5-1.5L19 8a2.1 2.1 0 0 0-3-3L5.5 15.5zM14 7l3 3M4 20l3-3',
  // смайлик
  emoji: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM8.5 14c.9 1.4 2.1 2 3.5 2s2.6-.6 3.5-2M9 9.5v1M15 9.5v1',
  // книга, перечёркнутая
  fake: 'M5 4.5h11a2 2 0 0 1 2 2V19.5H7a2 2 0 0 1-2-2zM5 17.5a2 2 0 0 1 2-2h11M9 8l5 5M14 8l-5 5',
  // хлопушка / кадр
  screen: 'M4 9h16v10H4zM4 9l2-4.5 14 0-2 4.5M9 4.5 7 9M14 4.5 12 9M10 12.5v3.5l3-1.75z',
  // растущий график
  fame: 'M4 18l5-5 3.5 3L20 8M15 8h5v5',
  // монета
  money: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM10 16.5V7.5h3a2.3 2.3 0 0 1 0 4.6h-4.2M8.8 14.5h4.4',
};

export function ModeIcon({ type, size = 24 }: { type: QuestionType; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[type]} />
    </svg>
  );
}
