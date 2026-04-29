import { API_URL } from '../consts/api';

export default class AirportService {
  static async getAirports(name?: string): Promise<Response> {
    const url = new URL(`${API_URL}/airports`);

    if (name) {
      url.searchParams.set('name', name.trim());
    }

    const response = await fetch(url, {
      method: 'GET',
    });

    return response;
  }
}
