import type { DepartureTime } from '../types/flightFilters';

export const DEPARTURE_TIME_LABELS: Record<DepartureTime, string> = {
  morning: 'Утро',
  afternoon: 'День',
  evening: 'Вечер',
  night: 'Ночь',
};

export const DEPARTURE_TIMES = Object.keys(DEPARTURE_TIME_LABELS) as DepartureTime[];

export const AIRLINE_OPTIONS = [
  { value: 'aeroflot', label: 'Аэрофлот' },
  { value: 's7', label: 'S7 Airlines' },
  { value: 'pobeda', label: 'Победа' },
  { value: 'ural', label: 'Уральские авиалинии' },
  { value: 'rossiya', label: 'Россия' },
];
