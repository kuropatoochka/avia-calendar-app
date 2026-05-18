import type { DepartureTime } from './types';

export const DEPARTURE_TIME_LABELS: Record<DepartureTime, string> = {
  morning: 'Утро',
  afternoon: 'День',
  evening: 'Вечер',
  night: 'Ночь',
};

export const DEPARTURE_TIMES = Object.keys(DEPARTURE_TIME_LABELS) as DepartureTime[];
