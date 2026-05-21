import type { Dayjs } from 'dayjs';

export type TripType = 'oneWay' | 'roundTrip';
export type ServiceClass = 'economy' | 'comfort' | 'business' | 'first';

export type DateRangeValue = [Dayjs, Dayjs | null];

export interface AirportOption {
  value: string;
  label: string;
  option: {
    city: string;
    airport: string;
    code: string;
  };
}

export interface PassengersState {
  adults: number;
  children: number;
  toddler: number;
  animals: number;
}

export interface SearchFormValues {
  originAirport: string;
  destinationAirport: string;
  tripType: TripType;
  dateRange: DateRangeValue;
  passengers: PassengersState;
  serviceClass: ServiceClass;
}
