import type { FlightFiltersState } from './types';

export const DEFAULT_FLIGHT_FILTERS: FlightFiltersState = {
  maxStops: 0,
  stopDurationRange: [1, 72],
  maxFlightDuration: 0,
  departureTimes: ['morning', 'afternoon', 'evening', 'night'],
  arrivalTimes: ['morning', 'afternoon', 'evening', 'night'],
  pricePerPassenger: false,
  priceRange: [1_000, 200_000],
  baggageEnabled: false,
  baggageForAll: true,
  baggageWeights: [20],
  airlines: [],
  petsEnabled: false,
  animalCount: 1,
  animalWeights: [10],
};
