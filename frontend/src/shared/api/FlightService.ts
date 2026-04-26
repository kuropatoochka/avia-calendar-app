import type { BestPricesRequest, FlightsRequest } from '../types/api';
import { getFlightSearchParams } from '../utils/getFlightSearchParams';

/**
 * @todo Добавить свойство туда-обратно
 */

export default class FlightService {
  static async getFlights(params: FlightsRequest) {
    const url = new URL(`${BASE_URL}/flights`);
    url.search = getFlightSearchParams<FlightsRequest>(params);

    const response = await fetch(url, {
      method: 'GET',
    });

    return response;
  }

  static async getBestPrices(params: BestPricesRequest): Promise<Response> {
    const url = new URL(`${BASE_URL}/flights/best-prices`);
    url.search = getFlightSearchParams<BestPricesRequest>(params);

    const response = await fetch(url, {
      method: 'GET',
    });

    return response;
  }
}
