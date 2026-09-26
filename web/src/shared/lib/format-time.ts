import moment from 'moment';

const ruDayMonthFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
});

const ruMessageTooltipFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
});

const isToday = (date: Date): boolean => {
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
  );
};

/** Полная дата и время для подсказки при наведении (как в Telegram) */
export const formatMessageTooltip = (iso: string): string => {
  const parsed = moment(iso);
  if (!parsed.isValid()) {
    return '';
  }

  return ruMessageTooltipFormatter
    .format(parsed.toDate())
    .replace(' в ', ' ');
};

export const formatMessageTime = (iso: string): string => {
  const parsed = moment(iso);
  if (!parsed.isValid()) {
    return '';
  }

  return parsed.format('HH:mm');
};

export const dayKey = (iso: string): string => {
  const parsed = moment(iso);
  if (!parsed.isValid()) {
    return iso;
  }

  return parsed.format('YYYY-MM-DD');
};

export const formatDayLabel = (iso: string): string => {
  const parsed = moment(iso);
  if (!parsed.isValid()) {
    return '';
  }

  const date = parsed.toDate();

  if (isToday(date)) {
    return 'Сегодня';
  }

  return ruDayMonthFormatter.format(date);
};
