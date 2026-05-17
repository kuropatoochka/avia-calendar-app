type PaginatedResponse<T> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
};

type CityDto = {
  id: number;
  name: string;
};

export type AirportDto = {
  id: number;
  name: string;
  city: CityDto;
};

export type AirportsDto = PaginatedResponse<AirportDto>;

export type Passengers = {
  adults: number;
  children: number;
  toddler: number;
  animals: number;
};

export type ServiceClass = 'BUDGET' | 'COMFORT' | 'BUSINESS' | 'FIRST_CLASS';

export type PriceDynamicsRequest = {
  originAirportId: number;
  destinationAirportId: number;
  dateFrom: string;
  dateTo: string;
  passengers: Passengers;
  serviceClass: ServiceClass;
};

export type PriceDynamicsDto = {
  date: string;
  minPrice: number | null;
};

export type FlightFilters = {
  maxStops?: number;
  stopDurationRange?: [number, number];
  maxFlightDuration?: number;
  departureTimes?: string[];
  arrivalTimes?: string[];
  pricePerPassenger?: boolean;
  priceRange?: [number, number];
  baggageEnabled?: boolean;
  baggageForAll?: boolean;
  baggageWeights?: number[];
  airlines?: string[];
  petsEnabled?: boolean;
  animalCount?: number;
  animalWeights?: number[];
};

export type FlightsRequest = {
  originAirportId: number;
  destinationAirportId: number;
  date: string;
  passengers: Passengers;
  serviceClass: ServiceClass;
  filters?: FlightFilters;
};

// export type FlightsDto = {};
