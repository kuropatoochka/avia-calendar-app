import type { AirportsDto } from '../../types/api';
import { http, HttpResponse } from 'msw';
import { airportMock } from '../mock/airport-mock';

export const airportHandlers = [
  http.get('/api/airports', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase().trim();
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 10;

    const filteredAirports = search
      ? airportMock.filter((item) => {
          return (
            item.name.toLowerCase().includes(search) ||
            item.city.name.toLowerCase().includes(search)
          );
        })
      : airportMock;

    const paginatedAirports = filteredAirports.slice(offset, offset + limit);

    return HttpResponse.json<AirportsDto>({
      items: paginatedAirports,
      total: filteredAirports.length,
      offset,
      limit,
    });
  }),
];
