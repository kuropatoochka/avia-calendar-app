import { API_URL } from '../../consts/api';

export default class AirportService {
  static async getAirports(params?: {
    search?: string;
    offset?: number;
    limit?: number;
  }): Promise<Response> {
    const baseUrl = API_URL?.endsWith('/') ? API_URL.slice(0, -1) : (API_URL ?? '');
    const searchParams = new URLSearchParams();
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 10;

    searchParams.set('offset', String(offset));
    searchParams.set('limit', String(limit));

    if (params?.search) {
      searchParams.set('search', params.search.trim());
    }

    const query = searchParams.toString();
    const url = `${baseUrl}/airports${query ? `?${query}` : ''}`;

    return fetch(url, {
      method: 'GET',
    });
  }
}
