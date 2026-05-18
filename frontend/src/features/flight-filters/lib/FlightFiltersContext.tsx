import type { FlightFiltersState } from '../model/types';
import type { useFlightFilters } from '../model/use-flight-filters';
import { createContext, useContext } from 'react';
import { DEFAULT_FLIGHT_FILTERS } from '../model/defaults';

type FlightFiltersContextValue = ReturnType<typeof useFlightFilters>;

const noop = () => {};

export const FlightFiltersContext = createContext<FlightFiltersContextValue>({
  filters: DEFAULT_FLIGHT_FILTERS,
  draftFilters: DEFAULT_FLIGHT_FILTERS,
  updateDraftFilter: noop as FlightFiltersContextValue['updateDraftFilter'],
  setBaggageMode: noop as FlightFiltersContextValue['setBaggageMode'],
  addBaggageEntry: noop,
  removeBaggageEntry: noop as FlightFiltersContextValue['removeBaggageEntry'],
  updateAnimalCount: noop as FlightFiltersContextValue['updateAnimalCount'],
  removeAnimalEntry: noop as FlightFiltersContextValue['removeAnimalEntry'],
  applyFilters: noop,
  resetFilters: noop,
});

/** <FlightFilters /> calls this to read/write the shared filter state. */
export const useFlightFiltersShared = (): FlightFiltersContextValue =>
  useContext(FlightFiltersContext);

/** <FlightResultsBlock /> calls this to read the current applied filter state. */
export const useFlightFiltersContext = (): FlightFiltersState =>
  useContext(FlightFiltersContext).filters;
