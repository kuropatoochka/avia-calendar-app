export type AirportDto = {
  id: string;
  airport: string;
  city: string;
};

export type Passengers = {
  adults: number;
  children: number;
  toddler: number;
  animals: number;
};

export type ServiceClass = 'economy' | 'comfort' | 'business' | 'first';

export type PriceDynamicsRequest = {
  originAirportId: string;
  destinationAirportId: string;
  dateFrom: string;
  dateTo: string;
  passengers: Passengers;
  serviceClass: ServiceClass;
};

export type PriceDynamicsDto = {
  date: string;
  minPrice: number | null;
};

export type ExtraBaggageEntry = {
  passengerIndex: number;
  weight: number;
};

export type FlightFilters = {
  maxStops?: number;
  stopDurationRange?: [number, number];
  maxFlightDuration?: number;
  departureTimes?: string[];
  arrivalTimes?: string[];
  maxPrice?: number;
  baggageEnabled?: boolean;
  baggageWeights?: number[];
  extraBaggageEntries?: ExtraBaggageEntry[];
  airlines?: string[];
  petsEnabled?: boolean;
  animalCount?: number;
  animalWeights?: number[];
};

export type FlightsRequest = {
  originAirportId: string;
  destinationAirportId: string;
  date: string;
  passengers: Passengers;
  serviceClass: ServiceClass;
  filters?: FlightFilters;
};

// export type FlightsDto = {};
