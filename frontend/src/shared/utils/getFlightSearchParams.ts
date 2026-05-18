import type { FlightFilters, FlightsRequest, Passengers } from '../types/api';

const getPassengersParams = (searchParams: URLSearchParams, params: Passengers) => {
  searchParams.set('passengers_adults', String(params.adults));
  searchParams.set('passengers_children', String(params.children));
  searchParams.set('passengers_toddler', String(params.toddler));

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

export const getFlightSearchParams = (params: FlightsRequest) => {
  const searchParams = new URLSearchParams();

  searchParams.set('origin', String(params.originAirportId));
  searchParams.set('destination', String(params.destinationAirportId));
  searchParams.set('date', params.date);
  searchParams.set('service_class', params.serviceClass);

  getPassengersParams(searchParams, params.passengers);

  if (params.filters) {
    getFiltersParams(searchParams, params.filters);
  }

  return searchParams.toString();
};
