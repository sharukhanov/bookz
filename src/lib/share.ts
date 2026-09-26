import type { AnswerRecord } from './storage';
import { issueNumber } from './date';

export const SITE_NAME = 'Закладка';

export function siteUrl(): string {
  return window.location.origin + window.location.pathname;
}

export function resultGrid(answers: AnswerRecord[]): string {
  return answers.map((a) => (!a.correct ? '🟥' : a.hints > 0 ? '🟨' : '🟩')).join('');
}

export function formatScore(n: number): string {
  return n.toLocaleString('ru-RU');
}

export function dailyShareText(opts: { day: string; correct: number; total: number; score: number; streak: number; answers: AnswerRecord[] }): string {
  const lines = [
    `📚 ${SITE_NAME} №${issueNumber(opts.day)} — ${opts.correct}/${opts.total}`,
    resultGrid(opts.answers),
    `✦ ${formatScore(opts.score)} очков${opts.streak > 1 ? ` · 🔥 ${opts.streak}` : ''}`,
    'Сможешь лучше?',
    siteUrl(),
  ];
  return lines.join('\n');
}

export type ShareOutcome = 'shared' | 'copied' | 'failed';

/** Web Share API на телефонах, копирование в буфер — везде остальном. */
export async function shareText(text: string): Promise<ShareOutcome> {
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  if (navigator.share && coarse) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'failed';
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    // старый способ — на случай http или старого браузера
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok ? 'copied' : 'failed';
  }
}
