import type { FlightsRequest, PriceDynamicsRequest } from '../../types/api';
import { API_URL } from '../../consts/api';
import { getFlightSearchParams } from '../../utils/getFlightSearchParams';

export default class FlightService {
  static async getFlights(params: FlightsRequest) {
    const url = new URL(`${API_URL}/flights`, window.location.origin);
    url.search = getFlightSearchParams(params);

    const response = await fetch(url, {
      method: 'GET',
    });

    return response;
  }

  static async getPriceDynamics(params: PriceDynamicsRequest): Promise<Response> {
    const url = new URL(`${API_URL}/flights/best-prices`, window.location.origin);

    const searchParams = new URLSearchParams();
    searchParams.set('origin', params.originAirportId);
    searchParams.set('destination', params.destinationAirportId);
    searchParams.set('date_from', params.dateFrom);
    searchParams.set('date_to', params.dateTo);
    searchParams.set('service_class', params.serviceClass);
    searchParams.set('passengers_adults', String(params.passengers.adults));
    searchParams.set('passengers_children', String(params.passengers.children));
    searchParams.set('passengers_toddler', String(params.passengers.toddler));
    url.search = searchParams.toString();

    const response = await fetch(url, {
      method: 'GET',
    });

    return response;
  }
}
