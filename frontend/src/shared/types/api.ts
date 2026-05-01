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

export type PriceDynamicsRequest = {
  originAirportId: string;
  destinationAirportId: string;
  dateFrom: string;
  dateTo: string;
  passengers: Passengers;
};

export type PriceDynamicsDto = {
  date: string;
  minPrice: number | null;
};

// export type FlightFilters = {};

export type FlightsRequest = {
  originAirportId: string;
  destinationAirportId: string;
  date: string;
  passengers: Passengers;
  filters?: never;
};

// export type FlightsDto = {};
