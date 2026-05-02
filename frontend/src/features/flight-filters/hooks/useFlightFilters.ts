import { useState } from 'react';
import type { FlightFiltersState } from '../types/flightFilters';
import { DEFAULT_FLIGHT_FILTERS } from '../consts/defaults';

export const useFlightFilters = () => {
  const [filters, setFilters] = useState<FlightFiltersState>(DEFAULT_FLIGHT_FILTERS);

  const updateFilter = <K extends keyof FlightFiltersState>(
    key: K,
    value: FlightFiltersState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FLIGHT_FILTERS);

  return { filters, updateFilter, resetFilters };
};
