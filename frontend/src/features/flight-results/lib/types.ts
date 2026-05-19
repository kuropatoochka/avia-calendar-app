import type { FlightDto } from '@/shared/types';

export type FlightSegment = {
  from: string;
  fromAirport: string;
  fromCode: string;
  to: string;
  toAirport: string;
  toCode: string;
  dep: string;
  arr: string;
  duration: number;
  airline: string;
};

export type LayoverNote = { text: string; kind: 'danger' | 'warning' | 'info' };

export type SeatsLeft = FlightDto['seatsLeft'];
