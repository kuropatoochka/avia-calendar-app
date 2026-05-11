import { API_URL } from '../../consts/api';

export default class AirportService {
  static async getAirports(name?: string): Promise<Response> {
    const baseUrl = API_URL?.endsWith('/') ? API_URL.slice(0, -1) : (API_URL ?? '');
    const searchParams = new URLSearchParams();

    if (name) {
      searchParams.set('name', name.trim());
    }

    const query = searchParams.toString();
    const url = `${baseUrl}/airports${query ? `?${query}` : ''}`;

    return fetch(url, {
      method: 'GET',
    });
  }
}
