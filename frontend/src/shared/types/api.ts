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
  /** null when no flights are available for that date */
  min_total_price: number | null;
};

export type PriceDynamicsResponse = PriceDynamicsDto[];

// ---------------------------------------------------------------------------
// Ticket (flight) types — mirrors backend TicketItem / TicketsListResponse
// ---------------------------------------------------------------------------

export type TicketServiceClassPricesDto = {
  /** Total cost for the whole group in the requested service class */
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
  prices: TicketServiceClassPricesDto;
};

/** Backend returns items as list[list[TicketItem]] — each inner list is one flight group */
export type TicketsListDto = {
  items: TicketItemDto[][];
  total: number;
  offset: number;
  limit: number;
};

// ---------------------------------------------------------------------------
// Flight search request — camelCase TS surface, serialised to snake_case by
// getFlightSearchParams.ts
// ---------------------------------------------------------------------------

/** Backend-supported filters for GET /tickets */
export type FlightFilters = {
  /** Upper price bound (maps to `price_to`) */
  price_to?: number;
  /** CSV of company IDs (maps to `company`) */
  company?: string;
  /** Total baggage weight in kg (maps to `baggage_size`) */
  baggage_size?: number;
  /** Earliest departure time HH:MM (maps to `departure_from_time`) */
  departure_from_time?: string;
  /** Latest departure time HH:MM (maps to `departure_to_time`) */
  departure_to_time?: string;
};

export type Passengers = {
  adults: number;
  children: number;
  toddler: number;
  animals: number;
};

export type FlightsRequest = {
  airportFromId: number;
  airportToId: number;
  date: string;
  passengers: Passengers;
  serviceClass: ServiceClass;
  offset?: number;
  limit?: number;
  filters?: FlightFilters;
};
