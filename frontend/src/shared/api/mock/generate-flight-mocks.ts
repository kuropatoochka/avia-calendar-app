import type { AirportDto, ServiceClass, TicketItemDto, TicketsResponse } from '@/shared/types';
import { airportMock } from './airport-mock';
import { companyMock } from './company-mock';

type GenerateFlightsParams = {
  airport_from: number;
  airport_to: number;
  date: string;
  passengers_number: number;
  service_class: ServiceClass;
  offset?: number;
  limit?: number;
  children_number?: number;
  todlers_number?: number;
  baggage_size?: number;
  forceAvailable?: boolean;
};

const PLANE_TYPES = ['Airbus A320', 'Boeing 737', 'Sukhoi Superjet 100'];
const MINUTES_IN_DAY = 24 * 60;
const WEEKEND = new Set([0, 6]);

const SERVICE_CLASS_MULTIPLIERS: Record<ServiceClass, number> = {
  BUDGET: 1,
  COMFORT: 1.2,
  BUSINESS: 1.6,
  FIRST_CLASS: 2.1,
};

const airportById = new Map(airportMock.map((airport) => [airport.id, airport]));

const getAirportById = (airportId: number) => airportById.get(airportId);

const areSameCity = (airportFromId: number, airportToId: number) => {
  const airportFrom = getAirportById(airportFromId);
  const airportTo = getAirportById(airportToId);

  if (!airportFrom || !airportTo) {
    return true;
  }

  return airportFrom.city.id === airportTo.city.id;
};

const getAvailableTransitAirports = ({
  usedAirportIds,
  previousCityId,
  destinationCityId,
}: {
  usedAirportIds: Set<number>;
  previousCityId: number;
  destinationCityId: number;
}) => {
  return airportMock.filter((airport) => {
    if (usedAirportIds.has(airport.id)) {
      return false;
    }

    if (airport.city.id === previousCityId) {
      return false;
    }

    if (airport.city.id === destinationCityId) {
      return false;
    }

    return true;
  });
};

const pickTransitAirport = ({
  availableAirports,
  seed,
  index,
}: {
  availableAirports: AirportDto[];
  seed: number;
  index: number;
}) => {
  if (availableAirports.length === 0) {
    return undefined;
  }

  return availableAirports[(seed + index) % availableAirports.length];
};

const buildRouteAirports = ({
  originAirportId,
  destinationAirportId,
  stopsCount,
  seed,
}: {
  originAirportId: number;
  destinationAirportId: number;
  stopsCount: number;
  seed: number;
}) => {
  const origin = getAirportById(originAirportId);
  const destination = getAirportById(destinationAirportId);

  if (!origin || !destination) {
    return [];
  }

  if (areSameCity(originAirportId, destinationAirportId)) {
    return [];
  }

  if (stopsCount <= 0) {
    return [originAirportId, destinationAirportId];
  }

  const routeAirportIds: number[] = [originAirportId];
  const usedAirportIds = new Set([originAirportId, destinationAirportId]);
  let previousCityId = origin.city.id;

  for (let stopIndex = 0; stopIndex < stopsCount; stopIndex += 1) {
    const availableAirports = getAvailableTransitAirports({
      usedAirportIds,
      previousCityId,
      destinationCityId: destination.city.id,
    });
    const transitAirport = pickTransitAirport({
      availableAirports,
      seed,
      index: stopIndex,
    });

    if (!transitAirport) {
      break;
    }

    routeAirportIds.push(transitAirport.id);
    usedAirportIds.add(transitAirport.id);
    previousCityId = transitAirport.city.id;
  }

  routeAirportIds.push(destinationAirportId);

  return routeAirportIds;
};

const isValidRoute = (routeAirportIds: number[]) => {
  if (routeAirportIds.length < 2) {
    return false;
  }

  for (let index = 0; index < routeAirportIds.length - 1; index += 1) {
    if (areSameCity(routeAirportIds[index], routeAirportIds[index + 1])) {
      return false;
    }
  }

  return true;
};

const isValidGroup = (group: TicketItemDto[]) => {
  if (group.length === 0) {
    return false;
  }

  for (let index = 0; index < group.length; index += 1) {
    const segment = group[index];

    if (segment.city_from === segment.city_to) {
      return false;
    }

    if (segment.airport_from === segment.airport_to) {
      return false;
    }

    if (index > 0) {
      const previousSegment = group[index - 1];
      if (
        previousSegment.city_to !== segment.city_from ||
        previousSegment.airport_to !== segment.airport_from
      ) {
        return false;
      }
    }
  }

  return true;
};

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

const getUTCDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};

const formatDate = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

const addDays = (date: string, days: number) => {
  const nextDate = getUTCDate(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return formatDate(nextDate);
};

export const getDateRange = (dateFrom: string, dateTo: string) => {
  const dates: string[] = [];
  const currentDate = getUTCDate(dateFrom);
  const endDate = getUTCDate(dateTo);

  while (currentDate <= endDate) {
    dates.push(formatDate(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
};

const getFlightCount = (seed: number, forceAvailable = false) => {
  const count = 8 + (seed % 7);

  if (forceAvailable) {
    return Math.max(count, 8);
  }

  return count;
};

const getStopsCount = (seed: number, serviceClass: ServiceClass) => {
  const stops = seed % 3;

  if (serviceClass === 'BUSINESS' || serviceClass === 'FIRST_CLASS') {
    return Math.min(stops, 1);
  }

  return stops;
};

const getDepartureMinutes = (seed: number, index: number) => {
  const hour = 5 + ((seed + index * 3) % 17);
  const minutes = [0, 15, 30, 45][(seed + index) % 4];

  return hour * 60 + minutes;
};

const formatTime = (minutes: number) => {
  const normalizedMinutes = ((minutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
};

const getDateByMinutesOffset = (date: string, minutes: number) => {
  return addDays(date, Math.floor(minutes / MINUTES_IN_DAY));
};

const getPassengerTotalPrice = ({
  price,
  childrenPrice,
  todlersPrice,
  baggagePrice,
  passengersNumber,
  childrenNumber,
  todlersNumber,
  baggageSize,
}: {
  price: number;
  childrenPrice: number;
  todlersPrice: number;
  baggagePrice: number;
  passengersNumber: number;
  childrenNumber: number;
  todlersNumber: number;
  baggageSize: number;
}) => {
  return Math.round(
    price * passengersNumber +
      childrenPrice * childrenNumber +
      todlersPrice * todlersNumber +
      baggagePrice * baggageSize,
  );
};

const createSegment = ({
  airportFrom,
  airportTo,
  date,
  seed,
  segmentIndex,
  departureMinutes,
  duration,
  total,
  price,
  childrenPrice,
  todlersPrice,
  baggagePrice,
}: {
  airportFrom: AirportDto;
  airportTo: AirportDto;
  date: string;
  seed: number;
  segmentIndex: number;
  departureMinutes: number;
  duration: number;
  total: number;
  price: number;
  childrenPrice: number;
  todlersPrice: number;
  baggagePrice: number;
}): TicketItemDto => {
  const company = companyMock[(seed + segmentIndex) % companyMock.length];
  const planeType = PLANE_TYPES[(seed + segmentIndex) % PLANE_TYPES.length];

  const arrivalMinutes = departureMinutes + duration;
  const flightInstanceId = hashString(
    [seed, segmentIndex, airportFrom.id, airportTo.id, date, departureMinutes].join('-'),
  );

  const segment: TicketItemDto = {
    city_from: airportFrom.city.name,
    city_to: airportTo.city.name,
    airport_from: airportFrom.name,
    airport_to: airportTo.name,
    flight_instance_id: flightInstanceId,
    flight_number: 1000 + ((seed + segmentIndex * 97) % 9000),
    company_name: company.name,
    duration,
    departure_date: getDateByMinutesOffset(date, departureMinutes),
    departure_time: formatTime(departureMinutes),
    arrival_date: getDateByMinutesOffset(date, arrivalMinutes),
    arrival_time: formatTime(arrivalMinutes),
    plane_type: planeType,
    plane_number: `RA-${10000 + ((seed + segmentIndex * 137) % 90000)}`,
    prices: {
      total,
      price,
      children_price: childrenPrice,
      todlers_price: todlersPrice,
      baggage_price: baggagePrice,
    },
  };

  return segment;
};

export const generateFlights = ({
  airport_from,
  airport_to,
  date,
  passengers_number,
  service_class,
  children_number = 0,
  todlers_number = 0,
  baggage_size = 0,
  forceAvailable = false,
}: GenerateFlightsParams): TicketItemDto[][] => {
  const originAirport = getAirportById(airport_from);
  const destinationAirport = getAirportById(airport_to);

  if (!originAirport || !destinationAirport) {
    return [];
  }

  if (areSameCity(airport_from, airport_to)) {
    return [];
  }

  const baseSeed = hashString(`${airport_from}-${airport_to}-${date}-${service_class}`);
  const routeSeed = hashString(`${airport_from}-${airport_to}`);
  const dateSeed = hashString(date);

  const isWeekend = WEEKEND.has(getUTCDate(date).getUTCDay());
  const weekendMultiplier = isWeekend ? 1.08 : 1;

  const flightsCount = getFlightCount(baseSeed, forceAvailable);
  const ticketGroups: TicketItemDto[][] = [];

  for (let index = 0; index < flightsCount; index += 1) {
    const seed = hashString(`${baseSeed}-${index}`);
    const desiredStopsCount = getStopsCount(seed + index, service_class);
    const routeAirportIds = buildRouteAirports({
      originAirportId: airport_from,
      destinationAirportId: airport_to,
      stopsCount: desiredStopsCount,
      seed,
    });

    if (!isValidRoute(routeAirportIds)) {
      continue;
    }

    const segmentsCount = routeAirportIds.length - 1;
    const stopsCount = Math.max(segmentsCount - 1, 0);

    // Proxy для дистанции: чем больше разница airport ID, тем «дальше» маршрут.
    // Диапазон ~0..1.8 даёт реалистичный разброс коротких/длинных рейсов.
    const distanceFactor = Math.min(Math.abs(airport_to - airport_from) / 60, 1.8);
    const basePrice = Math.round(
      (999 + (routeSeed % 900) + (dateSeed % 400) + index * 160) * (1 + distanceFactor * 0.6),
    );
    const stopPriceMultiplier = 1 + stopsCount * 0.15;
    const serviceMultiplier = SERVICE_CLASS_MULTIPLIERS[service_class];

    const price = Math.round(
      basePrice * weekendMultiplier * serviceMultiplier * stopPriceMultiplier,
    );
    const childrenPrice = Math.round(price * 0.75);
    const todlersPrice = Math.round(price * 0.1);
    const baggagePrice = service_class === 'BUDGET' ? 350 : 0;

    const total = getPassengerTotalPrice({
      price,
      childrenPrice,
      todlersPrice,
      baggagePrice,
      passengersNumber: passengers_number,
      childrenNumber: children_number,
      todlersNumber: todlers_number,
      baggageSize: baggage_size,
    });

    const totalFlightDuration = 75 + (routeSeed % 90) + stopsCount * 70 + index * 8;
    const segmentDuration = Math.max(45, Math.round(totalFlightDuration / segmentsCount));
    const layoverDuration = 45 + (seed % 75);

    const firstDepartureMinutes = getDepartureMinutes(seed, index);
    const group: TicketItemDto[] = [];
    let isGroupValid = true;

    for (let segmentIndex = 0; segmentIndex < segmentsCount; segmentIndex += 1) {
      const departureMinutes =
        firstDepartureMinutes + segmentIndex * (segmentDuration + layoverDuration);
      const airportFromId = routeAirportIds[segmentIndex];
      const airportToId = routeAirportIds[segmentIndex + 1];
      const airportFrom = airportFromId !== undefined ? getAirportById(airportFromId) : undefined;
      const airportTo = airportToId !== undefined ? getAirportById(airportToId) : undefined;

      if (!airportFrom || !airportTo || areSameCity(airportFromId, airportToId)) {
        isGroupValid = false;
        break;
      }

      group.push(
        createSegment({
          airportFrom,
          airportTo,
          date,
          seed,
          segmentIndex,
          departureMinutes,
          duration: segmentDuration,
          total,
          price,
          childrenPrice,
          todlersPrice,
          baggagePrice,
        }),
      );
    }

    if (isGroupValid && isValidGroup(group)) {
      ticketGroups.push(group);
    }
  }

  return ticketGroups;
};

export const generateFlightsResponse = (params: GenerateFlightsParams): TicketsResponse => {
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 100;

  const items = generateFlights(params);
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    total: items.length,
    offset,
    limit,
  };
};
