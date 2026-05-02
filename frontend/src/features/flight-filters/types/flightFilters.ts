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
