import { createContext, useContext, type ReactNode } from 'react';
import type { FlightFiltersState } from './types';
import { DEFAULT_FLIGHT_FILTERS } from './types';
import { useFlightFilters } from './useFlightFilters';

type FlightFiltersContextValue = ReturnType<typeof useFlightFilters>;

const noop = () => {};

const FlightFiltersContext = createContext<FlightFiltersContextValue>({
  filters: DEFAULT_FLIGHT_FILTERS,
  updateFilter: noop as FlightFiltersContextValue['updateFilter'],
  resetFilters: noop,
});

/** Wrap the page with this provider so that both <FlightFilters /> (Feature 5)
 *  and <FlightResultsBlock /> (Feature 9) share exactly the same filter state
 *  without either component needing to receive it as props. */
export const FlightFiltersProvider = ({ children }: { children: ReactNode }) => {
  const value = useFlightFilters();
  return (
    <FlightFiltersContext.Provider value={value}>
      {children}
    </FlightFiltersContext.Provider>
  );
};

/** Feature 5's <FlightFilters /> calls this to get the shared state it can update. */
export const useFlightFiltersShared = (): FlightFiltersContextValue =>
  useContext(FlightFiltersContext);

/** Feature 9 calls this to read the current filter state (read-only is enough). */
export const useFlightFiltersContext = (): FlightFiltersState =>
  useContext(FlightFiltersContext).filters;
