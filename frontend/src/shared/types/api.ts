export type AirportDto = {
  id: string;
  airport: string;
  city: string;
};

export type AirportsDto = {
  items: AirportDto[];
  total: number;
  offset: number;
  limit: number;
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
  petsAllowed: boolean;
  availableSeats: number;
};

// --- Types from develop (real backend API shapes) ---

export type CompanyDto = {
  id: number;
  name: string;
};

export type CompaniesDto = {
  items: CompanyDto[];
  total: number;
  offset: number;
  limit: number;
};

export type TicketFiltersRequest = {
  departure_from_time?: string;
  departure_to_time?: string;
  company?: string;
  price_to?: number;
  todlers_number?: number;
  children_number?: number;
  baggage_size?: number;
  has_sea?: boolean;
  has_warm?: boolean;
  has_nature?: boolean;
};

export type TicketsRequest = {
  airport_from: number;
  airport_to: number;
  date: string;
  passengers_number: number;
  service_class: ServiceClass;
  offset: number;
  limit: number;
} & TicketFiltersRequest;

export type TicketPricesDto = {
  total: number;
  price: number;
  children_price: number;
  todlers_price: number;
  baggage_price: number;
};

export type TicketItemDto = {
  city_from: string;
  city_to: string;
  airport_from: string;
  airport_to: string;
  flight_number: number;
  company_name: string;
  duration: number;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  plane_type: string;
  plane_number: string;
  prices: TicketPricesDto;
};

export type TicketsResponse = {
  items: TicketItemDto[][];
  total: number;
  offset: number;
  limit: number;
};
