import type { ReactNode } from 'react';
import { FlightFiltersContext } from './FlightFiltersContext';
import { useFlightFilters } from './useFlightFilters';

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
