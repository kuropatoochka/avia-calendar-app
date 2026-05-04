import type { FlightDto } from '../types/api';

export const MONTHS_GEN = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

export const MONTHS_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

export const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

/** Short date label, e.g. "5 янв" — used in charts and compact displays */
export const formatDateShort = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

export const formatFlightDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}, ${WEEKDAYS_SHORT[d.getDay()]}`;
};

export const formatPassengers = (count: number): string => {
  if (count === 1) return '1 пассажир';
  if (count >= 2 && count <= 4) return `${count} пассажира`;
  return `${count} пассажиров`;
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}ч ${m}м` : `${h}ч`;
};

export const formatStops = (count: number): string => {
  if (count === 0) return 'Прямой';
  if (count === 1) return '1 пересадка';
  if (count >= 2 && count <= 4) return `${count} пересадки`;
  return `${count} пересадок`;
};

export const formatStopsFull = (count: number): string => {
  if (count === 0) return 'Прямой рейс';
  return formatStops(count);
};

export const formatSeats = (n: number): string => {
  if (n === 1) return '1 место';
  if (n >= 2 && n <= 4) return `${n} места`;
  return `${n} мест`;
};

export const getAirlines = (flight: FlightDto): string[] => {
  const result: string[] = [flight.airline];
  flight.stops?.forEach((s) => {
    if (s.legAirline && s.legAirline !== result[result.length - 1]) {
      result.push(s.legAirline);
    }
  });
  return result;
};
