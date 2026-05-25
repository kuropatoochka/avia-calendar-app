import type { ServiceClass, TicketItemDto } from '@/shared/types';

export type BookedFlight = {
  id: string;
  bookedAt: string;
  cityFrom: string;
  cityTo: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  price: number;
  serviceClass: ServiceClass;
  passengers: number;
  segments: TicketItemDto[];
};
