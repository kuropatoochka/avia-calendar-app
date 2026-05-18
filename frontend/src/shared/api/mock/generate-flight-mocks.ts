import type { Passengers, ServiceClass } from '@/shared/types';
import { airportMock } from './airport-mock';

type GenerateFlightsParams = {
  airportFromId: number;
  airportToId: number;
  date: string;
  passengers: Passengers;
  serviceClass: ServiceClass;
  forceAvailable?: boolean;
};

type MockServiceClassPrices = {
  total: number;
  price: number;
  children_price: number;
  todlers_price: number;
  baggage_price: number;
};

export type MockTicketItem = {
  city_from: string;
  city_to: string;
  airport_from: string;
  airport_to: string;
  flight_number: number;
  company_name: string;
  duration: number;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  plane_type: string;
  plane_number: string;
  prices: MockServiceClassPrices;
};

/** Must match backend seed COMPANIES order: id 1–5. */
const COMPANIES = [
  { id: 1, name: 'Аэрофлот' },
  { id: 2, name: 'S7 Airlines' },
  { id: 3, name: 'Уральские авиалинии' },
  { id: 4, name: 'Победа' },
  { id: 5, name: 'Россия' },
] as const;

const PLANES = [
  { type: 'Airbus A320', number: 'VP-BQZ' },
  { type: 'Airbus A321', number: 'VP-BRM' },
  { type: 'Boeing 737-800', number: 'VP-BZQ' },
  { type: 'Boeing 737 MAX 8', number: 'VP-BNA' },
  { type: 'Sukhoi Superjet 100', number: 'RA-89001' },
];

const MINUTES_IN_DAY = 24 * 60;
const WEEKEND = new Set([0, 6]);
const BAGGAGE_PRICE_PER_KG = 150;
const CHILDREN_PRICE_RATIO = 0.75;
const TODDLER_PRICE_RATIO = 0.1;

const SERVICE_CLASS_MULTIPLIERS: Record<ServiceClass, number> = {
  BUDGET: 1,
  COMFORT: 1.2,
  BUSINESS: 1.6,
  FIRST_CLASS: 2.1,
};

const airportLookup = new Map(airportMock.map((a) => [a.id, a]));

const getAirport = (id: number) =>
  airportLookup.get(id) ?? { id, name: `Аэропорт ${id}`, city: { id: 0, name: 'Город' } };

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

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: string, days: number) => {
  const d = getUTCDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDate(d);
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
  const count = seed % 4;
  if (forceAvailable && count === 0) return 1;
  return count;
};

const getDepartureMinutes = (seed: number) => {
  const hour = 6 + (seed % 14);
  const minutes = [0, 15, 30, 45][(seed >> 2) % 4];
  return hour * 60 + minutes;
};

const formatTime = (minutes: number) => {
  const normalizedMinutes = ((minutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export const generateFlights = ({
  airportFromId,
  airportToId,
  date,
  passengers,
  serviceClass,
  forceAvailable = false,
}: GenerateFlightsParams): MockTicketItem[] => {
  const airportFrom = getAirport(airportFromId);
  const airportTo = getAirport(airportToId);

  const baseSeed = hashString(`${airportFromId}-${airportToId}-${date}-${serviceClass}`);
  const routeSeed = hashString(`${airportFromId}-${airportToId}`);
  const dateSeed = hashString(date);

  const isWeekend = WEEKEND.has(getUTCDate(date).getUTCDay());
  const weekendMultiplier = isWeekend ? 1.08 : 1;

  const flightsCount = getFlightCount(baseSeed, forceAvailable);
  const flights: MockTicketItem[] = [];

  for (let index = 0; index < flightsCount; index += 1) {
    const seed = hashString(`${baseSeed}-${index}`);
    const company = COMPANIES[seed % COMPANIES.length];
    const plane = PLANES[seed % PLANES.length];

    // stopsInternal is only used to inflate duration — not exposed in response
    const stopsInternal = seed % 3;

    const basePrice = 2800 + (routeSeed % 1600) + (dateSeed % 700) + index * 220;
    const serviceMultiplier = SERVICE_CLASS_MULTIPLIERS[serviceClass];
    const pricePerAdult = Math.round(basePrice * weekendMultiplier * serviceMultiplier);
    const childrenPrice = Math.round(pricePerAdult * CHILDREN_PRICE_RATIO);
    const toddlerPrice = Math.round(pricePerAdult * TODDLER_PRICE_RATIO);

    const { adults, children, toddler } = passengers;
    const total = pricePerAdult * adults + childrenPrice * children + toddlerPrice * toddler;

    const duration = 75 + (routeSeed % 90) + stopsInternal * 25 + index * 8;
    const departureMinutes = getDepartureMinutes(seed);
    const arrivalMinutes = departureMinutes + duration;
    const arrivalDayOffset = Math.floor(arrivalMinutes / MINUTES_IN_DAY);

    flights.push({
      city_from: airportFrom.city.name,
      city_to: airportTo.city.name,
      airport_from: airportFrom.name,
      airport_to: airportTo.name,
      flight_number: (seed % 9000) + 1000,
      company_name: company.name,
      duration,
      departure_date: date,
      departure_time: formatTime(departureMinutes),
      arrival_date: arrivalDayOffset > 0 ? addDays(date, arrivalDayOffset) : date,
      arrival_time: formatTime(arrivalMinutes),
      plane_type: plane.type,
      plane_number: plane.number,
      prices: {
        total,
        price: pricePerAdult,
        children_price: childrenPrice,
        todlers_price: toddlerPrice,
        baggage_price: BAGGAGE_PRICE_PER_KG,
      },
    });
  }

  return flights;
};
