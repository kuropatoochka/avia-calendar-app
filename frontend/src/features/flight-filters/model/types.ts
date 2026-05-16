export type DepartureTime = 'morning' | 'afternoon' | 'evening' | 'night';

export type FlightFiltersState = {
  // ПЕРЕЛЁТ
  maxStops: number;
  stopDurationRange: [number, number];
  maxFlightDuration: number;
  departureTimes: DepartureTime[];
  arrivalTimes: DepartureTime[];
  // СТОИМОСТЬ
  pricePerPassenger: boolean;
  priceRange: [number, number];
  // УСЛОВИЯ
  baggageEnabled: boolean;
  baggageForAll: boolean;
  baggageWeights: number[];
  airlines: string[];
  petsEnabled: boolean;
  animalCount: number;
  animalWeights: number[];
};
