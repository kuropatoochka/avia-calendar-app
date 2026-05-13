import type { ServiceClass } from '@/shared/types';

type FlightOfferServiceClass = ServiceClass;

type FlightOffer = {
  id: string;
  origin: string;
  destination: string;
  originAirportId: string;
  destinationAirportId: string;
  date: string;
  price: number;
  duration: number;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  baggageIncluded: boolean;
  stopsCount: number;
  serviceClass: FlightOfferServiceClass;
};

export type { FlightOffer };
