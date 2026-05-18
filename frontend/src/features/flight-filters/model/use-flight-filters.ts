import type { FlightFiltersState } from './types';
import { useState } from 'react';
import { DEFAULT_FLIGHT_FILTERS } from './defaults';

export const useFlightFilters = () => {
  const [filters, setFilters] = useState<FlightFiltersState>(DEFAULT_FLIGHT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<FlightFiltersState>(DEFAULT_FLIGHT_FILTERS);

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
      extraBaggageEntries: prev.extraBaggageEntries.filter((_, i) => i !== entryIndex),
    }));
  };

  const updateAnimalCount = (count: number) => {
    setDraftFilters((prev) => ({
      ...prev,
      animalCount: count,
      animalWeights: Array.from({ length: count }, (_, i) => prev.animalWeights[i] ?? 10),
    }));
  };

  const removeAnimalEntry = (index: number) => {
    setDraftFilters((prev) => {
      if (prev.animalCount <= 1) return prev;
      const newWeights = prev.animalWeights.filter((_, i) => i !== index);
      return { ...prev, animalCount: newWeights.length, animalWeights: newWeights };
    });
  };

  const applyFilters = () => {
    setFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_FLIGHT_FILTERS);
    setFilters(DEFAULT_FLIGHT_FILTERS);
  };

  return {
    filters,
    draftFilters,
    updateDraftFilter,
    addBaggageEntry,
    removeBaggageEntry,
    updateAnimalCount,
    removeAnimalEntry,
    applyFilters,
    resetFilters,
  };
};
