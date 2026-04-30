import type { AirportDto } from '../../types/api';
import { http, HttpResponse } from 'msw';

const airportsMock: AirportDto[] = [
  { id: 'svo', airport: 'Шереметьево', city: 'Москва' },
  { id: 'dme', airport: 'Домодедово', city: 'Москва' },
  { id: 'vko', airport: 'Внуково', city: 'Москва' },
  { id: 'led', airport: 'Пулково', city: 'Санкт-Петербург' },
  { id: 'ovb', airport: 'Толмачёво', city: 'Новосибирск' },
  { id: 'svx', airport: 'Кольцово', city: 'Екатеринбург' },
  { id: 'kzn', airport: 'Казань', city: 'Казань' },
  { id: 'krr', airport: 'Пашковский', city: 'Краснодар' },
  { id: 'aer', airport: 'Адлер', city: 'Сочи' },
  { id: 'kuf', airport: 'Курумоч', city: 'Самара' },
  { id: 'ufa', airport: 'Уфа', city: 'Уфа' },
  { id: 'vvo', airport: 'Кневичи', city: 'Владивосток' },
  { id: 'noz', airport: 'Спиченково', city: 'Новокузнецк' },
  { id: 'rof', airport: 'Платов', city: 'Ростов-на-Дону' },
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
