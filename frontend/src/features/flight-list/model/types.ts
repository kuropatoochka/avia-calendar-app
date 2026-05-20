import type { TicketItemDto } from '@/shared/types';

export type FlightCardViewModel = {
  id: string;
  segments: TicketItemDto[];
  cityFrom: string;
  cityTo: string;
  airportFrom: string;
  airportTo: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  duration: number;
  price: number;
  companyNames: string[];
  stopsCount: number;
  planeTypes: string[];
};
