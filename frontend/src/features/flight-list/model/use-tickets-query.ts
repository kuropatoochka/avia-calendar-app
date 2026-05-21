import { useCallback, useState } from 'react';
import { FlightService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';
import type { TicketItemDto, TicketsRequest, TicketsResponse } from '@/shared/types';

export const useTicketsQuery = () => {
  const [ticketGroups, setTicketGroups] = useState<TicketItemDto[][]>([]);
  const [ticketsTotal, setTicketsTotal] = useState(0);

  const loadTickets = useCallback(async (params: TicketsRequest): Promise<TicketsResponse> => {
    // TODO: Remove mock delay when real backend integration is ready.
    await new Promise((resolve) => {
      setTimeout(resolve, 1200);
    });

    const data = await FlightService.getFlights(params);

    setTicketGroups(data.items);
    setTicketsTotal(data.total);

    return data;
  }, []);

  const [fetchTickets, isTicketsLoading, ticketsError] = useFetch(loadTickets);

  const resetTickets = useCallback(() => {
    setTicketGroups([]);
    setTicketsTotal(0);
  }, []);

  return {
    ticketGroups,
    ticketsTotal,
    fetchTickets,
    resetTickets,
    isTicketsLoading,
    ticketsError,
  };
};
