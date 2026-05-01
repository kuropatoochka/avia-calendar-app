import type { FlightsRequest, PriceDynamicsRequest } from '../types/api';
import { API_URL } from '../consts/api';
import { getFlightSearchParams } from '../utils/getFlightSearchParams';

/**
 * @todo Добавить свойство туда-обратно
 * @todo Добавить фильтры для списка рейсов
 */

export default class FlightService {
  static async getFlights(params: FlightsRequest) {
    const url = new URL(`${API_URL}/flights`);
    url.search = getFlightSearchParams<FlightsRequest>(params);

    const response = await fetch(url, {
      method: 'GET',
    });

    return response;
  }

  static async getPriceDynamics(params: PriceDynamicsRequest): Promise<Response> {
    const url = new URL(`${API_URL}/flights/best-prices`);
    url.search = getFlightSearchParams<PriceDynamicsRequest>(params);

    const response = await fetch(url, {
      method: 'GET',
    });

    return response;
  }
}
