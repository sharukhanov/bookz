import { Header } from '../components/Header';
import { MODE_ORDER, MODES } from '../data/modes';
import { ACHIEVEMENTS } from '../lib/achievements';
import { formatDay, plural, relativeDay } from '../lib/date';
import { liveStreak } from '../lib/progress';
import { formatScore } from '../lib/share';
import { resetStore, useStore } from '../lib/storage';

export function Stats() {
  const store = useStore();
  const records = Object.values(store.daily).sort((a, b) => (a.day < b.day ? 1 : -1));
  const top = [...records].sort((a, b) => b.score - a.score || (a.day < b.day ? 1 : -1)).slice(0, 10);
  const streak = liveStreak(store.streak);
  const t = store.totals;
  const bestScore = top[0]?.score ?? 0;
  const unlockedCount = ACHIEVEMENTS.filter((a) => store.achievements[a.id]).length;

  const reset = () => {
    if (confirm('Стереть весь прогресс, серию и достижения? Это нельзя отменить.')) resetStore();
  };

  return (
    <div className="page">
      <Header />
      <main>
        <section className="stats-hero rise">
          <p className="kicker">Личный зал славы</p>
          <h1 className="display display-sm">Твоя полка</h1>
          <p className="lede muted">
            Здесь нет глобального рейтинга — только ты против себя вчерашнего. Всё хранится в этом браузере.
          </p>
        </section>

        <section className="stat-grid">
          <div className="stat">
            <span className="stat-num">🔥 {streak.days}</span>
            <span className="stat-label">
              {plural(streak.days, 'день', 'дня', 'дней')} подряд · рекорд {store.streak.best}
            </span>
          </div>
          <div className="stat">
            <span className="stat-num tabular">{formatScore(bestScore)}</span>
            <span className="stat-label">лучший результат</span>
          </div>
          <div className="stat">
            <span className="stat-num">{t.games}</span>
            <span className="stat-label">{plural(t.games, 'игра дня', 'игры дня', 'игр дня')} · разминок {t.practice}</span>
          </div>
          <div className="stat">
            <span className="stat-num">{t.answered ? Math.round((t.correct / t.answered) * 100) : 0}%</span>
            <span className="stat-label">
              точность · {t.correct} из {t.answered}
            </span>
          </div>
        </section>

        <p className="freeze-line">
          <span className={`freeze ${store.streak.freezes ? 'is-on' : ''}`}>❄</span>
          {store.streak.freezes
            ? 'Заморозка серии готова: если пропустишь один день, серия не сгорит.'
            : 'Заморозка серии выдаётся за каждые 7 дней подряд. Она спасает серию, если пропустить один день.'}
        </p>

        <div className="two-col">
          <section className="section">
            <h2 className="h3">Рекорды</h2>
            {top.length ? (
              <ol className="leader">
                {top.map((r, i) => (
                  <li key={r.day}>
                    <a href={`#/day/${r.day}`}>
                      <span className="leader-pos">{i + 1}</span>
                      <span className="leader-day">{relativeDay(r.day)}</span>
                      <span className="leader-res">
                        {r.correct}/{r.total}
                      </span>
                      <span className="leader-score tabular">{formatScore(r.score)}</span>
                    </a>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">
                Пока пусто. <a href="#/play">Сыграй игру дня</a> — и здесь появится первая строчка.
              </p>
            )}
          </section>

          <section className="section">
            <h2 className="h3">Точность по режимам</h2>
            <ul className="bars">
              {MODE_ORDER.map((type) => {
                const v = t.byType[type];
                const rate = v && v.seen ? v.correct / v.seen : 0;
                return (
                  <li key={type}>
                    <span className="bar-label">{MODES[type].short}</span>
                    <span className="bar">
                      <span className="bar-fill" style={{ width: `${Math.round(rate * 100)}%` }} />
                    </span>
                    <span className="bar-num tabular">{v?.seen ? `${Math.round(rate * 100)}%` : '—'}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <section className="section">
          <h2 className="h3">
            Достижения <span className="muted">{unlockedCount} из {ACHIEVEMENTS.length}</span>
          </h2>
          <div className="ach-list">
            {ACHIEVEMENTS.map((a) => {
              const got = store.achievements[a.id];
              return (
                <div key={a.id} className={`ach ${got ? '' : 'is-locked'}`}>
                  <span className="ach-icon">{got ? a.icon : '·'}</span>
                  <span>
                    <b>{a.title}</b>
                    <span className="muted small">
                      {a.desc}
                      {got && ` · ${formatDay(got)}`}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {records.length > 0 && (
          <section className="section">
            <h2 className="h3">История</h2>
            <ol className="history">
              {records.slice(0, 60).map((r) => (
                <li key={r.day}>
                  <a href={`#/day/${r.day}`}>
                    <span>{relativeDay(r.day)}</span>
                    <span className="history-grid">
                      {r.answers.map((a, i) => (
                        <i key={i} className={!a.correct ? 'bad' : a.hints ? 'hint' : 'ok'} />
                      ))}
                    </span>
                    <span className="tabular">
                      {r.correct}/{r.total}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="section danger-zone">
          <button className="btn btn-ghost small" onClick={reset}>
            Сбросить прогресс
          </button>
        </section>
      </main>
    </div>
  );
}
