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
  originAirportId: string;
  destinationAirportId: string;
  date: string;
  passengers: Passengers;
  filters?: FlightFilters;
};

// export type FlightsDto = {};
