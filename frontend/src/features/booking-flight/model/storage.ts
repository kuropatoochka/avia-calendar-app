import type { BookedFlight } from './types';

export const BOOKED_FLIGHTS_STORAGE_KEY = 'avia-calendar-booked-flights';
export const BOOKED_FLIGHTS_UPDATED_EVENT = 'booked-flights:updated';

const isBookedFlightsArray = (value: unknown): value is BookedFlight[] => Array.isArray(value);

export const getBookedFlights = (): BookedFlight[] => {
  const stored = localStorage.getItem(BOOKED_FLIGHTS_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as unknown;

    return isBookedFlightsArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveBookedFlights = (flights: BookedFlight[]) => {
  localStorage.setItem(BOOKED_FLIGHTS_STORAGE_KEY, JSON.stringify(flights));
  window.dispatchEvent(new CustomEvent(BOOKED_FLIGHTS_UPDATED_EVENT));
};

export const addBookedFlight = (flight: BookedFlight) => {
  const updatedFlights = [flight, ...getBookedFlights()];

  saveBookedFlights(updatedFlights);

  return updatedFlights;
};
