import { useState } from 'react';
import type { QuestionType } from '../data/types';
import { MODES } from '../data/modes';
import type { Round } from './QuestionCard';
import { Header } from './Header';
import { Countdown } from './Countdown';
import { ACHIEVEMENT_BY_ID } from '../lib/achievements';
import { dayKey, formatDay, issueNumber, plural } from '../lib/date';
import { liveStreak } from '../lib/progress';
import { PERFECT_BONUS, rankFor } from '../lib/scoring';
import { dailyShareText, formatScore, resultGrid, shareText, SITE_NAME, siteUrl } from '../lib/share';
import { useStore, type AnswerRecord } from '../lib/storage';

interface Props {
  kind: 'daily' | 'practice';
  day: string;
  mode?: QuestionType;
  answers: AnswerRecord[];
  rounds: Round[];
  score: number;
  unlocked: string[];
  onRestart?: () => void;
}

export function ResultView({ kind, day, mode, answers, rounds, score, unlocked, onRestart }: Props) {
  const store = useStore();
  const [toast, setToast] = useState('');
  const [open, setOpen] = useState<number | null>(null);

  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  const rank = rankFor(correct, total);
  const perfect = total > 0 && correct === total;
  const avgTime = total ? answers.reduce((s, a) => s + a.timeMs, 0) / total / 1000 : 0;
  const isToday = day === dayKey();
  const streak = liveStreak(store.streak);

  // Сильная и слабая категории в этой игре.
  const perType = new Map<QuestionType, { ok: number; n: number }>();
  for (const a of answers) {
    const v = perType.get(a.type) ?? { ok: 0, n: 0 };
    perType.set(a.type, { ok: v.ok + (a.correct ? 1 : 0), n: v.n + 1 });
  }
  const types = [...perType.entries()];
  const weakest = types.filter(([, v]) => v.ok < v.n).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)[0];
  const strongest = types.filter(([, v]) => v.ok === v.n).sort((a, b) => b[1].n - a[1].n)[0];

  // «Лучше, чем X% твоих прошлых игр» — честный личный рейтинг вместо фейкового глобального.
  const past = Object.values(store.daily).filter((r) => r.day !== day);
  const beat = past.length >= 3 ? Math.round((past.filter((r) => r.score < score).length / past.length) * 100) : null;
  const best = past.length ? Math.max(...past.map((r) => r.score)) : 0;

  const share = async () => {
    const text =
      kind === 'daily'
        ? dailyShareText({ day, correct, total, score, streak: streak.days, answers })
        : `📚 ${SITE_NAME} · ${MODES[mode!].title} — ${correct}/${total}\n${resultGrid(answers)}\n${siteUrl()}`;
    const r = await shareText(text);
    setToast(r === 'copied' ? 'Результат скопирован — вставь в чат' : r === 'shared' ? 'Отправлено' : 'Не получилось скопировать');
    setTimeout(() => setToast(''), 2600);
  };

  return (
    <div className="page">
      <Header />
      <main className="result">
        <section className="result-hero rise">
          <p className="kicker">
            {kind === 'daily' ? (
              <>
                {SITE_NAME} №{issueNumber(day)} · {formatDay(day)}
              </>
            ) : (
              <>Разминка · {MODES[mode!].title}</>
            )}
          </p>
          <div className="big-score">
            <span className="big-num">{correct}</span>
            <span className="big-slash">/</span>
            <span className="big-total">{total}</span>
          </div>
          <p className="rank-label">Литературный уровень</p>
          <h1 className="rank-title">{rank.title}</h1>
          <p className="lede">{rank.line}</p>

          <div className="grid-row" aria-label="Ответы по порядку">
            {answers.map((a, i) => (
              <span key={i} className={`sq ${!a.correct ? 'bad' : a.hints ? 'hint' : 'ok'}`} style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>

          <div className="result-actions">
            <button className="btn btn-primary btn-xl" onClick={share}>
              Поделиться результатом
            </button>
            {onRestart && (
              <button className="btn btn-secondary btn-xl" onClick={onRestart}>
                Ещё раунд
              </button>
            )}
          </div>
          <div className={`toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
            {toast}
          </div>
        </section>

        <section className="stat-grid">
          <div className="stat">
            <span className="stat-num tabular">{formatScore(score)}</span>
            <span className="stat-label">очков{perfect && ` · вкл. +${PERFECT_BONUS} за идеальную игру`}</span>
          </div>
          <div className="stat">
            <span className="stat-num">{total ? Math.round((correct / total) * 100) : 0}%</span>
            <span className="stat-label">правильных ответов</span>
          </div>
          <div className="stat">
            <span className="stat-num">{avgTime.toFixed(1).replace('.', ',')} с</span>
            <span className="stat-label">среднее время</span>
          </div>
          {kind === 'daily' && (
            <div className="stat">
              <span className="stat-num">🔥 {streak.days}</span>
              <span className="stat-label">{plural(streak.days, 'день', 'дня', 'дней')} подряд</span>
            </div>
          )}
          {weakest && (
            <div className="stat">
              <span className="stat-num stat-word">{MODES[weakest[0]].short}</span>
              <span className="stat-label">самая сложная категория</span>
            </div>
          )}
          {strongest && (
            <div className="stat">
              <span className="stat-num stat-word">{MODES[strongest[0]].short}</span>
              <span className="stat-label">без единой ошибки</span>
            </div>
          )}
        </section>

        {kind === 'daily' && (
          <p className="personal-line">
            {beat !== null ? (
              <>
                Это лучше, чем <b>{beat}%</b> твоих прошлых игр.{' '}
              </>
            ) : null}
            {past.length > 0 && score > best && <b>Новый личный рекорд! </b>}
            {isToday && (
              <>
                Следующая игра через <Countdown />.
              </>
            )}
          </p>
        )}

        {unlocked.length > 0 && (
          <section className="section">
            <h2 className="h3">Новые достижения</h2>
            <div className="ach-list">
              {unlocked.map((id) => {
                const a = ACHIEVEMENT_BY_ID[id];
                return (
                  <div key={id} className="ach is-new pop">
                    <span className="ach-icon">{a.icon}</span>
                    <span>
                      <b>{a.title}</b>
                      <span className="muted small">{a.desc}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="section">
          <h2 className="h3">Разбор</h2>
          <ol className="review">
            {answers.map((a, i) => {
              const q = rounds[i]?.q;
              if (!q) return null;
              const isOpen = open === i;
              return (
                <li key={a.id} className={`review-item ${a.correct ? 'ok' : 'bad'}`}>
                  <button className="review-head" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                    <span className={`sq small ${!a.correct ? 'bad' : a.hints ? 'hint' : 'ok'}`} />
                    <span className="review-mode">{MODES[q.type].short}</span>
                    <span className="review-answer">
                      {q.fixedOrder ? (
                        <>
                          {q.prompt} <span className="muted">— {q.answer}</span>
                        </>
                      ) : (
                        q.answer
                      )}
                    </span>
                    <span className="review-pts tabular">{a.correct ? `+${a.points}` : '0'}</span>
                  </button>
                  {isOpen && (
                    <div className="review-body fade-in">
                      <p className="review-prompt">{q.emoji ? `${q.emoji} — ${q.prompt}` : q.prompt}</p>
                      {!a.correct && a.choice && <p className="muted small">Твой ответ: {a.choice}</p>}
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section className="section result-next">
          <a className="btn btn-secondary" href="#/">
            На главную
          </a>
          <a className="btn btn-ghost" href="#/stats">
            Зал славы →
          </a>
          {kind === 'daily' && (
            <a className="btn btn-ghost" href="#/modes">
              Разминка по режимам →
            </a>
          )}
        </section>
      </main>
    </div>
  );
}
