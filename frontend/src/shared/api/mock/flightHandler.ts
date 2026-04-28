import { http, HttpResponse } from 'msw';
import { BASE_URL } from '../apiConsts';

type FlightMock = {
  id: string;
  origin: string;
  destination: string;
  date: string;
  price: number;
  duration: number;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  originAirport: string;
  destinationAirport: string;
  baggageIncluded: boolean;
  stopsCount: number;
};

const flightsMock: FlightMock[] = [
  {
    id: 'flight-1',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 8200,
    duration: 95,
    airline: 'Аэрофлот',
    departureTime: '08:30',
    arrivalTime: '10:05',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    baggageIncluded: true,
    stopsCount: 0,
  },
  {
    id: 'flight-2',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 7600,
    duration: 105,
    airline: 'Победа',
    departureTime: '12:10',
    arrivalTime: '13:55',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    baggageIncluded: false,
    stopsCount: 0,
  },
  {
    id: 'flight-3',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-02',
    price: 9100,
    duration: 100,
    airline: 'Россия',
    departureTime: '15:40',
    arrivalTime: '17:20',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    baggageIncluded: true,
    stopsCount: 0,
  },
  {
    id: 'flight-4',
    origin: 'dme',
    destination: 'led',
    date: '2026-05-02',
    price: 8700,
    duration: 110,
    airline: 'S7 Airlines',
    departureTime: '19:00',
    arrivalTime: '20:50',
    originAirport: 'Домодедово',
    destinationAirport: 'Пулково',
    baggageIncluded: true,
    stopsCount: 0,
  },
];

const getPassengerMultiplier = (url: URL) => {
  const adults = Number(url.searchParams.get('passengers_adults') ?? 1);
  const children = Number(url.searchParams.get('passengers_children') ?? 0);
  const toddler = Number(url.searchParams.get('passengers_toddler') ?? 0);

  return adults + children * 0.75 + toddler * 0.1;
};

const isDateInRange = (date: string, dateFrom: string, dateTo: string) => {
  return date >= dateFrom && date <= dateTo;
};

export const flightHandlers = [
  http.get(`${BASE_URL}/flights/best-prices`, ({ request }) => {
    const url = new URL(request.url);

    const origin = url.searchParams.get('origin');
    const destination = url.searchParams.get('destination');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');

    if (!origin || !destination || !dateFrom || !dateTo) {
      return HttpResponse.json({ message: 'Некорректные параметры запроса' }, { status: 400 });
    }

    const passengerMultiplier = getPassengerMultiplier(url);

    const filteredFlights = flightsMock.filter((flight) => {
      return (
        flight.origin === origin &&
        flight.destination === destination &&
        isDateInRange(flight.date, dateFrom, dateTo)
      );
    });

    const pricesByDate = filteredFlights.reduce<Record<string, number>>((acc, flight) => {
      const totalPrice = Math.round(flight.price * passengerMultiplier);

      if (!acc[flight.date] || totalPrice < acc[flight.date]) {
        acc[flight.date] = totalPrice;
      }

      return acc;
    }, {});

    const response = Object.entries(pricesByDate)
      .map(([date, price]) => ({
        date,
        price,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return HttpResponse.json(response);
  }),

  http.get(`${BASE_URL}/flights`, ({ request }) => {
    const url = new URL(request.url);

    const origin = url.searchParams.get('origin');
    const destination = url.searchParams.get('destination');
    const date = url.searchParams.get('date');

    if (!origin || !destination || !date) {
      return HttpResponse.json({ message: 'Некорректные параметры запроса' }, { status: 400 });
    }

    const passengerMultiplier = getPassengerMultiplier(url);

    const response = flightsMock
      .filter((flight) => {
        return (
          flight.origin === origin && flight.destination === destination && flight.date === date
        );
      })
      .map((flight) => ({
        ...flight,
        price: Math.round(flight.price * passengerMultiplier),
      }))
      .sort((a, b) => a.price - b.price);

    return HttpResponse.json(response);
  }),
];
