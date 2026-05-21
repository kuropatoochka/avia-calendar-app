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
    const url = new URL(`${API_URL}/tickets/range`, window.location.origin);

    const searchParams = new URLSearchParams();
    searchParams.set('airport_from', params.originAirportId);
    searchParams.set('airport_to', params.destinationAirportId);
    searchParams.set('from_date', params.dateFrom);
    searchParams.set('to_date', params.dateTo);
    searchParams.set('service_class', params.serviceClass);
    searchParams.set('passengers_number', String(params.passengers.adults));
    searchParams.set('children_number', String(params.passengers.children));
    searchParams.set('toddlers_number', String(params.passengers.toddler));
    url.search = searchParams.toString();

    const response = await fetch(url, {
      method: 'GET',
    });

    return response;
  }
}
