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

export type CompanyDto = {
  id: number;
  name: string;
};

export type CompaniesDto = PaginatedResponse<CompanyDto>;

export type ServiceClass = 'BUDGET' | 'COMFORT' | 'BUSINESS' | 'FIRST_CLASS';

export type PriceDynamicsRequest = {
  airport_from: number;
  airport_to: number;
  from_date: string;
  to_date: string;
  service_class: ServiceClass;
  passengers_number: number;
  children_number?: number;
  toddlers_number?: number;
};

export type PriceDynamicsDto = {
  departure_date: string;
  min_total_price: number;
};

export type PriceDynamicsResponse = PriceDynamicsDto[];

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
  airlines?: number[];
  petsEnabled?: boolean;
  animalCount?: number;
  animalWeights?: number[];
};

export type Passengers = {
  adults: number;
  children: number;
  toddler: number;
  animals: number;
};

export type FlightsRequest = {
  originAirportId: number;
  destinationAirportId: number;
  date: string;
  passengers: Passengers;
  serviceClass: ServiceClass;
  filters?: FlightFilters;
};

export type FlightDto = {
  id: string;
  origin: string;
  destination: string;
  date: string;
  price: number;
  duration: number;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  baggageIncluded: boolean;
  stopsCount: number;
  petsAllowed: boolean;
  availableSeats: number;
};

export type FlightsDto = FlightDto[];
