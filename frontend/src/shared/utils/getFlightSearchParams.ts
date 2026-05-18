import type { FlightFilters, FlightsRequest } from '../types/api';

const appendPassengers = (params: URLSearchParams, req: FlightsRequest) => {
  params.set('passengers_number', String(req.passengers.adults));
  if (req.passengers.children) params.set('children_number', String(req.passengers.children));
  if (req.passengers.toddler) params.set('todlers_number', String(req.passengers.toddler));
};

const appendFilters = (params: URLSearchParams, filters: FlightFilters) => {
  if (filters.price_to !== undefined) params.set('price_to', String(filters.price_to));
  if (filters.company) params.set('company', filters.company);
  if (filters.baggage_size !== undefined) params.set('baggage_size', String(filters.baggage_size));
  if (filters.departure_from_time) params.set('departure_from_time', filters.departure_from_time);
  if (filters.departure_to_time) params.set('departure_to_time', filters.departure_to_time);
};

export const getFlightSearchParams = (req: FlightsRequest): string => {
  const params = new URLSearchParams();

  params.set('airport_from', String(req.airportFromId));
  params.set('airport_to', String(req.airportToId));
  params.set('date', req.date);
  params.set('service_class', req.serviceClass);
  params.set('offset', String(req.offset ?? 0));
  params.set('limit', String(req.limit ?? 20));

  appendPassengers(params, req);

  if (req.filters) {
    appendFilters(params, req.filters);
  }

  return params.toString();
};
