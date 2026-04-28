import type { BestPricesRequest, FlightsRequest, Passengers } from '../types/api';

const getPassengersParams = (searchParams: URLSearchParams, params: Passengers) => {
  searchParams.set('passengers_adults', String(params.adults));

  if (params.children !== undefined) {
    searchParams.set('passengers_children', String(params.children));
  }

  if (params.toddler !== undefined) {
    searchParams.set('passengers_toddler', String(params.toddler));
  }

  return searchParams;
};

const getFiltersParams = (searchParams: URLSearchParams, params: never) => {
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
};

export const getFlightSearchParams = <T extends BestPricesRequest | FlightsRequest>(params: T) => {
  const searchParams = new URLSearchParams();

  searchParams.set('origin', params.origin);
  searchParams.set('destination', params.destination);

  if ('dateFrom' in params) {
    searchParams.set('date_from', params.dateFrom);
    searchParams.set('date_to', params.dateTo);
  }

  if ('date' in params) {
    searchParams.set('date', params.date);
  }

  getPassengersParams(searchParams, params.passengers);

  if ('filters' in params && params.filters) {
    getFiltersParams(searchParams, params.filters);
  }

  return searchParams.toString();
};
