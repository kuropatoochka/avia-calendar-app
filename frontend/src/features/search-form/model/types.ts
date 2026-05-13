import type { Dayjs } from 'dayjs';

export type TripType = 'oneWay' | 'roundTrip';
export type ServiceClass = 'economy' | 'comfort' | 'business' | 'first';

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
  dateRange: [Dayjs, Dayjs] | null;
  passengers: PassengersState;
  serviceClass: ServiceClass;
}
