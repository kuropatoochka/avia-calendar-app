export type DepartureTime = 'morning' | 'afternoon' | 'evening' | 'night';

export type ExtraBaggageEntry = {
  passengerIndex: number;
  weight: number;
};

export type FlightFiltersState = {
  // ПЕРЕЛЁТ
  maxStops: number;
  stopDurationRange: [number, number];
  maxFlightDuration: number;
  departureTimes: DepartureTime[];
  arrivalTimes: DepartureTime[];
  // СТОИМОСТЬ
  maxPrice: number;
  // УСЛОВИЯ
  baggageEnabled: boolean;
  baggageWeights: number[];
  extraBaggageEntries: ExtraBaggageEntry[];
  airlines: string[];
  petsEnabled: boolean;
  animalCount: number;
  animalWeights: number[];
};
