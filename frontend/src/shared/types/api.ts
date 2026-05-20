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

export type TicketsResponse = PaginatedResponse<TicketItemDto[]>;
