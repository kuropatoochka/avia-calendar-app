import type React from 'react';
import {
  ClockIcon,
  GroupIcon,
  LuggageIcon,
  MoonIcon,
  PawIcon,
  PlaneIcon,
  SunIcon,
} from '@/shared/assets';
import type { FlightDto } from '@/shared/types/api';

export type TagId = 'baggage' | 'nonstop' | 'pets' | 'fast' | 'morning' | 'late' | 'group';

export type RecommendationTag = {
  id: TagId;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  filter: (flight: FlightDto) => boolean;
};

const getDepartureHour = (departureTime: string) =>
  Number(departureTime.split(':')[0]);

export const RECOMMENDATION_TAGS: RecommendationTag[] = [
  {
    id: 'baggage',
    label: 'С багажом',
    icon: LuggageIcon,
    filter: (flight) => flight.baggageIncluded,
  },
  {
    id: 'nonstop',
    label: 'Без пересадок',
    icon: PlaneIcon,
    filter: (flight) => flight.stopsCount === 0,
  },
  {
    id: 'pets',
    label: 'С животным рядом',
    icon: PawIcon,
    filter: (flight) => flight.petsAllowed,
  },
  {
    id: 'fast',
    label: 'Быстрый перелёт',
    icon: ClockIcon,
    filter: (flight) => flight.duration <= 120,
  },
  {
    id: 'morning',
    label: 'Утренний вылет',
    icon: SunIcon,
    filter: (flight) => {
      const h = getDepartureHour(flight.departureTime);
      return h >= 6 && h < 12;
    },
  },
  {
    id: 'late',
    label: 'Поздний вылет',
    icon: MoonIcon,
    filter: (flight) => {
      const h = getDepartureHour(flight.departureTime);
      return h >= 18;
    },
  },
  {
    id: 'group',
    label: 'Большая компания',
    icon: GroupIcon,
    filter: (flight) => flight.groupFriendly,
  },
];
