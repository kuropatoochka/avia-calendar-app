import { useState } from 'react';
import { DEFAULT_FLIGHT_FILTERS } from './types';
import type { FlightFiltersState } from './types';

export const useFlightFilters = () => {
  const [filters, setFilters] = useState<FlightFiltersState>(DEFAULT_FLIGHT_FILTERS);

  const updateFilter = <K extends keyof FlightFiltersState>(key: K, value: FlightFiltersState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FLIGHT_FILTERS);

  return { filters, updateFilter, resetFilters };
};
