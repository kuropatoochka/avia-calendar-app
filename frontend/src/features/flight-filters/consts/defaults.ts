import type { FlightFiltersState } from '../types/flightFilters';

export const DEFAULT_FLIGHT_FILTERS: FlightFiltersState = {
  maxStops: 2,
  stopDurationRange: [1, 72],
  maxFlightDuration: 10,
  departureTimes: ['morning', 'afternoon', 'evening', 'night'],
  pricePerPassenger: true,
  priceRange: [100, 1_000_000],
  baggageTypes: ['hand'],
  maxBaggageWeight: 10,
  airline: '',
  petTransport: [],
};
