import type { AirportDto } from '../../types/api';
import { http, HttpResponse } from 'msw';
import { BASE_URL } from '../apiConsts';

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
  http.get(`${BASE_URL}/airports`, ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name')?.toLowerCase();

    const filteredAirports = name
      ? airportsMock.filter((item) => item.airport.toLowerCase().includes(name))
      : airportsMock;

    return HttpResponse.json(filteredAirports);
  }),
];
