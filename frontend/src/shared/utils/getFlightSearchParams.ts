import type { FlightFilters, FlightsRequest, Passengers, PriceDynamicsRequest } from '../types/api';

const getPassengersParams = (searchParams: URLSearchParams, params: Passengers) => {
  searchParams.set('passengers_adults', String(params.adults));

  searchParams.set('passengers_children', String(params.children));
  searchParams.set('passengers_toddler', String(params.toddler));
  searchParams.set('passengers_animals', String(params.animals));

  return searchParams;
};

const getFiltersParams = (searchParams: URLSearchParams, params: FlightFilters) => {
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
};

export const getFlightSearchParams = <T extends PriceDynamicsRequest | FlightsRequest>(
  params: T,
) => {
  const searchParams = new URLSearchParams();

  searchParams.set('origin', params.originAirportId);
  searchParams.set('destination', params.destinationAirportId);

  if ('dateFrom' in params) {
    searchParams.set('date_from', params.dateFrom);
    searchParams.set('date_to', params.dateTo);
  }

  if ('date' in params) {
    searchParams.set('date', params.date);
  }

  if ('serviceClass' in params) {
    searchParams.set('service_class', params.serviceClass);
  }

  getPassengersParams(searchParams, params.passengers);

  if ('filters' in params && params.filters) {
    getFiltersParams(searchParams, params.filters);
  }

  return searchParams.toString();
};
