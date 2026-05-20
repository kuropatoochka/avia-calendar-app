import type { CompaniesDto } from '../../types/api';
import { http, HttpResponse } from 'msw';
import { companyMock } from '../mock/company-mock';

export const companyHandlers = [
  http.get('/api/companies', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase().trim();
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 10;

    const filteredCompanies = search
      ? companyMock.filter((item) => item.name.toLowerCase().includes(search))
      : companyMock;

    const paginatedCompanies = filteredCompanies.slice(offset, offset + limit);

    return HttpResponse.json<CompaniesDto>({
      items: paginatedCompanies,
      total: filteredCompanies.length,
      offset,
      limit,
    });
  }),
];
