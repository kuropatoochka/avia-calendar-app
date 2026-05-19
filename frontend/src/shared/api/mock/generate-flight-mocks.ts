import type { FlightDto, FlightStop, Passengers, ServiceClass } from '@/shared/types';
import { airportMock } from './airport-mock';

type GenerateFlightsParams = {
  originAirportId: string;
  destinationAirportId: string;
  date: string;
  passengers: Passengers;
  serviceClass: ServiceClass;
};

const AIRLINES = ['Аэрофлот', 'S7 Airlines', 'Победа', 'Россия', 'Уральские авиалинии'];
const MINUTES_IN_DAY = 24 * 60;
const WEEKEND = new Set([0, 6]);

const SERVICE_CLASS_MULTIPLIERS: Record<ServiceClass, number> = {
  economy: 1,
  comfort: 1.2,
  business: 1.6,
  first: 2.1,
};

// Airports suitable as layover points
const LAYOVER_AIRPORTS = [
  { id: 'svo', airport: 'Шереметьево', city: 'Москва' },
  { id: 'led', airport: 'Пулково', city: 'Санкт-Петербург' },
  { id: 'svx', airport: 'Кольцово', city: 'Екатеринбург' },
  { id: 'ovb', airport: 'Толмачёво', city: 'Новосибирск' },
];

const airportLookup = new Map(airportMock.map((a) => [a.id, a]));

const getAirportInfo = (id: string) =>
  airportLookup.get(id) ?? { id, airport: id.toUpperCase(), city: id.toUpperCase() };

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

  if (serviceClass === 'business' || serviceClass === 'first') {
    return Math.min(stops, 1);
  }

  return stops;
};

const generateStops = (
  seed: number,
  stopsCount: number,
  originId: string,
  destinationId: string,
  totalDuration: number,
  airline: string,
): FlightStop[] => {
  if (stopsCount === 0) return [];

  const stops: FlightStop[] = [];
  const layoverDuration = 60 + (seed % 60); // 60–120 min layover
  const legDuration = Math.floor((totalDuration - stopsCount * layoverDuration) / (stopsCount + 1));

  for (let i = 0; i < stopsCount; i++) {
    const layoverSeed = hashString(`${seed}-layover-${i}`);
    // Pick a layover airport that's neither origin nor destination
    const candidates = LAYOVER_AIRPORTS.filter((a) => a.id !== originId && a.id !== destinationId);
    const layover = candidates[layoverSeed % candidates.length] ?? LAYOVER_AIRPORTS[0];
    const nextAirline =
      i < stopsCount - 1 && layoverSeed % 3 === 0
        ? AIRLINES[(layoverSeed >> 2) % AIRLINES.length]
        : undefined;

    stops.push({
      airport: layover.airport,
      city: layover.city,
      code: layover.id.toUpperCase(),
      durationMinutes: layoverDuration,
      legDurationMinutes: legDuration,
      legAirline: nextAirline !== airline ? nextAirline : undefined,
    });
  }

  return stops;
};

const generateSeats = (seed: number) => ({
  economy: 2 + (seed % 8),
  comfort: 1 + ((seed >> 1) % 6),
  business: 1 + ((seed >> 2) % 4),
  first: 1 + ((seed >> 3) % 3),
});

export const generateFlights = ({
  originAirportId,
  destinationAirportId,
  date,
  passengers,
  serviceClass,
}: GenerateFlightsParams): FlightDto[] => {
  const baseSeed = hashString(`${originAirportId}-${destinationAirportId}-${date}-${serviceClass}`);
  const routeSeed = hashString(`${originAirportId}-${destinationAirportId}`);
  const dateSeed = hashString(date);
  const passengerMultiplier = getPassengerMultiplier(passengers);

  const isWeekend = WEEKEND.has(getUTCDate(date).getUTCDay());
  const weekendMultiplier = isWeekend ? 1.08 : 1;

  const flightsCount = getFlightCount(baseSeed);
  const originInfo = getAirportInfo(originAirportId);
  const destinationInfo = getAirportInfo(destinationAirportId);
  const flights: FlightDto[] = [];

  for (let index = 0; index < flightsCount; index += 1) {
    const seed = hashString(`${baseSeed}-${index}`);
    const airline = AIRLINES[seed % AIRLINES.length];
    const stopsCount = getStopCount(seed, serviceClass);

    const basePrice = 2800 + (routeSeed % 1600) + (dateSeed % 700) + index * 220;
    const serviceMultiplier = SERVICE_CLASS_MULTIPLIERS[serviceClass];
    const price = Math.round(
      basePrice * weekendMultiplier * serviceMultiplier * passengerMultiplier,
    );
    // Add 0–15% original price markup for discount display
    const discountSeed = hashString(`${seed}-discount`);
    const originalPrice = Math.round(price * (1 + (discountSeed % 4) * 0.05));

    const duration = 75 + (routeSeed % 90) + stopsCount * 25 + index * 8;
    const departureMinutes = getDepartureMinutes(seed);
    const arrivalMinutes = departureMinutes + duration + stopsCount * 15;

    const baggageIncluded = serviceClass !== 'economy' || seed % 2 === 0;
    const baggageWeight = baggageIncluded ? 20 + (seed % 3) * 5 : 0;

    const stops = generateStops(
      seed,
      stopsCount,
      originAirportId,
      destinationAirportId,
      duration,
      airline,
    );

    const seatsSeed = hashString(`${seed}-seats`);
    const seatsLeft = generateSeats(seatsSeed);
    const seatsLeftAlt = generateSeats(hashString(`${seed}-seats-alt`));

    flights.push({
      id: `flight-${hashString(`${originAirportId}-${destinationAirportId}-${date}-${index}`)}`,
      origin: originAirportId,
      destination: destinationAirportId,
      date,
      price,
      originalPrice,
      duration,
      airline,
      departureTime: formatTime(departureMinutes),
      arrivalTime: formatTime(arrivalMinutes),
      originAirport: originInfo.airport,
      destinationAirport: destinationInfo.airport,
      originCity: originInfo.city,
      destinationCity: destinationInfo.city,
      baggageIncluded,
      baggageWeight,
      stopsCount,
      stops: stops.length > 0 ? stops : undefined,
      seatsLeft,
      seatsLeftAlt,
      petsAllowed: false,
      availableSeats: seatsLeft.economy + seatsLeft.comfort + seatsLeft.business + seatsLeft.first,
    });
  }

  return flights;
};
