import dayjs from 'dayjs';

export const formatDate = (date: string) => {
  return dayjs(date).format('DD.MM.YYYY');
};

export const timeFormatter = (time: string) => {
  return time.slice(0, 5);
};

export const priceFormatter = new Intl.NumberFormat('ru-RU', {
  currency: 'RUB',
  style: 'currency',
  maximumFractionDigits: 0,
});

export const durationFormatter = (durationMinutes: number) => {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} мин`;
  }

  if (minutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${minutes} мин`;
};

export const stopsFormatter = (stopsCount: number) => {
  if (stopsCount === 0) {
    return 'Прямой рейс';
  }

  if (stopsCount === 1) {
    return '1 пересадка';
  }

  return `${stopsCount} пересадки`;
};
