import type { FlightCardViewModel } from './types';
import type { TicketItemDto } from '@/shared/types';

export const mapTicketGroupToCard = (
  ticketGroup: TicketItemDto[],
  index: number,
): FlightCardViewModel | null => {
  const firstTicket = ticketGroup[0];
  const lastTicket = ticketGroup[ticketGroup.length - 1];

  if (!firstTicket || !lastTicket) {
    return null;
  }

  return {
    id: `${firstTicket.flight_number}-${firstTicket.departure_date}-${firstTicket.departure_time}-${index}`,
    segments: ticketGroup,
    cityFrom: firstTicket.city_from,
    cityTo: lastTicket.city_to,
    airportFrom: firstTicket.airport_from,
    airportTo: lastTicket.airport_to,
    departureDate: firstTicket.departure_date,
    departureTime: firstTicket.departure_time,
    arrivalDate: lastTicket.arrival_date,
    arrivalTime: lastTicket.arrival_time,
    duration: ticketGroup.reduce((sum, ticket) => sum + ticket.duration, 0),
    price: firstTicket.prices.total,
    companyNames: [...new Set(ticketGroup.map((ticket) => ticket.company_name))],
    stopsCount: Math.max(ticketGroup.length - 1, 0),
    planeTypes: [...new Set(ticketGroup.map((ticket) => ticket.plane_type))],
  };
};
