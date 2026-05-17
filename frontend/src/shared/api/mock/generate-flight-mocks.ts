import type { Passengers, ServiceClass } from '@/shared/types';

type GenerateFlightsParams = {
  originAirportId: string;
  destinationAirportId: string;
  date: string;
  passengers: Passengers;
  serviceClass: ServiceClass;
};

export type MockFlight = {
  id: string;
  origin: string;
  destination: string;
  originAirportId: string;
  destinationAirportId: string;
  date: string;
  price: number;
  duration: number;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  baggageIncluded: boolean;
  stopsCount: number;
  serviceClass: ServiceClass;
};

const AIRLINES = ['Aeroflot', 'S7 Airlines', 'Pobeda', 'Rossiya', 'Utair'];
const MINUTES_IN_DAY = 24 * 60;
const WEEKEND = new Set([0, 6]);

const SERVICE_CLASS_MULTIPLIERS: Record<ServiceClass, number> = {
  BUDGET: 1,
  COMFORT: 1.2,
  BUSINESS: 1.6,
  FIRST_CLASS: 2.1,
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

const getPassengerMultiplier = (passengers: Passengers) => {
  const { adults, children, toddler, animals } = passengers;

  return adults + children * 0.75 + toddler * 0.1 + animals * 0.2;
};

const getFlightCount = (seed: number) => {
  return seed % 4;
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

const getStopCount = (seed: number, serviceClass: ServiceClass) => {
  const stops = seed % 3;

  if (serviceClass === 'BUSINESS' || serviceClass === 'FIRST_CLASS') {
    return Math.min(stops, 1);
  }

  return stops;
};

export const generateFlights = ({
  originAirportId,
  destinationAirportId,
  date,
  passengers,
  serviceClass,
}: GenerateFlightsParams) => {
  const baseSeed = hashString(`${originAirportId}-${destinationAirportId}-${date}-${serviceClass}`);
  const routeSeed = hashString(`${originAirportId}-${destinationAirportId}`);
  const dateSeed = hashString(date);
  const passengerMultiplier = getPassengerMultiplier(passengers);

  const isWeekend = WEEKEND.has(getUTCDate(date).getUTCDay());
  const weekendMultiplier = isWeekend ? 1.08 : 1;

  const flightsCount = getFlightCount(baseSeed);
  const flights: MockFlight[] = [];

  for (let index = 0; index < flightsCount; index += 1) {
    const seed = hashString(`${baseSeed}-${index}`);
    const airline = AIRLINES[seed % AIRLINES.length];
    const stopsCount = getStopCount(seed, serviceClass);

    const basePrice = 2800 + (routeSeed % 1600) + (dateSeed % 700) + index * 220;
    const serviceMultiplier = SERVICE_CLASS_MULTIPLIERS[serviceClass];
    const price = Math.round(
      basePrice * weekendMultiplier * serviceMultiplier * passengerMultiplier,
    );

    const duration = 75 + (routeSeed % 90) + stopsCount * 25 + index * 8;
    const departureMinutes = getDepartureMinutes(seed);
    const arrivalMinutes = departureMinutes + duration + stopsCount * 15;

    flights.push({
      id: `flight-${hashString(`${originAirportId}-${destinationAirportId}-${date}-${index}`)}`,
      origin: originAirportId,
      destination: destinationAirportId,
      originAirportId,
      destinationAirportId,
      date,
      price,
      duration,
      airline,
      departureTime: formatTime(departureMinutes),
      arrivalTime: formatTime(arrivalMinutes),
      baggageIncluded: serviceClass !== 'BUDGET' || seed % 2 === 0,
      stopsCount,
      serviceClass,
    });
  }

  return flights;
};
