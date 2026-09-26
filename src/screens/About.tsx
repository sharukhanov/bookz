import { Header } from '../components/Header';
import { MODE_ORDER, MODES } from '../data/modes';
import { BASE_POINTS, PERFECT_BONUS } from '../lib/scoring';

export function About() {
  return (
    <div className="page">
      <Header />
      <main className="about rise">
        <p className="kicker">Правила</p>
        <h1 className="display display-sm">Как играть</h1>

        <section className="about-block">
          <h2 className="h3">Игра дня</h2>
          <p>
            Каждый день — новый выпуск из 10 вопросов, одинаковый для всех. Сначала полегче, к концу — посложнее. Режимы
            перемешаны: пересказ, персонаж, выдуманная книга, эмодзи-обложка и другие. Выпуск меняется в полночь по твоему
            времени. Сыграть его можно один раз — зато потом можно размяться в отдельных режимах.
          </p>
        </section>

        <section className="about-block">
          <h2 className="h3">Очки</h2>
          <ul className="rules">
            <li>
              <b>
                {BASE_POINTS[1]} / {BASE_POINTS[2]} / {BASE_POINTS[3]}
              </b>{' '}
              — за лёгкий, средний и сложный вопрос.
            </li>
            <li>
              <b>Серия ответов</b> умножает очки: ×1,25 за второй верный подряд, потом ×1,5, ×1,75 и максимум ×2. Ошибка
              сбрасывает множитель.
            </li>
            <li>
              <b>⚡ Быстрый ответ</b> — +25%. Время на чтение учитывается: у длинного пересказа порог больше.
            </li>
            <li>
              <b>Подсказки</b> в режимах «Кто это?», «Автор» и «Эмодзи» стоят 30% очков каждая.
            </li>
            <li>
              <b>+{PERFECT_BONUS}</b> за идеальную игру 10 из 10.
            </li>
          </ul>
        </section>

        <section className="about-block">
          <h2 className="h3">Серия</h2>
          <p>
            🔥 Серия растёт, если играть в игру дня каждый день. За каждые 7 дней подряд выдаётся ❄ заморозка (максимум одна): она
            спасает серию, если пропустить один день. Регистрации нет — всё хранится в браузере, поэтому на другом устройстве
            серия своя.
          </p>
        </section>

        <section className="about-block">
          <h2 className="h3">Режимы</h2>
          <ul className="rules">
            {MODE_ORDER.map((t) => (
              <li key={t}>
                <b>{MODES[t].title}</b> — {MODES[t].blurb.toLowerCase()}.
              </li>
            ))}
          </ul>
        </section>

        <section className="about-block">
          <h2 className="h3">Клавиатура</h2>
          <p>
            <kbd>1</kbd>–<kbd>4</kbd> — ответ, <kbd>H</kbd> — подсказка, <kbd>Enter</kbd> — дальше, <kbd>Esc</kbd> — на главную.
          </p>
        </section>

        <section className="about-block">
          <h2 className="h3">О фактах</h2>
          <p className="muted">
            Пересказы и подсказки написаны нами. Цитаты — только короткие и хрестоматийные. Суммы в режиме «Гонорар» — это
            документированные аукционные продажи и известные истории; если нашли ошибку — напишите, поправим.
          </p>
        </section>

        <a className="btn btn-primary btn-xl" href="#/play">
          Играть <span aria-hidden="true">→</span>
        </a>
      </main>
    </div>
  );
}
