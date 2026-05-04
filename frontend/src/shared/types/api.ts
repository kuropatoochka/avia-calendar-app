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

// export type FlightFilters = {};

export type FlightsRequest = {
  origin: string;
  destination: string;
  date: string;
  passengers: Passengers;
  filters?: never;
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
  originAirport: string;
  destinationAirport: string;
  baggageIncluded: boolean;
  stopsCount: number;
  petsAllowed: boolean;
  groupFriendly: boolean;
};

export type FlightsDto = FlightDto[];
