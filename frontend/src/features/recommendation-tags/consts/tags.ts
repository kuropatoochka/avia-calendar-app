import type React from 'react';
import {
  HeartOutlined,
  MoonOutlined,
  SendOutlined,
  ShoppingOutlined,
  SunOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { FlightDto } from '@/shared/types/api';

export type TagId = 'baggage' | 'nonstop' | 'pets' | 'fast' | 'morning' | 'late' | 'group';

export type RecommendationTag = {
  id: TagId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  filter: (flight: FlightDto) => boolean;
};

const getDepartureHour = (departureTime: string) => Number(departureTime.split(':')[0]);

export const RECOMMENDATION_TAGS: RecommendationTag[] = [
  {
    id: 'baggage',
    label: 'С багажом',
    icon: ShoppingOutlined,
    filter: (flight) => flight.baggageIncluded,
  },
  {
    id: 'nonstop',
    label: 'Без пересадок',
    icon: SendOutlined,
    filter: (flight) => flight.stopsCount === 0,
  },
  {
    id: 'pets',
    label: 'С животным рядом',
    icon: HeartOutlined,
    filter: (flight) => flight.petsAllowed,
  },
  {
    id: 'fast',
    label: 'Быстрый перелёт',
    icon: ThunderboltOutlined,
    filter: (flight) => flight.duration < 180,
  },
  {
    id: 'morning',
    label: 'Утренний вылет',
    icon: SunOutlined,
    filter: (flight) => {
      const h = getDepartureHour(flight.departureTime);
      return h >= 6 && h < 18;
    },
  },
  {
    id: 'late',
    label: 'Поздний вылет',
    icon: MoonOutlined,
    filter: (flight) => {
      const h = getDepartureHour(flight.departureTime);
      return h >= 18 || h < 6;
    },
  },
  {
    id: 'group',
    label: 'Большая компания',
    icon: TeamOutlined,
    filter: (flight) => flight.availableSeats > 5,
  },
];
