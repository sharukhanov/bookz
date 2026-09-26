import { useEffect } from 'react';
import { useRoute } from './lib/router';
import { useStore } from './lib/storage';
import { MODES } from './data/modes';
import type { QuestionType } from './data/types';
import { Home } from './screens/Home';
import { Game } from './screens/Game';
import { Stats } from './screens/Stats';
import { About } from './screens/About';
import { DayReview } from './screens/DayReview';
import { dayKey } from './lib/date';

export function App() {
  const route = useRoute();
  const { theme } = useStore();

  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [theme]);

  const [page, arg] = route;
  let screen;
  if (page === 'play') screen = <Game key={`daily-${dayKey()}`} kind="daily" />;
  else if (page === 'mode' && arg && arg in MODES) screen = <Game key={`mode-${arg}`} kind="practice" type={arg as QuestionType} />;
  else if (page === 'stats') screen = <Stats />;
  else if (page === 'about') screen = <About />;
  else if (page === 'day' && arg) screen = <DayReview day={arg} />;
  else screen = <Home focusModes={page === 'modes'} />;

  return <div className="app">{screen}</div>;
}
