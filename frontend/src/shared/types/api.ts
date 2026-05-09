export type ServiceClass = 'economy' | 'comfort' | 'business' | 'first';

export const CLASS_DELTAS: Record<ServiceClass, number> = {
  economy: 0,
  comfort: 3000,
  business: 8000,
  first: 15000,
};

export const CLASS_NAMES: Record<ServiceClass, string> = {
  economy: 'Эконом',
  comfort: 'Комфорт',
  business: 'Бизнес',
  first: 'Первый класс',
};

export type AirportDto = {
  id: string;
  airport: string;
  city: string;
};

export type Passengers = {
  adults: number;
  children?: number;
  toddler?: number;
};

export type BestPricesRequest = {
  origin: string;
  destination: string;
  dateFrom: string;
  dateTo: string;
  passengers: Passengers;
};

export type BestPricesDto = {
  date: string;
  price: number;
}[];

export type FlightFilters = {
  maxStops?: number;
  stopDurationRange?: [number, number];
  maxFlightDuration?: number;
  departureTimes?: string[];
  pricePerPassenger?: boolean;
  priceRange?: [number, number];
  baggageTypes?: string[];
  maxBaggageWeight?: number;
  airline?: string;
  petTransport?: string[];
};

export type FlightsRequest = {
  origin: string;
  destination: string;
  date: string;
  passengers: Passengers;
  filters?: FlightFilters;
};

export type FlightStop = {
  airport: string;
  city: string;
  code: string;
  durationMinutes: number;
  legDurationMinutes: number;
  legAirline?: string;
};

export type FlightDto = {
  id: string;
  origin: string;
  destination: string;
  date: string;
  price: number;
  originalPrice: number;
  duration: number;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  originAirport: string;
  destinationAirport: string;
  originCity: string;
  destinationCity: string;
  baggageIncluded: boolean;
  baggageWeight: number;
  stopsCount: number;
  stops?: FlightStop[];
  seatsLeft: { economy: number; comfort: number; business: number; first: number };
  seatsLeftAlt: { economy: number; comfort: number; business: number; first: number };
};
