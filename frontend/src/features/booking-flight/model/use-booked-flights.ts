import type { BookedFlight } from './types';
import { useCallback, useEffect, useState } from 'react';
import {
  addBookedFlight as addBookedFlightToStorage,
  BOOKED_FLIGHTS_STORAGE_KEY,
  BOOKED_FLIGHTS_UPDATED_EVENT,
  getBookedFlights,
  saveBookedFlights,
} from './storage';

export const useBookedFlights = () => {
  const [bookedFlights, setBookedFlights] = useState<BookedFlight[]>(() => getBookedFlights());

  const syncBookedFlights = useCallback(() => {
    setBookedFlights(getBookedFlights());
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return;
      }

      if (event.key !== BOOKED_FLIGHTS_STORAGE_KEY) {
        return;
      }

      syncBookedFlights();
    };

    const handleCustomUpdate = () => {
      syncBookedFlights();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(BOOKED_FLIGHTS_UPDATED_EVENT, handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(BOOKED_FLIGHTS_UPDATED_EVENT, handleCustomUpdate);
    };
  }, [syncBookedFlights]);

  const addBookedFlight = useCallback((flight: BookedFlight) => {
    const updatedFlights = addBookedFlightToStorage(flight);
    setBookedFlights(updatedFlights);
  }, []);

  const clearBookedFlights = useCallback(() => {
    saveBookedFlights([]);
    setBookedFlights([]);
  }, []);

  return {
    bookedFlights,
    bookedFlightsCount: bookedFlights.length,
    addBookedFlight,
    clearBookedFlights,
  };
};
