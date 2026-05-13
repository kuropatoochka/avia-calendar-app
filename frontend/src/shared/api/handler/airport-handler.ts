import { http, HttpResponse } from 'msw';
import { airportMock } from '../mock/airport-mock';

export const airportHandlers = [
  http.get('/api/airports', ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name')?.toLowerCase().trim();

    const filteredAirports = name
      ? airportMock.filter((item) => {
          return (
            item.airport.toLowerCase().includes(name) || item.city.toLowerCase().includes(name)
          );
        })
      : airportMock;

    return HttpResponse.json(filteredAirports);
  }),
];
