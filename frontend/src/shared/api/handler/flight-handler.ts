import { http, HttpResponse } from 'msw';
import type { Passengers, ServiceClass } from '@/shared/types';
import { generateFlights, getDateRange } from '../mock/generate-flight-mocks';

const SERVICE_CLASSES: ServiceClass[] = ['BUDGET', 'COMFORT', 'BUSINESS', 'FIRST_CLASS'];

const getPassengers = (url: URL): Passengers => {
  return {
    adults: Number(url.searchParams.get('passengers_adults') ?? 1),
    children: Number(url.searchParams.get('passengers_children') ?? 0),
    toddler: Number(url.searchParams.get('passengers_toddler') ?? 0),
    animals: Number(url.searchParams.get('passengers_animals') ?? 0),
  };
};

const getServiceClass = (url: URL): ServiceClass => {
  const serviceClass = url.searchParams.get('service_class');

  if (serviceClass && SERVICE_CLASSES.includes(serviceClass as ServiceClass)) {
    return serviceClass as ServiceClass;
  }

  return 'BUDGET';
};

const parseNumber = (value: string | null) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseRange = (value: string | null) => {
  if (!value) {
    return undefined;
  }

  const [minRaw, maxRaw] = value.split(',');
  const min = parseNumber(minRaw ?? null);
  const max = parseNumber(maxRaw ?? null);

  if (min === undefined || max === undefined) {
    return undefined;
  }

  return [min, max] as const;
};

const applyFilters = (flights: ReturnType<typeof generateFlights>, url: URL) => {
  const maxStops = parseNumber(url.searchParams.get('maxStops'));
  const maxFlightDuration = parseNumber(url.searchParams.get('maxFlightDuration'));
  const priceRange = parseRange(url.searchParams.get('priceRange'));

  return flights.filter((flight) => {
    if (maxStops !== undefined && flight.stopsCount > maxStops) {
      return false;
    }

    if (maxFlightDuration !== undefined && flight.duration > maxFlightDuration) {
      return false;
    }

    if (priceRange && (flight.price < priceRange[0] || flight.price > priceRange[1])) {
      return false;
    }

    return true;
  });
};

export const flightHandlers = [
  http.get('/api/tickets/range', ({ request }) => {
    const url = new URL(request.url);

    const origin = url.searchParams.get('airport_from');
    const destination = url.searchParams.get('airport_to');
    const dateFrom = url.searchParams.get('from_date');
    const dateTo = url.searchParams.get('to_date');

    if (!origin || !destination || !dateFrom || !dateTo) {
      return HttpResponse.json({ message: 'Некорректные параметры запроса' }, { status: 400 });
    }

    const passengers = getPassengers(url);
    const serviceClass = getServiceClass(url);
    const dates = getDateRange(dateFrom, dateTo);

    const minPricesByDate = dates.reduce<Record<string, number>>((acc, date) => {
      const flights = applyFilters(
        generateFlights({
          originAirportId: origin,
          destinationAirportId: destination,
          date,
          passengers,
          serviceClass,
        }),
        url,
      );

      if (flights.length) {
        acc[date] = Math.min(...flights.map((flight) => flight.price));
      }

      return acc;
    }, {});

    const response = dates.map((date) => ({
      departure_date: date,
      min_total_price: minPricesByDate[date] ?? null,
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

    const passengers = getPassengers(url);
    const serviceClass = getServiceClass(url);

    const response = applyFilters(
      generateFlights({
        originAirportId: origin,
        destinationAirportId: destination,
        date,
        passengers,
        serviceClass,
      }),
      url,
    ).sort((a, b) => a.price - b.price);

    return HttpResponse.json(response);
  }),
];
