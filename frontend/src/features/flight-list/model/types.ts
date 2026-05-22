import type { ServiceClass, TicketItemDto, TicketPricesDto } from '@/shared/types';

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
  prices: TicketPricesDto;
  companyNames: string[];
  stopsCount: number;
  planeTypes: string[];
};

export type FlightBookingDetails = {
  serviceClass: ServiceClass;
  passengers: {
    adults: number;
    children: number;
    toddler: number;
  };
  baggage: {
    enabled: boolean;
    weights: number[];
  };
};

export type BaggageOption = {
  enabled: boolean;
  label: string;
  price: number;
  weight: number;
};

export type FlightBookingPayload = {
  flight: FlightCardViewModel;
  baggage: BaggageOption;
  price: number;
};
