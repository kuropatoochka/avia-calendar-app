import type { ReactNode } from 'react';
import { useFlightFilters } from '../model/use-flight-filters';
import { FlightFiltersContext } from './FlightFiltersContext';

/** Wrap a page section with this so that both <FlightFilters /> and
 *  <FlightResultsBlock /> share exactly the same filter state. */
export const FlightFiltersProvider = ({ children }: { children: ReactNode }) => {
  const value = useFlightFilters();
  return <FlightFiltersContext.Provider value={value}>{children}</FlightFiltersContext.Provider>;
};
