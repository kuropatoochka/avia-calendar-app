export type DepartureTime = 'morning' | 'afternoon' | 'evening' | 'night';

export type StopsFilterType = 'direct' | 'withStops' | null;

export type ExtraBaggageEntry = {
  passengerIndex: number;
  weight: number;
};

export type FlightFiltersState = {
  // ФРОНТ
  stopsFilterType: StopsFilterType;
  maxStops: number;
  maxFlightDuration: number;

  // БЭК: один диапазон времени вылета
  departureTime: DepartureTime | null;

  // БЭК
  maxPrice: number;

  // БЭК: вес багажа
  baggageEnabled: boolean;
  baggageWeights: number[];
  extraBaggageEntries: ExtraBaggageEntry[];

  // БЭК: company CSV
  airlines: number[];

  // БЭК: животные добавляются к baggage_size
  petsEnabled: boolean;
  animalWeights: number[];
};
