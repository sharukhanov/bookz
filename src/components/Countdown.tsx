import { useEffect, useState } from 'react';
import { msUntilTomorrow } from '../lib/date';

function fmt(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

/** Обратный отсчёт до следующей игры дня (локальная полночь). */
export function Countdown() {
  const [ms, setMs] = useState(msUntilTomorrow);
  useEffect(() => {
    const id = setInterval(() => {
      const left = msUntilTomorrow();
      setMs(left);
      // Наступил новый день — перерисовываем главную с новой игрой.
      if (left > 86400000 - 1500) window.dispatchEvent(new HashChangeEvent('hashchange'));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular">{fmt(ms)}</span>;
}
