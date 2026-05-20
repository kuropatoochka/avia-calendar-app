import type { FlightFiltersState } from './types';
import { useState } from 'react';
import { DEFAULT_FLIGHT_FILTERS } from './defaults';

export const useFlightFilters = (initialFilters?: FlightFiltersState | null) => {
  const [draftFilters, setDraftFilters] = useState<FlightFiltersState>(
    initialFilters ?? DEFAULT_FLIGHT_FILTERS,
  );

  const updateDraftFilter = <K extends keyof FlightFiltersState>(
    key: K,
    value: FlightFiltersState[K],
  ) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
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
