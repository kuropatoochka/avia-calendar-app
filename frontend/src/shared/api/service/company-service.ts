import type { CompaniesDto } from '@/shared/types';
import { API_URL } from '../../consts/api';
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
    const baseUrl = `${API_URL}/companies`;
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Не удалось получить список авиакомпаний. Код ошибки: ${response.status}`);
    }

    return response.json();
  }
}
