import type { FlightFiltersState } from './types';
import type { TicketItemDto } from '@/shared/types';

const getDateTime = (date: string, time: string) => {
  return new Date(`${date}T${time}`).getTime();
};

const getRouteDurationMinutes = (ticketGroup: TicketItemDto[]) => {
  const firstTicket = ticketGroup[0];
  const lastTicket = ticketGroup[ticketGroup.length - 1];

  if (!firstTicket || !lastTicket) {
    return 0;
  }

  const departureTime = getDateTime(firstTicket.departure_date, firstTicket.departure_time);
  const arrivalTime = getDateTime(lastTicket.arrival_date, lastTicket.arrival_time);

  if (Number.isNaN(departureTime) || Number.isNaN(arrivalTime)) {
    return ticketGroup.reduce((sum, ticket) => sum + ticket.duration, 0);
  }

  return Math.round((arrivalTime - departureTime) / 60_000);
};

export const filterTicketGroups = (
  ticketGroups: TicketItemDto[][],
  filters: FlightFiltersState | null,
) => {
  if (!filters) {
    return ticketGroups;
  }

  return ticketGroups.filter((ticketGroup) => {
    const stopsCount = Math.max(ticketGroup.length - 1, 0);

    if (filters.stopsFilterType === 'direct' && stopsCount !== 0) {
      return false;
    }

    if (
      filters.stopsFilterType === 'withStops' &&
      (stopsCount === 0 || stopsCount > filters.maxStops)
    ) {
      return false;
    }

    if (filters.maxFlightDuration > 0) {
      const routeDurationMinutes = getRouteDurationMinutes(ticketGroup);
      const maxDurationMinutes = filters.maxFlightDuration * 60;

      if (routeDurationMinutes > maxDurationMinutes) {
        return false;
      }
    }

    return true;
  });
};
