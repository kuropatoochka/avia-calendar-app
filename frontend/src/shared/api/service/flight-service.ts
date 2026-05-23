import type {
  PriceDynamicsRequest,
  PriceDynamicsResponse,
  TicketBookRequestItem,
  TicketBookResponse,
  TicketsRequest,
  TicketsResponse,
} from '../../types/api';
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

  static async bookTickets(body: TicketBookRequestItem[]): Promise<TicketBookResponse> {
    const url = new URL(`${API_URL}/tickets/`, window.location.origin);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 409) {
      throw new Error('Недостаточно мест для бронирования выбранного предложения.');
    }

    if (response.status === 404) {
      throw new Error('Выбранный рейс не найден. Попробуйте обновить список предложений.');
    }

    if (!response.ok) {
      throw new Error(`Не удалось забронировать билеты. Код ошибки: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');

    if (!contentType?.includes('application/json')) {
      console.error('Ticket booking response has invalid content type', {
        contentType,
        url: response.url,
      });

      throw new Error('Не удалось забронировать билеты. Попробуйте повторить попытку.');
    }

    return response.json() as Promise<TicketBookResponse>;
  }
}
