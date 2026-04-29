import type { AirportDto } from '../../types/api';
import { http, HttpResponse } from 'msw';

const airportsMock: AirportDto[] = [
  {
    id: 'svo',
    airport: 'Шереметьево',
    city: 'Москва',
  },
  {
    id: 'dme',
    airport: 'Домодедово',
    city: 'Москва',
  },
  {
    id: 'vko',
    airport: 'Внуково',
    city: 'Москва',
  },
  {
    id: 'led',
    airport: 'Пулково',
    city: 'Санкт-Петербург',
  },
];

export const airportHandlers = [
  http.get('/api/airports', ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name')?.toLowerCase().trim();

    const filteredAirports = name
      ? airportsMock.filter((item) => {
          return (
            item.airport.toLowerCase().includes(name) || item.city.toLowerCase().includes(name)
          );
        })
      : airportsMock;

    return HttpResponse.json(filteredAirports);
  }),
];
