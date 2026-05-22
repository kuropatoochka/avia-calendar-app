import type { Dayjs } from 'dayjs';
import type { ServiceClass } from '@/shared/types';

export type TripType = 'oneWay' | 'roundTrip';

export type DateRangeValue = [Dayjs, Dayjs | null];

export interface SelectOption {
  value: number;
  label: string;
  option: {
    id: number;
    airport: string;
    cityId: number;
    city: string;
  };
}

export interface PassengersState {
  adults: number;
  children: number;
  toddler: number;
  animals: number;
}

export interface SearchFormValues {
  originAirportId: number;
  destinationAirportId: number;
  tripType: TripType;
  dateRange: DateRangeValue;
  passengers: PassengersState;
  serviceClass: ServiceClass;
}

export type SearchFormErrorField = 'originAirportId' | 'destinationAirportId' | 'dateRange';

export type SearchFormError = {
  message: string;
  fields: SearchFormErrorField[];
};
