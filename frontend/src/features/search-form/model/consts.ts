import type { PassengersState, SearchFormValues, ServiceClass, TripType } from './types';
import dayjs from 'dayjs';
import type { AirportDto } from '@/shared/types';

export const DEFAULT_ORIGIN_AIRPORT: AirportDto = {
  id: 'led',
  city: 'Санкт-Петербург',
  airport: 'Пулково',
};

export const DEFAULT_DESTINATION_AIRPORT: AirportDto = {
  id: 'svo',
  city: 'Москва',
  airport: 'Шереметьево',
};

export const DEFAULT_PASSENGERS: PassengersState = {
  adults: 1,
  children: 0,
  toddler: 0,
  animals: 0,
};

export const DEFAULT_TRIP_TYPE: TripType = 'oneWay';

export const DEFAULT_SERVICE_CLASS: ServiceClass = 'economy';

export const getDefaultSearchFormValues = (): SearchFormValues => ({
  originAirport: DEFAULT_ORIGIN_AIRPORT.id,
  destinationAirport: DEFAULT_DESTINATION_AIRPORT.id,
  tripType: DEFAULT_TRIP_TYPE,
  dateRange: [dayjs(), null],
  passengers: DEFAULT_PASSENGERS,
  serviceClass: DEFAULT_SERVICE_CLASS,
});
