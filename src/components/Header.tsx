import { useStore, updateStore } from '../lib/storage';
import { liveStreak } from '../lib/progress';

export function Logo() {
  return (
    <a className="logo" href="#/" aria-label="Закладка — на главную">
      <svg className="logo-mark" viewBox="0 0 20 28" aria-hidden="true">
        <path d="M2 1h16v25l-8-6.5L2 26z" />
      </svg>
      <span>Закладка</span>
    </a>
  );
}

export function ThemeToggle() {
  const { theme } = useStore();
  const toggle = () => {
    const current = theme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    updateStore((s) => ({ ...s, theme: current === 'dark' ? 'light' : 'dark' }));
  };
  return (
    <button className="icon-btn" onClick={toggle} aria-label="Сменить тему" title="Сменить тему">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" />
      </svg>
    </button>
  );
}

export function StreakChip() {
  const { streak } = useStore();
  const live = liveStreak(streak);
  return (
    <a
      className={`chip streak-chip ${live.days > 0 ? 'is-on' : ''} ${live.playedToday ? 'is-today' : ''}`}
      href="#/stats"
      title={live.days ? `Серия: ${live.days}` : 'Серия начнётся с первой игры дня'}
    >
      <span aria-hidden="true">🔥</span>
      <b>{live.days}</b>
    </a>
  );
}

export function Header() {
  return (
    <header className="header">
      <Logo />
      <nav className="header-nav">
        <StreakChip />
        <a className="nav-link" href="#/stats">
          Зал славы
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
