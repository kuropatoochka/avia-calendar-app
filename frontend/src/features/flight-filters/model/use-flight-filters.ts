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

  const setBaggageMode = (forAll: boolean, passengerCount: number) => {
    setDraftFilters((prev) => {
      const extras = prev.baggageWeights.slice(forAll ? 1 : passengerCount);
      const base = forAll
        ? [prev.baggageWeights[0] ?? 20]
        : Array.from({ length: passengerCount }, (_, i) => prev.baggageWeights[i] ?? 20);
      return { ...prev, baggageForAll: forAll, baggageWeights: [...base, ...extras] };
    });
  };

  const addBaggageEntry = () => {
    setDraftFilters((prev) => ({
      ...prev,
      baggageWeights: [...prev.baggageWeights, 20],
    }));
  };

  const removeBaggageEntry = (index: number) => {
    setDraftFilters((prev) => ({
      ...prev,
      baggageWeights: prev.baggageWeights.filter((_, i) => i !== index),
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
    setBaggageMode,
    addBaggageEntry,
    removeBaggageEntry,
    updateAnimalCount,
    removeAnimalEntry,
    applyFilters,
    resetFilters,
  };
};
