import type { PriceDynamicsRequest, TicketsRequest, TicketsResponse } from '../../types/api';
import { API_URL } from '../../consts/api';
import { getSearchParams } from '../../utils/getSearchParams';

export default class FlightService {
  static async getFlights(params: TicketsRequest): Promise<TicketsResponse> {
    const url = new URL(`${API_URL}/tickets`, window.location.origin);
    url.search = getSearchParams(params);

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Не удалось получить список рейсов. Код ошибки: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');

    if (!contentType?.includes('application/json')) {
      console.error('Tickets response has invalid content type', {
        contentType,
        url: response.url,
      });

      throw new Error('Не удалось загрузить список рейсов. Попробуйте обновить страницу.');
    }

    return response.json() as Promise<TicketsResponse>;
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
