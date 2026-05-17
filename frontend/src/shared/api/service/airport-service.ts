import type { AirportsDto } from '@/shared/types';

type Params = {
  search?: string;
  offset?: number;
  limit?: number;
};

export default class AirportService {
  static async getAirports(params: Params = {}): Promise<AirportsDto> {
    const { search, offset, limit } = params;
    const searchParams = new URLSearchParams();

    if (search) {
      searchParams.set('search', search);
    }

    if (offset !== undefined) {
      searchParams.set('offset', String(offset));
    }

    if (limit !== undefined) {
      searchParams.set('limit', String(limit));
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/api/airports?${queryString}` : '/api/airports';

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Не удалось получить список аэропортов. Код ошибки: ${response.status}`);
    }

    return response.json();
  }
}
