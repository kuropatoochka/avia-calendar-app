import type { FlightFiltersState } from './types';

export const DEFAULT_FLIGHT_FILTERS: FlightFiltersState = {
  maxStops: 0,
  stopDurationRange: [0, 72] as [number, number],
  maxFlightDuration: 0,
  departureTimes: ['morning', 'afternoon', 'evening', 'night'],
  arrivalTimes: ['morning', 'afternoon', 'evening', 'night'],
  maxPrice: 200_000,
  baggageEnabled: false,
  baggageWeights: [20],
  extraBaggageEntries: [],
  airlines: [],
  petsEnabled: false,
  animalCount: 1,
  animalWeights: [10],
};
