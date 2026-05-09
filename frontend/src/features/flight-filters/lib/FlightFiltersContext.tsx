import type { useFlightFilters } from '../hooks/useFlightFilters';
import type { FlightFiltersState } from '../types/flightFilters';
import { createContext, useContext } from 'react';
import { DEFAULT_FLIGHT_FILTERS } from '../consts/defaults';

type FlightFiltersContextValue = ReturnType<typeof useFlightFilters>;

const noop = () => {};

export const FlightFiltersContext = createContext<FlightFiltersContextValue>({
  filters: DEFAULT_FLIGHT_FILTERS,
  draftFilters: DEFAULT_FLIGHT_FILTERS,
  updateDraftFilter: noop as FlightFiltersContextValue['updateDraftFilter'],
  updateFilter: noop as FlightFiltersContextValue['updateFilter'],
  applyFilters: noop,
  resetFilters: noop,
});

/** Feature 5's <FlightFilters /> calls this to get the shared state it can update. */
export const useFlightFiltersShared = (): FlightFiltersContextValue =>
  useContext(FlightFiltersContext);

/** Feature 9 calls this to read the current filter state (read-only is enough). */
export const useFlightFiltersContext = (): FlightFiltersState =>
  useContext(FlightFiltersContext).filters;
