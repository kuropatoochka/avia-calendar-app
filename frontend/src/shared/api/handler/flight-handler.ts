import { http, HttpResponse } from 'msw';
import type { ServiceClass } from '@/shared/types';
import { companyMock } from '../mock/company-mock';
import { generateFlights, getDateRange } from '../mock/generate-flight-mocks';

const SERVICE_CLASSES: ServiceClass[] = ['economy', 'comfort', 'business', 'first'];

const getServiceClass = (url: URL): ServiceClass => {
  const serviceClass = url.searchParams.get('service_class');

  if (serviceClass && SERVICE_CLASSES.includes(serviceClass as ServiceClass)) {
    return serviceClass as ServiceClass;
  }

  return 'economy';
};

const parseNumber = (value: string | null, fallback = 0) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseCompanyIds = (value: string | null) => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(Number)
    .filter((id) => !Number.isNaN(id));
};

const normalizeTime = (time: string) => {
  return time.length === 5 ? `${time}:00` : time;
};

const getTicketGroupPrice = (group: ReturnType<typeof generateFlights>[number]) => {
  return group[0]?.prices.total ?? 0;
};

const getMinFlightPrice = (flights: ReturnType<typeof generateFlights>) => {
  if (!flights.length) {
    return 0;
  }

  return Math.min(...flights.map(getTicketGroupPrice));
};

const getCompanyNamesByIds = (companyIds: number[]) => {
  return companyIds
    .map((companyId) => companyMock.find((company) => company.id === companyId)?.name)
    .filter((companyName): companyName is string => Boolean(companyName));
};

type DestinationTraits = {
  has_sea: boolean;
  has_warm: boolean;
  has_nature: boolean;
};

const DESTINATION_TRAITS_BY_AIRPORT_ID: Record<string, DestinationTraits> = {
  svo: { has_sea: false, has_warm: false, has_nature: false }, // Шереметьево
  dme: { has_sea: false, has_warm: false, has_nature: false }, // Домодедово
  vko: { has_sea: false, has_warm: false, has_nature: false }, // Внуково
  led: { has_sea: true, has_warm: false, has_nature: true }, // Пулково
  ovb: { has_sea: false, has_warm: false, has_nature: true }, // Толмачёво
  svx: { has_sea: false, has_warm: false, has_nature: true }, // Кольцово
  kzn: { has_sea: false, has_warm: false, has_nature: true }, // Казань
  krd: { has_sea: false, has_warm: true, has_nature: true }, // Краснодар
  aer: { has_sea: true, has_warm: true, has_nature: true }, // Адлер / Сочи
  kuF: { has_sea: false, has_warm: true, has_nature: true }, // Курумоч
  ufa: { has_sea: false, has_warm: false, has_nature: true }, // Уфа
  vvo: { has_sea: true, has_warm: false, has_nature: true }, // Владивосток
  nsk: { has_sea: false, has_warm: false, has_nature: true }, // Спиченково
  rov: { has_sea: false, has_warm: true, has_nature: false }, // Платов
};

const isEnabledParam = (value: string | null) => value === 'true';

const getDestinationTraits = (airportTo: string): DestinationTraits => {
  return (
    DESTINATION_TRAITS_BY_AIRPORT_ID[airportTo] ?? {
      has_sea: false,
      has_warm: false,
      has_nature: false,
    }
  );
};

const matchesDestinationTags = (airportTo: string, url: URL) => {
  const traits = getDestinationTraits(airportTo);

  if (isEnabledParam(url.searchParams.get('has_sea')) && !traits.has_sea) {
    return false;
  }

  if (isEnabledParam(url.searchParams.get('has_warm')) && !traits.has_warm) {
    return false;
  }

  if (isEnabledParam(url.searchParams.get('has_nature')) && !traits.has_nature) {
    return false;
  }

  return true;
};

