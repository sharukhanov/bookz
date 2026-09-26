import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QuestionCard, hintsOf, type Round } from '../components/QuestionCard';
import { ResultView } from '../components/ResultView';
import { Logo } from '../components/Header';
import { QUESTION_BY_ID } from '../data/questions';
import { MODES } from '../data/modes';
import type { QuestionType } from '../data/types';
import { dailyQuestions, optionOrder, practiceQuestions } from '../lib/daily';
import { dayKey } from '../lib/date';
import { finishDaily, finishPractice } from '../lib/progress';
import { comboMultiplier, scoreAnswer } from '../lib/scoring';
import { getStore, updateStore, type AnswerRecord } from '../lib/storage';
import { go } from '../lib/router';
import { formatScore } from '../lib/share';

type Props = { kind: 'daily'; type?: undefined } | { kind: 'practice'; type: QuestionType };

interface Setup {
  rounds: Round[];
  answers: AnswerRecord[];
}

function setupDaily(day: string): Setup {
  const saved = getStore().current;
  if (saved?.day === day) {
    const rounds = saved.ids.map((id, i) => ({ q: QUESTION_BY_ID[id], options: saved.options[i] }));
    if (rounds.every((r) => r.q && r.options)) return { rounds, answers: saved.answers };
  }
  const rounds = dailyQuestions(day).map((q) => ({ q, options: optionOrder(q, day) }));
  return { rounds, answers: [] };
}

function setupPractice(type: QuestionType): Setup {
  return { rounds: practiceQuestions(type).map((q) => ({ q, options: optionOrder(q) })), answers: [] };
}

function trailingCorrect(answers: AnswerRecord[]): number {
  let n = 0;
  for (let i = answers.length - 1; i >= 0 && answers[i].correct; i--) n++;
  return n;
}

export function Game(props: Props) {
  const day = useMemo(() => dayKey(), []);
  // Читаем один раз: после завершения партии GameRun сам покажет итоги с новыми достижениями.
  const [alreadyPlayed] = useState(() => (props.kind === 'daily' ? getStore().daily[day] : undefined));

  if (alreadyPlayed) {
    const rounds = alreadyPlayed.answers.map((a) => ({ q: QUESTION_BY_ID[a.id], options: [] }));
    return (
      <ResultView
        kind="daily"
        day={day}
        answers={alreadyPlayed.answers}
        rounds={rounds}
        score={alreadyPlayed.score}
        unlocked={[]}
      />
    );
  }
  return <GameRun {...props} day={day} />;
}

