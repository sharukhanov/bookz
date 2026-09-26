import type { QuestionType } from './types';

export interface ModeInfo {
  type: QuestionType;
  title: string;
  /** Короткое название для статистики */
  short: string;
  /** Подзаголовок на карточке режима */
  blurb: string;
  /** Вопрос по умолчанию */
  ask: string;
  glyph: string;
}

export const MODES: Record<QuestionType, ModeInfo> = {
  retell: {
    type: 'retell',
    title: 'Плохой пересказ',
    short: 'Пересказы',
    blurb: 'Классика глазами HR, Netflix и отзывов на маркетплейсе',
    ask: 'Какая это книга?',
    glyph: '¶',
  },
  line: {
    type: 'line',
    title: 'Одна фраза',
    short: 'Фразы',
    blurb: 'Первая строка или цитата, которую все слышали',
    ask: 'Откуда эта фраза?',
    glyph: '“',
  },
  character: {
    type: 'character',
    title: 'Кто это?',
    short: 'Персонажи',
    blurb: 'Угадай героя по уликам. Чем раньше — тем больше очков',
    ask: 'Кто этот персонаж?',
    glyph: '?',
  },
  author: {
    type: 'author',
    title: 'Автор под прикрытием',
    short: 'Авторы',
    blurb: 'Биография по кусочкам: кто это написал?',
    ask: 'О каком авторе речь?',
    glyph: '✒',
  },
  emoji: {
    type: 'emoji',
    title: 'Обложка из эмодзи',
    short: 'Эмодзи',
    blurb: 'Три значка — один роман',
    ask: 'Что за книга на обложке?',
    glyph: '✦',
  },
  fake: {
    type: 'fake',
    title: 'Найди выдумку',
    short: 'Выдумки',
    blurb: 'Три книги настоящие. Одну мы сочинили',
    ask: 'Какой книги не существует?',
    glyph: '✕',
  },
  screen: {
    type: 'screen',
    title: 'Книга или кино',
    short: 'Книга/кино',
    blurb: 'Что было первым — и что придумали уже для экрана',
    ask: 'Как было на самом деле?',
    glyph: '▶',
  },
  fame: {
    type: 'fame',
    title: 'Хит или признание',
    short: 'Судьбы книг',
    blurb: 'Бестселлер с первого дня или гений, которого не заметили',
    ask: 'Как встретили эту книгу?',
    glyph: '↗',
  },
  money: {
    type: 'money',
    title: 'Гонорар',
    short: 'Деньги',
    blurb: 'Долги, аукционы и самые дорогие книги в истории',
    ask: 'Как думаешь?',
    glyph: '₽',
  },
};

/** Порядок режимов на главном экране */
export const MODE_ORDER: QuestionType[] = [
  'retell',
  'fake',
  'character',
  'emoji',
  'line',
  'screen',
  'author',
  'fame',
  'money',
];
