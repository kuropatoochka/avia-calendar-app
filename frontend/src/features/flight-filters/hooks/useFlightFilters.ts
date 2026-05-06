import type { FlightFiltersState } from '../types/flightFilters';
import { useState } from 'react';
import { DEFAULT_FLIGHT_FILTERS } from '../consts/defaults';

const normalizeFilters = (filters: FlightFiltersState): FlightFiltersState => ({
  ...filters,
  baggageTypes: ['hand', ...filters.baggageTypes.filter((type) => type !== 'hand')],
});

export const useFlightFilters = () => {
  const initialFilters = normalizeFilters(DEFAULT_FLIGHT_FILTERS);

  const [filters, setFilters] = useState<FlightFiltersState>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<FlightFiltersState>(initialFilters);

  const updateDraftFilter = <K extends keyof FlightFiltersState>(
    key: K,
    value: FlightFiltersState[K],
  ) => {
    setDraftFilters((prev) => {
      const nextFilters: FlightFiltersState = { ...prev, [key]: value };

      return normalizeFilters(nextFilters);
    });
  };

  const applyFilters = () => {
    setFilters(normalizeFilters(draftFilters));
  };

  const resetFilters = () => {
    const nextFilters = normalizeFilters(DEFAULT_FLIGHT_FILTERS);

    setDraftFilters(nextFilters);
    setFilters(nextFilters);
  };

  return {
    filters,
    draftFilters,
    updateDraftFilter,
    updateFilter: updateDraftFilter,
    applyFilters,
    resetFilters,
  };
};
