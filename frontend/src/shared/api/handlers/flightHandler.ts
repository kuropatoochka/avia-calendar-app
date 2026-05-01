import { http, HttpResponse } from 'msw';
import { flightsMock } from '../mock/flightMock';

const getPassengerMultiplier = (url: URL) => {
  const adults = Number(url.searchParams.get('passengers_adults') ?? 1);
  const children = Number(url.searchParams.get('passengers_children') ?? 0);
  const toddler = Number(url.searchParams.get('passengers_toddler') ?? 0);

  return adults + children * 0.75 + toddler * 0.1;
};

const isDateInRange = (date: string, dateFrom: string, dateTo: string) => {
  return date >= dateFrom && date <= dateTo;
};

const getUTCDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};

const formatDate = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

const getDateRange = (dateFrom: string, dateTo: string) => {
  const dates: string[] = [];

  const currentDate = getUTCDate(dateFrom);
  const endDate = getUTCDate(dateTo);

  while (currentDate <= endDate) {
    dates.push(formatDate(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
};

export const flightHandlers = [
  http.get('/api/flights/best-prices', ({ request }) => {
    const url = new URL(request.url);

    const origin = url.searchParams.get('origin');
    const destination = url.searchParams.get('destination');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');

    if (!origin || !destination || !dateFrom || !dateTo) {
      return HttpResponse.json({ message: 'Некорректные параметры запроса' }, { status: 400 });
    }

    const passengerMultiplier = getPassengerMultiplier(url);
    const dates = getDateRange(dateFrom, dateTo);

    const filteredFlights = flightsMock.filter((flight) => {
      return (
        flight.origin === origin &&
        flight.destination === destination &&
        isDateInRange(flight.date, dateFrom, dateTo)
      );
    });

    const minPricesByDate = filteredFlights.reduce<Record<string, number>>((acc, flight) => {
      const totalPrice = Math.round(flight.price * passengerMultiplier);

      if (!acc[flight.date] || totalPrice < acc[flight.date]) {
        acc[flight.date] = totalPrice;
      }

      return acc;
    }, {});

    const response = dates.map((date) => ({
      date,
      minPrice: minPricesByDate[date] ?? null,
    }));

    return HttpResponse.json(response);
  }),

  http.get('/api/flights', ({ request }) => {
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
