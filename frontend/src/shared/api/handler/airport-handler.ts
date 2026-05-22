import type { AirportsDto } from '../../types/api';
import { http, HttpResponse } from 'msw';
import { airportMock } from '../mock/airport-mock';

export const airportHandlers = [
  http.get('/api/airports', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase().trim();
    const idsParam = url.searchParams.get('ids');
    const ids = idsParam
      ? idsParam
          .split(',')
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id))
      : null;
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 10;

    const airportsByIds = ids?.length
      ? airportMock.filter((item) => ids.includes(item.id))
      : airportMock;

    const filteredAirports = search
      ? airportsByIds.filter((item) => {
          return (
            item.name.toLowerCase().includes(search) ||
            item.city.name.toLowerCase().includes(search)
          );
        })
      : airportsByIds;

    const paginatedAirports = filteredAirports.slice(offset, offset + limit);

    return HttpResponse.json<AirportsDto>({
      items: paginatedAirports,
      total: filteredAirports.length,
      offset,
      limit,
    });
  }),
];
