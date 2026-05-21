import type { FlightFiltersState } from '../model/types';
import type { useFlightFilters } from '../model/use-flight-filters';
import { createContext, useContext } from 'react';
import { DEFAULT_FLIGHT_FILTERS } from '../model/defaults';

type FlightFiltersContextValue = ReturnType<typeof useFlightFilters>;

const noop = () => {};

export const FlightFiltersContext = createContext<FlightFiltersContextValue>({
  draftFilters: DEFAULT_FLIGHT_FILTERS,
  updateDraftFilter: noop as FlightFiltersContextValue['updateDraftFilter'],
  addBaggageEntry: noop as FlightFiltersContextValue['addBaggageEntry'],
  removeBaggageEntry: noop as FlightFiltersContextValue['removeBaggageEntry'],
  updateAnimalCount: noop as FlightFiltersContextValue['updateAnimalCount'],
  resetFilters: noop,
});

/** <FlightFilters /> calls this to read/write the shared filter state. */
export const useFlightFiltersShared = (): FlightFiltersContextValue =>
  useContext(FlightFiltersContext);

/** <FlightResultsBlock /> calls this to read the current applied filter state. */
export const useFlightFiltersContext = (): FlightFiltersState =>
  useContext(FlightFiltersContext).draftFilters;
