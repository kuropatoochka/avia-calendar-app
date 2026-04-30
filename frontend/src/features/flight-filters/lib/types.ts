export type DepartureTime = 'morning' | 'afternoon' | 'evening' | 'night';
export type BaggageType = 'hand' | 'checked';
export type PetTransport = 'cabin' | 'baggage';

export type FlightFiltersState = {
  maxStops: number;
  stopDurationRange: [number, number];
  maxFlightDuration: number;
  departureTimes: DepartureTime[];
  pricePerPassenger: boolean;
  priceRange: [number, number];
  baggageTypes: BaggageType[];
  maxBaggageWeight: number;
  airline: string;
  petTransport: PetTransport[];
};

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
