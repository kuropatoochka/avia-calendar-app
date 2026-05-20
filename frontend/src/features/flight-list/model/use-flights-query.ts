import { useCallback } from 'react';
import { FlightService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';
import type { TicketsRequest } from '@/shared/types';

export const useFlightsQuery = () => {
  const loadFlights = useCallback(async (params: TicketsRequest) => {
    // TODO: Remove mock delay when real backend integration is ready.
    await new Promise((resolve) => {
      setTimeout(resolve, 1200);
    });

    return FlightService.getFlights(params);
  }, []);

  const [fetchFlights, isFlightsLoading, flightsError] = useFetch(loadFlights);

  return { fetchFlights, isFlightsLoading, flightsError };
};
