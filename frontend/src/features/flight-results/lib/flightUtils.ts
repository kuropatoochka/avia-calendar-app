import type { FlightSegment, LayoverNote } from './types';
import type { DepartureTime, FlightFiltersState } from '@/features/flight-filters';
import type { FlightDto, FlightStop } from '@/shared/types';

export const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export const buildSegments = (flight: FlightDto): FlightSegment[] => {
  if (!flight.stops?.length) {
    return [
      {
        from: flight.originCity,
        fromAirport: flight.originAirport,
        fromCode: flight.origin.toUpperCase(),
        to: flight.destinationCity,
        toAirport: flight.destinationAirport,
        toCode: flight.destination.toUpperCase(),
        dep: flight.departureTime,
        arr: flight.arrivalTime,
        duration: flight.duration,
        airline: flight.airline,
      },
    ];
  }

  const segments: FlightSegment[] = [];
  let depTime = flight.departureTime;

  flight.stops.forEach((stop, i) => {
    const arrTime = addMinutes(depTime, stop.legDurationMinutes);
    const fromCity = i === 0 ? flight.originCity : flight.stops![i - 1].city;
    const fromAirport = i === 0 ? flight.originAirport : flight.stops![i - 1].airport;
    const fromCode = i === 0 ? flight.origin.toUpperCase() : flight.stops![i - 1].code;
    const airline = i === 0 ? flight.airline : (flight.stops![i - 1].legAirline ?? flight.airline);
    segments.push({
      from: fromCity,
      fromAirport,
      fromCode,
      to: stop.city,
      toAirport: stop.airport,
      toCode: stop.code,
      dep: depTime,
      arr: arrTime,
      duration: stop.legDurationMinutes,
      airline,
    });
    depTime = addMinutes(arrTime, stop.durationMinutes);
  });

  const lastStop = flight.stops[flight.stops.length - 1];
  const totalLayovers = flight.stops.reduce((acc, stop) => acc + stop.durationMinutes, 0);
  const totalLegFlying = flight.stops.reduce((acc, stop) => acc + stop.legDurationMinutes, 0);
  segments.push({
    from: lastStop.city,
    fromAirport: lastStop.airport,
    fromCode: lastStop.code,
    to: flight.destinationCity,
    toAirport: flight.destinationAirport,
    toCode: flight.destination.toUpperCase(),
    dep: depTime,
    arr: flight.arrivalTime,
    duration: flight.duration - totalLayovers - totalLegFlying,
    airline: lastStop.legAirline ?? flight.airline,
  });

  return segments;
};

export const getLayoverNotes = (
  stop: FlightStop,
  arrivalTime: string,
  arrivingAirline: string,
): LayoverNote[] => {
  const notes: LayoverNote[] = [];
  const dur = stop.durationMinutes;

  if (dur < 60) {
    notes.push({ text: 'Короткая пересадка — высокий риск не успеть', kind: 'danger' });
  } else if (dur < 90) {
    notes.push({ text: 'Мало времени на пересадку', kind: 'warning' });
  } else if (dur >= 360) {
    const [h, m] = arrivalTime.split(':').map(Number);
    const crossesMidnight = h * 60 + m + dur >= 24 * 60;
    notes.push(
      crossesMidnight
        ? { text: 'Ночная пересадка', kind: 'info' }
        : { text: 'Длительная пересадка', kind: 'info' },
    );
  }

  if (stop.legAirline && stop.legAirline !== arrivingAirline) {
    notes.push({ text: 'Потребуется повторная регистрация', kind: 'warning' });
    notes.push({ text: 'Багаж нужно получить и сдать заново', kind: 'warning' });
  }

  return notes;
};

export const hourToTimeOfDay = (hour: number): DepartureTime => {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
};

export const applyFilters = (flights: FlightDto[], filters: FlightFiltersState): FlightDto[] =>
  flights.filter((flight) => {
    if (flight.stopsCount > filters.maxStops) return false;
    if (filters.maxFlightDuration > 0 && flight.duration > filters.maxFlightDuration * 60)
      return false;

    if (filters.departureTime !== null) {
      const hour = parseInt(flight.departureTime.split(':')[0], 10);
      if (hourToTimeOfDay(hour) !== filters.departureTime) return false;
    }

    if (filters.maxPrice < 200_000 && flight.price > filters.maxPrice) return false;

    if (filters.baggageEnabled && !flight.baggageIncluded) return false;

    return true;
  });
