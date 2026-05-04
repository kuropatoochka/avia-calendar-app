import type { FlightFiltersState } from './types';
import type { useFlightFilters } from './useFlightFilters';
import { createContext, useContext } from 'react';
import { DEFAULT_FLIGHT_FILTERS } from './types';

type FlightFiltersContextValue = ReturnType<typeof useFlightFilters>;

const noop = () => {};

export const FlightFiltersContext = createContext<FlightFiltersContextValue>({
  filters: DEFAULT_FLIGHT_FILTERS,
  updateFilter: noop as FlightFiltersContextValue['updateFilter'],
  resetFilters: noop,
});

/** Feature 5's <FlightFilters /> calls this to get the shared state it can update. */
export const useFlightFiltersShared = (): FlightFiltersContextValue =>
  useContext(FlightFiltersContext);

/** Feature 9 calls this to read the current filter state (read-only is enough). */
export const useFlightFiltersContext = (): FlightFiltersState =>
  useContext(FlightFiltersContext).filters;
