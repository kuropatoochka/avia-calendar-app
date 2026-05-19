import type { AirportsDto } from '@/shared/types';
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
      ...params,
      ids: params.ids?.length ? params.ids.join(',') : undefined,
    };
    const queryString = getSearchParams(normalizedParams);
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
