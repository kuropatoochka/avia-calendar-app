import type { FlightFiltersState } from './types';

export const MAX_PRICE_FILTER = 50_000;

export const DEFAULT_FLIGHT_FILTERS: FlightFiltersState = {
  stopsFilterType: null,
  maxStops: 3,
  maxFlightDuration: 0,
  departureTime: null,
  maxPrice: MAX_PRICE_FILTER,
  baggageEnabled: false,
  baggageWeights: [20],
  extraBaggageEntries: [],
  airlines: [],
  petsEnabled: false,
  animalWeights: [10],
};
