import { useEffect } from 'react';
import { Header } from '../components/Header';
import { Countdown } from '../components/Countdown';
import { ModeIcon } from '../components/ModeIcon';
import { MODE_ORDER, MODES } from '../data/modes';
import { questionsOfType } from '../data/questions';
import { addDays, dayKey, formatDay, issueNumber, weekday, weekdayShort, plural } from '../lib/date';
import { liveStreak } from '../lib/progress';
import { useStore } from '../lib/storage';
import { DAILY_SLOTS, dailyQuestions } from '../lib/daily';
import type { QuestionType } from '../data/types';

// Примеры на главной — разные режимы и книги, которых нет среди ответов, чтобы не спойлерить игру.
const TEASERS: { type: QuestionType; style?: string; text: string; big?: boolean; ask: string; answer: string }[] = [
  {
    type: 'retell',
    style: 'в стиле вакансии',
    text: 'Требуется сторож в фамильный сад. Опыт работы с вишней не важен: сад всё равно продадут.',
    ask: 'Какая это книга?',
    answer: 'Вишнёвый сад',
  },
  {
    type: 'emoji',
    text: '🦁 🧙‍♀️ 🚪',
    big: true,
    ask: 'Что за книга?',
    answer: 'Лев, колдунья и платяной шкаф',
  },
  {
    type: 'character',
    text: 'Улика 1: однажды вытащил себя из болота за собственные волосы.',
    ask: 'Кто это?',
    answer: 'Барон Мюнхгаузен',
  },
];

export function Home({ focusModes = false }: { focusModes?: boolean }) {
  const store = useStore();
  const today = dayKey();
  const played = store.daily[today];
  const inProgress = store.current?.day === today ? store.current : undefined;
  const streak = liveStreak(store.streak, today);
  useEffect(() => {
    if (focusModes) document.getElementById('modes')?.scrollIntoView({ behavior: 'smooth' });
  }, [focusModes]);
  // Какие режимы попали в сегодняшний выпуск — показываем на главной без спойлеров.
  const todayTypes = [...new Set(dailyQuestions(today).map((q) => q.type))];
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  return (
    <div className="page">
      <Header />

      <main>
        <section className="hero">
          <div className="hero-copy rise">
            <p className="kicker">
              №{issueNumber(today)} · {weekday(today)}, {formatDay(today)}
            </p>
            <h1 className="display">
              Насколько хорошо
              <br />
              ты <em>знаешь</em> книги?
            </h1>
            <p className="lede">
              Каждый день — {DAILY_SLOTS.length} вопросов вперемешку: книга по дурацкому пересказу, герой по уликам, обложка
              из эмодзи, выдуманное название среди настоящих. Пять минут, один выпуск для всех.
            </p>
            <div className="today-modes">
              <span className="today-modes-label">В сегодняшнем выпуске</span>
              <ul>
                {todayTypes.map((t) => (
                  <li key={t}>
                    <ModeIcon type={t} size={15} />
                    {MODES[t].title}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hero-actions">
              {played ? (
                <>
                  <a className="btn btn-primary btn-xl" href="#/play">
                    Сегодня: {played.correct}/{played.total} · смотреть результат
                  </a>
                  <p className="hint-line">
                    Следующая игра через <Countdown />
                  </p>
                </>
              ) : inProgress ? (
                <a className="btn btn-primary btn-xl" href="#/play">
                  Продолжить · {inProgress.answers.length + 1} из {inProgress.ids.length}
                  <span aria-hidden="true">→</span>
                </a>
              ) : (
                <a className="btn btn-primary btn-xl" href="#/play" autoFocus>
                  Начать игру <span aria-hidden="true">→</span>
                </a>
              )}
            </div>

            <div className="streak-row">
              <div className="streak-big">
                <span className="flame" aria-hidden="true">
                  🔥
                </span>
                {streak.days > 0 ? (
                  <span>
                    Серия: <b>{streak.days}</b> {plural(streak.days, 'день', 'дня', 'дней')}
                    {!streak.playedToday && <span className="muted"> — сыграй сегодня, чтобы не прервать</span>}
                    {streak.atRisk && <span className="muted"> (спасёт заморозка ❄)</span>}
                  </span>
                ) : (
                  <span className="muted">Серия начнётся с сегодняшней игры</span>
                )}
              </div>
              <ol className="week" aria-label="Последние 7 дней">
                {week.map((d) => {
                  const r = store.daily[d];
                  return (
                    <li key={d} className={`week-day ${r ? 'is-played' : ''} ${d === today ? 'is-today' : ''}`}>
                      <a href={r ? `#/day/${d}` : d === today ? '#/play' : undefined} title={formatDay(d)}>
                        <span className="week-dot">{r ? r.correct : ''}</span>
                        <span className="week-label">{weekdayShort(d)}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <p className="hero-art-label">Так выглядят вопросы</p>
            {TEASERS.map((t, i) => (
              <div key={t.answer} className={`teaser teaser-${i}`}>
                <span className="teaser-kind">
                  <ModeIcon type={t.type} size={15} />
                  {MODES[t.type].title}
                  {t.style && <span className="tag">{t.style}</span>}
                </span>
                <p className={t.big ? 'teaser-big' : undefined}>{t.text}</p>
                <span className="teaser-answer">
                  {t.ask} <b>{t.answer}</b>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="modes">
          <div className="section-head">
            <h2 className="h2">Или по одному режиму</h2>
            <p className="muted">
              Любимый тип вопросов — сколько угодно раундов. В серию не идут, но копят статистику и достижения.
            </p>
          </div>
          <div className="modes">
            {MODE_ORDER.map((t, i) => {
              const m = MODES[t];
              const stat = store.totals.byType[t];
              return (
                <a key={t} className="mode-card rise" style={{ animationDelay: `${i * 40}ms` }} href={`#/mode/${t}`}>
                  <span className="mode-glyph">
                    <ModeIcon type={t} size={30} />
                  </span>
                  <span className="mode-title">{m.title}</span>
                  <span className="mode-blurb">{m.blurb}</span>
                  <span className="mode-meta">
                    {questionsOfType(t).length} вопросов
                    {stat && stat.seen > 0 && <> · {Math.round((stat.correct / stat.seen) * 100)}% верно</>}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          Без регистрации: прогресс хранится только в этом браузере. <a href="#/about">Как играть и считать очки</a>
        </p>
      </footer>
    </div>
  );
}
