import type { AnalyticsSyncTicketsResponse } from '../../types/api';
import { ANALYTICS_API_URL } from '../../consts/api';
import { getSearchParams } from '../../utils/getSearchParams';

type SyncTicketsParams = {
  date?: string;
};

export default class AnalyticsService {
  static async syncTicketsPrices(
    params: SyncTicketsParams = {},
  ): Promise<AnalyticsSyncTicketsResponse> {
    const url = new URL(`${ANALYTICS_API_URL}/sync/tickets`, window.location.origin);
    const queryString = getSearchParams({ date: params.date });

    if (queryString) {
      url.search = queryString;
    }

    const response = await fetch(url, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Не удалось синхронизировать цены билетов. Код ошибки: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');

    if (!contentType?.includes('application/json')) {
      console.error('Analytics sync response has invalid content type', {
        contentType,
        url: response.url,
      });

      throw new Error('Не удалось синхронизировать цены билетов. Попробуйте повторить попытку.');
    }

    return response.json() as Promise<AnalyticsSyncTicketsResponse>;
  }
}
