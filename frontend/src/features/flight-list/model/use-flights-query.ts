import { useCallback } from 'react';
import { FlightService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';
import type { FlightsRequest } from '@/shared/types';

export const useFlightsQuery = () => {
  const loadFlights = useCallback(async (params: FlightsRequest) => {
    return FlightService.getFlights(params);
  }, []);

  const [fetchFlights, isFlightsLoading, flightsError] = useFetch(loadFlights);

  return { fetchFlights, isFlightsLoading, flightsError };
};
