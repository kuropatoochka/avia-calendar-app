import { useCallback } from 'react';
import { FlightService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';
import type { TicketsRequest, TicketsResponse } from '@/shared/types';

export const useTicketsQuery = () => {
  const loadTickets = useCallback(async (params: TicketsRequest): Promise<TicketsResponse> => {
    // TODO: Remove mock delay when real backend integration is ready.
    await new Promise((resolve) => {
      setTimeout(resolve, 1200);
    });

    const data = await FlightService.getFlights(params);

    return data;
  }, []);

  const [fetchTickets, isTicketsLoading, ticketsError] = useFetch(loadTickets);
  const [fetchMoreTickets, isLoadingMore, loadMoreError] = useFetch(loadTickets);

  return {
    fetchTickets,
    fetchMoreTickets,
    isTicketsLoading,
    isLoadingMore,
    ticketsError: ticketsError ?? loadMoreError,
  };
};
