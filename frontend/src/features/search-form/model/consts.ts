import type { PassengersState, SearchFormValues, ServiceClass, TripType } from './types';
import dayjs from 'dayjs';
import type { AirportDto } from '@/shared/types';

export const DEFAULT_ORIGIN_AIRPORT: AirportDto = {
  id: 104,
  name: 'Пулково',
  city: {
    id: 2,
    name: 'Санкт-Петербург',
  },
};

export const DEFAULT_DESTINATION_AIRPORT: AirportDto = {
  id: 101,
  name: 'Шереметьево',
  city: {
    id: 1,
    name: 'Москва',
  },
};

export const DEFAULT_AIRPORT_OPTIONS = [DEFAULT_ORIGIN_AIRPORT, DEFAULT_DESTINATION_AIRPORT];

export const DEFAULT_PASSENGERS: PassengersState = {
  adults: 1,
  children: 0,
  toddler: 0,
  animals: 0,
};

export const DEFAULT_TRIP_TYPE: TripType = 'oneWay';

export const DEFAULT_SERVICE_CLASS: ServiceClass = 'BUDGET';

export const getDefaultSearchFormValues = (): SearchFormValues => ({
  originAirportId: DEFAULT_ORIGIN_AIRPORT.id,
  destinationAirportId: DEFAULT_DESTINATION_AIRPORT.id,
  tripType: DEFAULT_TRIP_TYPE,
  dateRange: [dayjs(), null],
  passengers: DEFAULT_PASSENGERS,
  serviceClass: DEFAULT_SERVICE_CLASS,
});

export const SERVICE_CLASS_OPTIONS: { value: ServiceClass; label: string }[] = [
  { value: 'BUDGET', label: 'Эконом' },
  { value: 'COMFORT', label: 'Комфорт' },
  { value: 'BUSINESS', label: 'Бизнес' },
  { value: 'FIRST_CLASS', label: 'Первый класс' },
];

export const TRIP_TYPE_LABELS: Record<TripType, string> = {
  oneWay: 'В одну сторону',
  roundTrip: 'Туда-обратно',
};
