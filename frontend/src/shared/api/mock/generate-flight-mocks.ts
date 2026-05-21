import type { ServiceClass, TicketItemDto, TicketsResponse } from '@/shared/types';
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
  economy: 1,
  comfort: 1.2,
  business: 1.6,
  first: 2.1,
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

  if (serviceClass === 'business' || serviceClass === 'first') {
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
  cityFrom,
  cityTo,
  date,
  seed,
  segmentIndex,
  segmentsCount,
  departureMinutes,
  duration,
  total,
  price,
  childrenPrice,
  todlersPrice,
  baggagePrice,
}: {
  airportFrom: number;
  airportTo: number;
  cityFrom: string;
  cityTo: string;
  date: string;
  seed: number;
  segmentIndex: number;
  segmentsCount: number;
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

  const isFirstSegment = segmentIndex === 0;
  const isLastSegment = segmentIndex === segmentsCount - 1;

  const transitName = `Транзит ${segmentIndex}`;

  return {
    city_from: isFirstSegment ? cityFrom : transitName,
    city_to: isLastSegment ? cityTo : `Транзит ${segmentIndex + 1}`,
    airport_from: isFirstSegment ? `Аэропорт ${airportFrom}` : `Аэропорт ${transitName}`,
    airport_to: isLastSegment ? `Аэропорт ${airportTo}` : `Аэропорт Транзит ${segmentIndex + 1}`,
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
  const baseSeed = hashString(`${airport_from}-${airport_to}-${date}-${service_class}`);
  const routeSeed = hashString(`${airport_from}-${airport_to}`);
  const dateSeed = hashString(date);

  const isWeekend = WEEKEND.has(getUTCDate(date).getUTCDay());
  const weekendMultiplier = isWeekend ? 1.08 : 1;

  const flightsCount = getFlightCount(baseSeed, forceAvailable);
  const ticketGroups: TicketItemDto[][] = [];

  for (let index = 0; index < flightsCount; index += 1) {
    const seed = hashString(`${baseSeed}-${index}`);
    const stopsCount = getStopsCount(seed + index, service_class);
    const segmentsCount = stopsCount + 1;

    const basePrice = 2800 + (routeSeed % 1600) + (dateSeed % 700) + index * 260;
    const stopPriceMultiplier = 1 + stopsCount * 0.18;
    const serviceMultiplier = SERVICE_CLASS_MULTIPLIERS[service_class];

    const price = Math.round(
      basePrice * weekendMultiplier * serviceMultiplier * stopPriceMultiplier,
    );
    const childrenPrice = Math.round(price * 0.75);
    const todlersPrice = Math.round(price * 0.1);
    const baggagePrice = service_class === 'economy' ? 350 : 0;

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

    const group = Array.from({ length: segmentsCount }, (_, segmentIndex) => {
      const departureMinutes =
        firstDepartureMinutes + segmentIndex * (segmentDuration + layoverDuration);

      return createSegment({
        airportFrom: airport_from,
        airportTo: airport_to,
        cityFrom: `Город ${airport_from}`,
        cityTo: `Город ${airport_to}`,
        date,
        seed,
        segmentIndex,
        segmentsCount,
        departureMinutes,
        duration: segmentDuration,
        total,
        price,
        childrenPrice,
        todlersPrice,
        baggagePrice,
      });
    });

    ticketGroups.push(group);
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
