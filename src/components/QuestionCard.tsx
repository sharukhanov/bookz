import { useEffect, useRef } from 'react';
import type { Question } from '../data/types';
import { MODES } from '../data/modes';
import { ModeIcon } from './ModeIcon';
import type { AnswerRecord } from '../lib/storage';
import { HINT_FACTOR } from '../lib/scoring';

export interface Round {
  q: Question;
  options: string[];
}

/** Подсказки, которые можно открывать по одной. Для эмодзи подсказка — текстовая расшифровка. */
export function hintsOf(q: Question): string[] {
  if (q.type === 'emoji') return [q.prompt];
  return q.clues ?? [];
}

const KEYS = ['1', '2', '3', '4'];

interface Props {
  round: Round;
  number: number;
  total: number;
  hints: number;
  answer?: AnswerRecord;
  onChoose: (option: string) => void;
  onHint: () => void;
  onNext: () => void;
  isLast: boolean;
}

export function QuestionCard({ round, number, total, hints, answer, onChoose, onHint, onNext, isLast }: Props) {
  const { q, options } = round;
  const mode = MODES[q.type];
  const revealed = !!answer;
  const hintList = hintsOf(q);
  const nextRef = useRef<HTMLButtonElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  // Два коротких варианта — в строку (книга/кино, хит/позже); длинные пары — столбиком.
  const binary = options.length === 2 && options.every((o) => o.length <= 24);

  useEffect(() => {
    if (!revealed) return;
    nextRef.current?.focus({ preventScroll: true });
    const t = setTimeout(() => revealRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
    return () => clearTimeout(t);
  }, [revealed]);

  const clueMode = q.type === 'character' || q.type === 'author';
  const shownClues = clueMode ? [q.prompt, ...hintList.slice(0, revealed ? hintList.length : hints)] : [];
  const canHint = !revealed && hints < hintList.length;
  const nextPenalty = Math.round((HINT_FACTOR[hints] - HINT_FACTOR[hints + 1]) * 100);

  return (
    <article
      className={`qcard qtype-${q.type} ${revealed ? (answer!.correct ? 'is-correct' : 'is-wrong') : ''}`}
      aria-labelledby="q-ask"
    >
      <div className="qcard-meta">
        <span className="qcard-mode">
          <span className="qcard-glyph">
            <ModeIcon type={q.type} size={18} />
          </span>
          <span className="qcard-mode-name">{mode.title}</span>
        </span>
        <span className="qcard-count">
          {number}/{total}
          <span className="diff" aria-label={`Сложность ${q.difficulty} из 3`}>
            {[1, 2, 3].map((d) => (
              <i key={d} className={d <= q.difficulty ? 'on' : ''} />
            ))}
          </span>
        </span>
      </div>

      {q.tag && (
        <div className="qcard-tag">
          <span className="tag">{q.tag}</span>
        </div>
      )}

      <h2 id="q-ask" className="qcard-ask">
        {q.ask ?? mode.ask}
      </h2>

      <div className="qcard-body">
        {q.image && <img className="qcard-image" src={import.meta.env.BASE_URL + q.image} alt="" />}

        {q.type === 'emoji' && (
          <div className="emoji-cover">
            <div className="emoji-cover-art">{q.emoji}</div>
            {(hints > 0 || revealed) && <p className="emoji-caption fade-in">{q.prompt}</p>}
          </div>
        )}

        {clueMode && (
          <ol className="clues">
            {shownClues.map((c, i) => (
              <li key={i} className="clue fade-in">
                <span className="clue-n">Подсказка {i + 1}</span>
                {c}
              </li>
            ))}
          </ol>
        )}

        {q.type === 'line' && <blockquote className="quote">{q.prompt}</blockquote>}

        {(q.type === 'retell' || q.type === 'money') && <p className="prose">{q.prompt}</p>}
        {(q.type === 'screen' || q.type === 'fame') && <p className="prose prose-title">{q.prompt}</p>}
        {q.type === 'fake' && <p className="muted small">{q.prompt}</p>}
      </div>

      {canHint && hintList.length > 0 && (
        <button className="btn btn-ghost hint-btn" onClick={onHint}>
          {q.type === 'emoji' ? 'Расшифровка' : 'Ещё подсказка'} <span className="muted">−{nextPenalty}% очков</span>
          <kbd>H</kbd>
        </button>
      )}

      <div className={`options ${binary ? 'options-binary' : ''} ${q.type === 'fake' ? 'options-titles' : ''}`} role="group" aria-label="Варианты ответа">
        {options.map((opt, i) => {
          const isAnswer = opt === q.answer;
          const isChoice = answer?.choice === opt;
          let state = '';
          if (revealed) {
            if (isAnswer) state = 'is-right';
            else if (isChoice) state = 'is-wrong';
            else state = 'is-dim';
          }
          return (
            <button
              key={opt}
              className={`option ${state}`}
              onClick={() => onChoose(opt)}
              disabled={revealed}
              aria-pressed={isChoice}
              style={{ animationDelay: `${80 + i * 50}ms` }}
            >
              <kbd>{KEYS[i]}</kbd>
              <span className="option-text">{q.type === 'fake' ? `«${opt}»` : opt}</span>
              {revealed && isAnswer && <span className="option-mark" aria-label="правильный ответ">✓</span>}
              {revealed && isChoice && !isAnswer && <span className="option-mark" aria-label="ваш ответ">✕</span>}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="reveal" ref={revealRef}>
          <div className="reveal-head">
            <strong className="verdict">{answer!.correct ? 'Верно' : answer!.choice ? 'Мимо' : 'Время вышло'}</strong>
            {answer!.correct ? (
              <span className="points-pop">+{answer!.points}</span>
            ) : (
              <span className="muted">Правильно: {q.answer}</span>
            )}
            {answer!.correct && answer!.fast && <span className="chip chip-soft">⚡ быстро</span>}
            {answer!.correct && answer!.hints > 0 && (
              <span className="chip chip-soft">
                {answer!.hints} {answer!.hints === 1 ? 'подсказка' : 'подсказки'}
              </span>
            )}
          </div>
          <p className="explanation">{q.explanation}</p>
          <button ref={nextRef} className="btn btn-primary next-btn" onClick={onNext}>
            {isLast ? 'Итоги' : 'Дальше'} <span aria-hidden="true">→</span>
            <kbd>Enter</kbd>
          </button>
        </div>
      )}
    </article>
  );
}
