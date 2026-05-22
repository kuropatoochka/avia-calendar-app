import type { FlightFiltersState } from './types';
import { useState } from 'react';
import { DEFAULT_FLIGHT_FILTERS, MAX_PRICE_FILTER } from './defaults';

const clampMaxPrice = (value: number) => Math.min(value, MAX_PRICE_FILTER);

export const useFlightFilters = (initialFilters?: FlightFiltersState | null) => {
  const normalizedInitialFilters = initialFilters
    ? { ...initialFilters, maxPrice: clampMaxPrice(initialFilters.maxPrice) }
    : DEFAULT_FLIGHT_FILTERS;

  const [draftFilters, setDraftFilters] = useState<FlightFiltersState>(normalizedInitialFilters);

  const updateDraftFilter = <K extends keyof FlightFiltersState>(
    key: K,
    value: FlightFiltersState[K],
  ) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: key === 'maxPrice' && typeof value === 'number' ? clampMaxPrice(value) : value,
    }));
  };

  const addBaggageEntry = (passengerIndex: number) => {
    setDraftFilters((prev) => ({
      ...prev,
      extraBaggageEntries: [...prev.extraBaggageEntries, { passengerIndex, weight: 20 }],
    }));
  };

  const removeBaggageEntry = (entryIndex: number) => {
    setDraftFilters((prev) => ({
      ...prev,
      extraBaggageEntries: prev.extraBaggageEntries.filter((_, index) => index !== entryIndex),
    }));
  };

  const updateAnimalCount = (count: number) => {
    setDraftFilters((prev) => ({
      ...prev,
      animalWeights: Array.from({ length: count }, (_, index) => prev.animalWeights[index] ?? 10),
    }));
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_FLIGHT_FILTERS);
  };

  return {
    draftFilters,
    updateDraftFilter,
    addBaggageEntry,
    removeBaggageEntry,
    updateAnimalCount,
    resetFilters,
  };
};
