import type { FlightFiltersState } from './types';
import { DEFAULT_FLIGHT_FILTERS } from './defaults';

const isSameFilterValue = (firstValue: unknown, secondValue: unknown) => {
  return JSON.stringify(firstValue) === JSON.stringify(secondValue);
};

const isFilterChanged = <Key extends keyof FlightFiltersState>(
  filters: FlightFiltersState,
  key: Key,
) => {
  return !isSameFilterValue(filters[key], DEFAULT_FLIGHT_FILTERS[key]);
};

export const getActiveFiltersCount = (filters: FlightFiltersState) => {
  let count = 0;

  if (isFilterChanged(filters, 'departureTime')) {
    count += 1;
  }

  if (isFilterChanged(filters, 'stopsFilterType') || isFilterChanged(filters, 'maxStops')) {
    count += 1;
  }

  if (isFilterChanged(filters, 'maxFlightDuration')) {
    count += 1;
  }

  if (isFilterChanged(filters, 'maxPrice')) {
    count += 1;
  }

  if (
    isFilterChanged(filters, 'baggageEnabled') ||
    isFilterChanged(filters, 'baggageWeights') ||
    isFilterChanged(filters, 'extraBaggageEntries')
  ) {
    count += 1;
  }

  if (isFilterChanged(filters, 'airlines')) {
    count += 1;
  }

  if (isFilterChanged(filters, 'petsEnabled') || isFilterChanged(filters, 'animalWeights')) {
    count += 1;
  }

  return count;
};
