type PaginatedResponse<T> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
};

type AiroprtCityDto = {
  id: string;
  name: string;
};

export type AirportDto = AiroprtCityDto & {
  city: AiroprtCityDto;
};

export type AiroportsDto = PaginatedResponse<AirportDto>;

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
  originAirportId: string;
  destinationAirportId: string;
  date: string;
  passengers: Passengers;
  serviceClass: ServiceClass;
  filters?: FlightFilters;
};

// export type FlightsDto = {};
