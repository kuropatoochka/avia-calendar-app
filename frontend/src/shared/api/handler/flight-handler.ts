import { http, HttpResponse } from 'msw';
import type { Passengers, ServiceClass } from '@/shared/types';
import { generateFlights, getDateRange } from '../mock/generate-flight-mocks';

const SERVICE_CLASSES: ServiceClass[] = ['BUDGET', 'COMFORT', 'BUSINESS', 'FIRST_CLASS'];

const getPriceDynamicsPassengers = (url: URL): Passengers => ({
  adults: Number(url.searchParams.get('passengers_number') ?? 1),
  children: Number(url.searchParams.get('children_number') ?? 0),
  toddler: Number(url.searchParams.get('todlers_number') ?? 0),
  animals: 0,
});

const getTicketsPassengers = (url: URL): Passengers => ({
  adults: Number(url.searchParams.get('passengers_number') ?? 1),
  children: Number(url.searchParams.get('children_number') ?? 0),
  toddler: Number(url.searchParams.get('todlers_number') ?? 0),
  animals: 0,
});

const getServiceClass = (url: URL): ServiceClass => {
  const serviceClass = url.searchParams.get('service_class');
  if (serviceClass && SERVICE_CLASSES.includes(serviceClass as ServiceClass)) {
    return serviceClass as ServiceClass;
  }
  return 'BUDGET';
};

/** Maps company ID → name, mirroring the backend seed data. */
const COMPANY_ID_TO_NAME: Record<string, string> = {
  '1': 'Аэрофлот',
  '2': 'S7 Airlines',
  '3': 'Уральские авиалинии',
  '4': 'Победа',
  '5': 'Россия',
};

/** Returns null when there are no available flights (mirrors backend `int | None`). */
const getMinFlightPrice = (flights: ReturnType<typeof generateFlights>): number | null => {
  if (!flights.length) return null;
  return Math.min(...flights.map((flight) => flight.prices.total));
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m ?? 0);
};

const applyTicketFilters = (flights: ReturnType<typeof generateFlights>, url: URL) => {
  const priceTo = url.searchParams.get('price_to');
  const companyParam = url.searchParams.get('company');
  const baggageSize = url.searchParams.get('baggage_size');
  const departureFromTime = url.searchParams.get('departure_from_time');
  const departureToTime = url.searchParams.get('departure_to_time');

  // `company` is a CSV of company IDs — resolve each ID to its name for comparison.
  const allowedCompanyNames = companyParam
    ? new Set(
        companyParam
          .split(',')
          .map((id) => COMPANY_ID_TO_NAME[id.trim()])
          .filter(Boolean),
      )
    : null;

  return flights.filter((flight) => {
    if (priceTo !== null && flight.prices.total > Number(priceTo)) return false;

    if (allowedCompanyNames && !allowedCompanyNames.has(flight.company_name)) return false;

    // Keep only flights whose included baggage meets the requested minimum.
    if (baggageSize !== null && flight.prices.baggage_price === 0) return false;

    if (departureFromTime && toMinutes(flight.departure_time) < toMinutes(departureFromTime))
      return false;

    if (departureToTime && toMinutes(flight.departure_time) > toMinutes(departureToTime))
      return false;

    return true;
  });
};

export const flightHandlers = [
  // -------------------------------------------------------------------------
  // GET /api/tickets/range — price dynamics chart
  // -------------------------------------------------------------------------
  http.get('/api/tickets/range', ({ request }) => {
    const url = new URL(request.url);

    console.log('[MSW] /api/tickets/range matched', url.search);

    const airportFrom = url.searchParams.get('airport_from');
    const airportTo = url.searchParams.get('airport_to');
    const dateFrom = url.searchParams.get('from_date');
    const dateTo = url.searchParams.get('to_date');

    if (!airportFrom || !airportTo || !dateFrom || !dateTo) {
      return HttpResponse.json({ message: 'Некорректные параметры запроса' }, { status: 400 });
    }

    const passengers = getPriceDynamicsPassengers(url);
    const serviceClass = getServiceClass(url);
    const dates = getDateRange(dateFrom, dateTo);

    const minPricesByDate = dates.reduce<Record<string, number | null>>((acc, date) => {
      const flights = generateFlights({
        airportFromId: Number(airportFrom),
        airportToId: Number(airportTo),
        date,
        passengers,
        serviceClass,
      });

      acc[date] = getMinFlightPrice(flights);
      return acc;
    }, {});

    const hasAvailablePrice = Object.values(minPricesByDate).some(
      (price) => price !== null && price > 0,
    );

    if (!hasAvailablePrice && dates.length) {
      const fallbackDate = dates[Math.floor(dates.length / 2)];
      const fallbackFlights = generateFlights({
        airportFromId: Number(airportFrom),
        airportToId: Number(airportTo),
        date: fallbackDate,
        passengers,
        serviceClass,
        forceAvailable: true,
      });
      minPricesByDate[fallbackDate] = getMinFlightPrice(fallbackFlights);
    }

    const response = dates.map((date) => ({
      departure_date: date,
      min_total_price: minPricesByDate[date] !== undefined ? minPricesByDate[date] : null,
    }));

    return HttpResponse.json(response);
  }),

  // -------------------------------------------------------------------------
  // GET /api/tickets — list of flights for a selected date
  // Matches backend: GET /tickets
  // -------------------------------------------------------------------------
  http.get('/api/tickets', ({ request }) => {
    const url = new URL(request.url);

    const airportFrom = url.searchParams.get('airport_from');
    const airportTo = url.searchParams.get('airport_to');
    const date = url.searchParams.get('date');

    if (!airportFrom || !airportTo || !date) {
      return HttpResponse.json({ message: 'Некорректные параметры запроса' }, { status: 400 });
    }

    const offset = Number(url.searchParams.get('offset') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const passengers = getTicketsPassengers(url);
    const serviceClass = getServiceClass(url);

    const allFlights = applyTicketFilters(
      generateFlights({
        airportFromId: Number(airportFrom),
        airportToId: Number(airportTo),
        date,
        passengers,
        serviceClass,
      }),
      url,
    ).sort((a, b) => a.prices.total - b.prices.total);

    const total = allFlights.length;
    const page = allFlights.slice(offset, offset + limit);

    // Backend wraps each flight in a single-element array (one group = one flight).
    return HttpResponse.json({
      items: page.map((flight) => [flight]),
      total,
      offset,
      limit,
    });
  }),
];
