import type { CompaniesDto } from '@/shared/types';
import { getSearchParams } from '../../utils/getSearchParams';

type Params = {
  search?: string;
  offset?: number;
  limit?: number;
};

export default class CompanyService {
  static async getCompanies(params: Params = {}): Promise<CompaniesDto> {
    // offset and limit are required by the backend; provide defaults.
    const paramsWithDefaults: Required<Pick<Params, 'offset' | 'limit'>> & Params = {
      offset: 0,
      limit: 500,
      ...params,
    };
    const queryString = getSearchParams(paramsWithDefaults);
    const url = queryString ? `/api/companies?${queryString}` : '/api/companies';

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Не удалось получить список авиакомпаний. Код ошибки: ${response.status}`);
    }

    return response.json();
  }
}
