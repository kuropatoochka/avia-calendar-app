import type { ServiceClass, TripType } from '../types/searchForm';

export const SERVICE_CLASS_LABELS: Record<ServiceClass, string> = {
  economy: 'Эконом',
  comfort: 'Комфорт',
  business: 'Бизнес',
  first: 'Первый',
};

export const TRIP_TYPE_LABELS: Record<TripType, string> = {
  oneWay: 'В одну сторону',
  roundTrip: 'Туда-обратно',
};
