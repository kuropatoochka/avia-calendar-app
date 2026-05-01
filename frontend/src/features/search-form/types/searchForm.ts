export type TripType = 'oneWay' | 'roundTrip';
export type ServiceClass = 'economy' | 'comfort' | 'business' | 'first';

export interface AirportOption {
  value: string;
  label: string;
  airportId: string;
}

export interface PassengersState {
  adults: number;
  children: number;
  toddler: number;
  animals: number;
}
