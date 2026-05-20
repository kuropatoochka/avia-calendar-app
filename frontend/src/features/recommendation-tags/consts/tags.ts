import { HeartFilled, MoonFilled, SunFilled } from '@ant-design/icons';
import React from 'react';
import type { FlightDto } from '@/shared/types/api';

export type TagId = 'baggage' | 'nonstop' | 'pets' | 'fast' | 'morning' | 'late' | 'group';

export type RecommendationTag = {
  id: TagId;
  label: string;
  icon?: React.ReactElement;
  iconColor?: string;
  filter: (flight: FlightDto) => boolean;
};

const getDepartureHour = (departureTime: string) => Number(departureTime.split(':')[0]);

export const RECOMMENDATION_TAGS: RecommendationTag[] = [
  {
    id: 'baggage',
    label: 'С багажом',

    filter: (flight) => flight.baggageIncluded,
  },
  {
    id: 'nonstop',
    label: 'Без пересадок',
    filter: (flight) => flight.stopsCount === 0,
  },
  {
    id: 'pets',
    label: 'С животным рядом',
    icon: React.createElement(HeartFilled, { style: { color: '#FF6B4A' } }),
    filter: (flight) => flight.petsAllowed,
  },

  {
    id: 'morning',
    label: 'Утренний вылет',
    icon: React.createElement(SunFilled, { style: { color: '#F2B705' } }),
    filter: (flight) => {
      const h = getDepartureHour(flight.departureTime);
      return h >= 6 && h < 18;
    },
  },
  {
    id: 'late',
    label: 'Поздний вылет',
    icon: React.createElement(MoonFilled, { style: { color: '#516FD4' } }),
    filter: (flight) => {
      const h = getDepartureHour(flight.departureTime);
      return h >= 18 || h < 6;
    },
  },
];
