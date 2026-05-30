import type { FlightCardViewModel } from './types';
import type { TicketItemDto } from '@/shared/types';
import { getRouteDuration } from './get-route-info';

export const mapTicketGroupToCard = (
  ticketGroup: TicketItemDto[],
  index: number,
): FlightCardViewModel | null => {
  const firstTicket = ticketGroup[0];
  const lastTicket = ticketGroup[ticketGroup.length - 1];

  if (!firstTicket || !lastTicket) {
    return null;
  }

  const duration = getRouteDuration(ticketGroup);

  // Aggregate prices across all segments so transfer routes show the correct total.
  const prices = ticketGroup.reduce(
    (acc, ticket) => ({
      total: acc.total + ticket.prices.total,
      price: acc.price + ticket.prices.price,
      children_price: acc.children_price + ticket.prices.children_price,
      todlers_price: acc.todlers_price + ticket.prices.todlers_price,
      baggage_price: acc.baggage_price + ticket.prices.baggage_price,
    }),
    { total: 0, price: 0, children_price: 0, todlers_price: 0, baggage_price: 0 },
  );

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
    duration,
    price: prices.total,
    prices,
    companyNames: [...new Set(ticketGroup.map((ticket) => ticket.company_name))],
    stopsCount: Math.max(ticketGroup.length - 1, 0),
    planeTypes: [...new Set(ticketGroup.map((ticket) => ticket.plane_type))],
  };
};
