import type {
  FlightsDto,
  FlightsRequest,
  PriceDynamicsRequest,
  PriceDynamicsResponse,
} from '../../types/api';
import { API_URL } from '../../consts/api';
import { getFlightSearchParams } from '../../utils/getFlightSearchParams';
import { getSearchParams } from '../../utils/getSearchParams';

export default class FlightService {
  static async getFlights(params: FlightsRequest): Promise<FlightsDto> {
    const url = new URL(`${API_URL}/flights`, window.location.origin);
    url.search = getFlightSearchParams(params);

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Не удалось получить список рейсов. Код ошибки: ${response.status}`);
    }

    return response.json() as Promise<FlightsDto>;
  }

  static async getPriceDynamics(params: PriceDynamicsRequest): Promise<PriceDynamicsResponse> {
    const url = new URL(`${API_URL}/tickets/range`, window.location.origin);
    url.search = getSearchParams(params);

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Не удалось получить график цен. Код ошибки: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');

    if (!contentType?.includes('application/json')) {
      console.error('Price dynamics response has invalid content type', {
        contentType,
        url: response.url,
      });

      throw new Error('Не удалось загрузить график цен. Попробуйте обновить страницу.');
    }

    return response.json() as Promise<PriceDynamicsResponse>;
  }
}
