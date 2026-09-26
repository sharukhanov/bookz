import { ResultView } from '../components/ResultView';
import { Header } from '../components/Header';
import { QUESTION_BY_ID } from '../data/questions';
import { useStore } from '../lib/storage';

/** Итоги прошлой игры дня из истории. */
export function DayReview({ day }: { day: string }) {
  const store = useStore();
  const rec = store.daily[day];
  if (!rec) {
    return (
      <div className="page">
        <Header />
        <main className="empty">
          <h1 className="h2">Этот день не сыгран</h1>
          <p className="muted">Прошлые игры дня нельзя переиграть — но можно размяться по режимам.</p>
          <a className="btn btn-primary" href="#/">
            На главную
          </a>
        </main>
      </div>
    );
  }
  const rounds = rec.answers.map((a) => ({ q: QUESTION_BY_ID[a.id], options: [] }));
  return <ResultView kind="daily" day={day} answers={rec.answers} rounds={rounds} score={rec.score} unlocked={[]} />;
}
