import type { AirportsDto } from '@/shared/types';
import { API_URL } from '../../consts/api';
import { getSearchParams } from '../../utils/getSearchParams';

type Params = {
  search?: string;
  offset?: number;
  limit?: number;
  ids?: number[];
};

export default class AirportService {
  static async getAirports(params: Params = {}): Promise<AirportsDto> {
    const normalizedParams = {
      offset: 0,
      limit: 500,
      ...params,
      ids: params.ids?.length ? params.ids.join(',') : undefined,
    };
    const queryString = getSearchParams(normalizedParams);
    const baseUrl = `${API_URL}/airports`;
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Не удалось получить список аэропортов. Код ошибки: ${response.status}`);
    }

    return response.json();
  }
}