function GameRun(props: Props & { day: string }) {
  const { kind, day } = props;
  const [setup, setSetup] = useState<Setup>(() => (kind === 'daily' ? setupDaily(day) : setupPractice(props.type!)));
  const { rounds } = setup;
  const [answers, setAnswers] = useState<AnswerRecord[]>(setup.answers);
  const [index, setIndex] = useState(setup.answers.length);
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<{ score: number; unlocked: string[] } | null>(null);
  const started = useRef(performance.now());

  // Сохраняем набор вопросов игры дня сразу — refresh продолжит с того же места.
  useEffect(() => {
    if (kind !== 'daily') return;
    updateStore((s) =>
      s.current?.day === day
        ? s
        : { ...s, current: { day, ids: rounds.map((r) => r.q.id), options: rounds.map((r) => r.options), answers: [] } },
    );
  }, [kind, day, rounds]);

  useEffect(() => {
    started.current = performance.now();
  }, [index]);

  const answer = answers[index];
  const round = rounds[index];

  const finish = useCallback(
    (all: AnswerRecord[]) => {
      if (kind === 'daily') {
        const r = finishDaily(day, all);
        setResult({ score: r.record.score, unlocked: r.unlocked });
      } else {
        setResult(finishPractice(all));
      }
      window.scrollTo({ top: 0 });
    },
    [kind, day],
  );

  // Refresh на последнем ответе: все ответы есть, а итогов ещё нет.
  useEffect(() => {
    if (!result && index >= rounds.length && answers.length >= rounds.length) finish(answers);
  }, [index, rounds.length, answers, result, finish]);

  const choose = useCallback(
    (option: string) => {
      if (!round || answer) return;
      const correct = option === round.q.answer;
      const timeMs = Math.round(performance.now() - started.current);
      const s = scoreAnswer({ q: round.q, correct, hintsUsed: hints, timeMs, streakBefore: trailingCorrect(answers) });
      const rec: AnswerRecord = {
        id: round.q.id,
        type: round.q.type,
        difficulty: round.q.difficulty,
        correct,
        choice: option,
        hints,
        timeMs,
        points: s.points,
        fast: s.fast,
      };
      const next = [...answers, rec];
      setAnswers(next);
      if (navigator.vibrate && !correct) navigator.vibrate(40);
      if (kind === 'daily') {
        updateStore((st) => (st.current?.day === day ? { ...st, current: { ...st.current, answers: next } } : st));
      }
    },
    [round, answer, hints, answers, kind, day],
  );

  const hint = useCallback(() => {
    if (!round || answer) return;
    setHints((h) => Math.min(h + 1, hintsOf(round.q).length));
  }, [round, answer]);

  const nextQ = useCallback(() => {
    if (!answer) return;
    if (index + 1 >= rounds.length) finish(answers);
    else {
      setIndex(index + 1);
      setHints(0);
    }
  }, [answer, index, rounds.length, answers, finish]);

  const restart = () => {
    if (kind !== 'practice') return;
    const s = setupPractice(props.type!);
    setSetup(s);
    setAnswers([]);
    setIndex(0);
    setHints(0);
    setResult(null);
  };

  useEffect(() => {
    if (result) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') return go('/');
      if (!round) return;
      const n = Number(e.key);
      if (!answer && n >= 1 && n <= round.options.length) {
        e.preventDefault();
        choose(round.options[n - 1]);
      } else if (!answer && (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р')) {
        hint();
      } else if (answer && (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ')) {
        e.preventDefault();
        nextQ();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [round, answer, choose, hint, nextQ, result]);

  if (result) {
    return (
      <ResultView
        kind={kind}
        day={day}
        mode={props.type}
        answers={answers}
        rounds={rounds}
        score={result.score}
        unlocked={result.unlocked}
        onRestart={kind === 'practice' ? restart : undefined}
      />
    );
  }

  if (!round) return <div className="page loading">Листаем страницы…</div>;

  const score = answers.reduce((s, a) => s + a.points, 0);
  const combo = trailingCorrect(answer ? answers : answers.slice(0, index));
  const mult = comboMultiplier(combo);

  return (
    <div className="page game">
      <header className="game-bar">
        <a className="icon-btn" href="#/" aria-label="Выйти на главную" title="На главную (Esc)">
          ✕
        </a>
        <div className="game-title">
          {kind === 'daily' ? <Logo /> : <span className="game-mode">Разминка · {MODES[props.type!].title}</span>}
        </div>
        <div className="game-score" aria-live="polite">
          {mult > 1 && <span className="combo">×{mult}</span>}
          <span className="tabular">{formatScore(score)}</span>
        </div>
      </header>

      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={rounds.length} aria-valuenow={answers.length}>
        {rounds.map((_, i) => {
          const a = answers[i];
          return (
            <span
              key={i}
              className={`seg ${a ? (a.correct ? (a.hints ? 'is-hint' : 'is-ok') : 'is-bad') : ''} ${i === index ? 'is-current' : ''}`}
            />
          );
        })}
      </div>

      <main className="game-main">
        <QuestionCard
          key={round.q.id + index}
          round={round}
          number={index + 1}
          total={rounds.length}
          hints={hints}
          answer={answer}
          onChoose={choose}
          onHint={hint}
          onNext={nextQ}
          isLast={index + 1 >= rounds.length}
        />
      </main>
    </div>
  );
}