const applyTicketRequestFilters = (ticketGroups: ReturnType<typeof generateFlights>, url: URL) => {
  const companyIds = parseCompanyIds(url.searchParams.get('company'));
  const companyNames = getCompanyNamesByIds(companyIds);

  const priceTo = parseNumber(url.searchParams.get('price_to'));
  const departureFromTime = url.searchParams.get('departure_from_time');
  const departureToTime = url.searchParams.get('departure_to_time');

  return ticketGroups.filter((group) => {
    const firstTicket = group[0];

    if (!firstTicket) {
      return false;
    }

    if (
      companyNames.length > 0 &&
      !group.every((ticket) => companyNames.includes(ticket.company_name))
    ) {
      return false;
    }

    if (priceTo > 0 && getTicketGroupPrice(group) >= priceTo) {
      return false;
    }

    if (
      departureFromTime &&
      normalizeTime(firstTicket.departure_time) < normalizeTime(departureFromTime)
    ) {
      return false;
    }

    if (
      departureToTime &&
      normalizeTime(firstTicket.departure_time) > normalizeTime(departureToTime)
    ) {
      return false;
    }

    return true;
  });
};

export const flightHandlers = [
  http.get('/api/tickets/range', ({ request }) => {
    const url = new URL(request.url);

    const airportFrom = url.searchParams.get('airport_from') ?? '';
    const airportTo = url.searchParams.get('airport_to') ?? '';
    const dateFrom = url.searchParams.get('from_date');
    const dateTo = url.searchParams.get('to_date');

    if (!airportFrom || !airportTo || !dateFrom || !dateTo) {
      return HttpResponse.json({ message: 'Некорректные параметры запроса' }, { status: 400 });
    }

    const serviceClass = getServiceClass(url);
    const passengersNumber = parseNumber(url.searchParams.get('passengers_number'), 1);
    const childrenNumber = parseNumber(url.searchParams.get('children_number'));
    const toddlersNumber = parseNumber(url.searchParams.get('toddlers_number'));

    const dates = getDateRange(dateFrom, dateTo);

    const minPricesByDate = dates.reduce<Record<string, number>>((acc, date) => {
      const flights = generateFlights({
        airport_from: airportFrom,
        airport_to: airportTo,
        date,
        passengers_number: passengersNumber,
        children_number: childrenNumber,
        todlers_number: toddlersNumber,
        service_class: serviceClass,
      });

      acc[date] = getMinFlightPrice(flights);

      return acc;
    }, {});

    const hasAvailablePrice = Object.values(minPricesByDate).some((price) => price > 0);

    if (!hasAvailablePrice && dates.length) {
      const fallbackDate = dates[Math.floor(dates.length / 2)];

      const fallbackFlights = generateFlights({
        airport_from: airportFrom,
        airport_to: airportTo,
        date: fallbackDate,
        passengers_number: passengersNumber,
        children_number: childrenNumber,
        todlers_number: toddlersNumber,
        service_class: serviceClass,
        forceAvailable: true,
      });

      minPricesByDate[fallbackDate] = getMinFlightPrice(fallbackFlights);
    }

    const response = dates.map((date) => ({
      departure_date: date,
      min_total_price: minPricesByDate[date] ?? 0,
    }));

    return HttpResponse.json(response);
  }),

  http.get('/api/tickets', ({ request }) => {
    const url = new URL(request.url);

    const airportFrom = url.searchParams.get('airport_from') ?? '';
    const airportTo = url.searchParams.get('airport_to') ?? '';
    const date = url.searchParams.get('date');

    if (!airportFrom || !airportTo || !date) {
      return HttpResponse.json({ message: 'Некорректные параметры запроса' }, { status: 400 });
    }

    const offset = parseNumber(url.searchParams.get('offset'));
    const limit = parseNumber(url.searchParams.get('limit'), 100);

    if (!matchesDestinationTags(airportTo, url)) {
      return HttpResponse.json({
        items: [],
        total: 0,
        offset,
        limit,
      });
    }

    const serviceClass = getServiceClass(url);

    const items = generateFlights({
      airport_from: airportFrom,
      airport_to: airportTo,
      date,
      passengers_number: parseNumber(url.searchParams.get('passengers_number'), 1),
      children_number: parseNumber(url.searchParams.get('children_number')),
      todlers_number: parseNumber(url.searchParams.get('todlers_number')),
      baggage_size: parseNumber(url.searchParams.get('baggage_size')),
      service_class: serviceClass,
    });

    const filteredItems = applyTicketRequestFilters(items, url).sort((firstGroup, secondGroup) => {
      return getTicketGroupPrice(firstGroup) - getTicketGroupPrice(secondGroup);
    });

    return HttpResponse.json({
      items: filteredItems.slice(offset, offset + limit),
      total: filteredItems.length,
      offset,
      limit,
    });
  }),
];
