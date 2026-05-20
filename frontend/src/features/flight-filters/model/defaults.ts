import type { FlightFiltersState } from './types';

export const DEFAULT_FLIGHT_FILTERS: FlightFiltersState = {
  stopsFilterType: null,
  maxStops: 3,
  maxFlightDuration: 0,
  departureTime: null,
  maxPrice: 200_000,
  baggageEnabled: false,
  baggageWeights: [20],
  extraBaggageEntries: [],
  airlines: [],
  petsEnabled: false,
  animalWeights: [10],
};
