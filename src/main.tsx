import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/playfair-display/wght.css';
import '@fontsource-variable/playfair-display/wght-italic.css';
import '@fontsource-variable/onest/wght.css';
import './styles.css';
import { App } from './App';

if (import.meta.env.DEV) {
  // В режиме разработки сразу видно ошибки в датасете.
  Promise.all([import('./data/validate'), import('./data/questions')]).then(([v, d]) => {
    const errors = v.validateQuestions(d.QUESTIONS);
    if (errors.length) console.warn('Ошибки в данных:\n' + errors.join('\n'));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
