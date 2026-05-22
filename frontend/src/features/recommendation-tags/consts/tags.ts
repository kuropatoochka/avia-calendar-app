import { MoonFilled, SunFilled } from '@ant-design/icons';
import { Avatar } from 'antd';
import React from 'react';
import { BriefcaseFill, ThunderboltFill } from '@/shared/assets';
import { aeroflotLogo } from '@/shared/assets/airlines';
import type { TicketFiltersRequest } from '@/shared/types';

export type DestinationTagId = 'has_sea' | 'has_warm' | 'has_nature';
export type DepartureTimeTagId = 'morning_departure' | 'night_departure';
export type StopsTagId = 'direct_flight';
export type BaggageTagId = 'baggage_included';
export type PriceTagId = 'price_up_to_5000';
export type AirlineTagId = 'airline_aeroflot';

export type TagId =
  | DestinationTagId
  | DepartureTimeTagId
  | StopsTagId
  | BaggageTagId
  | PriceTagId
  | AirlineTagId;

type BaseRecommendationTag = {
  id: TagId;
  label: string;
  icon?: React.ReactElement;
};

type DestinationRecommendationTag = BaseRecommendationTag & {
  id: DestinationTagId;
  type: 'destination';
  requestParam: keyof Pick<TicketFiltersRequest, 'has_sea' | 'has_warm' | 'has_nature'>;
};

type DepartureTimeRecommendationTag = BaseRecommendationTag & {
  id: DepartureTimeTagId;
  type: 'departureTime';
  departureTime: 'morning' | 'night';
  exclusiveGroup: 'departureTime';
};

type StopsRecommendationTag = BaseRecommendationTag & {
  id: StopsTagId;
  type: 'stops';
};

type BaggageRecommendationTag = BaseRecommendationTag & {
  id: BaggageTagId;
  type: 'baggage';
};

type PriceRecommendationTag = BaseRecommendationTag & {
  id: PriceTagId;
  type: 'price';
  maxPrice: number;
};

type AirlineRecommendationTag = BaseRecommendationTag & {
  id: AirlineTagId;
  type: 'airline';
  companyName: string;
};

export type RecommendationTag =
  | DestinationRecommendationTag
  | DepartureTimeRecommendationTag
  | StopsRecommendationTag
  | BaggageRecommendationTag
  | PriceRecommendationTag
  | AirlineRecommendationTag;

export const RECOMMENDATION_TAGS: RecommendationTag[] = [
  {
    id: 'direct_flight',
    type: 'stops',
    label: 'Прямой рейс',
    icon: React.createElement(ThunderboltFill, { style: { color: '#FF6B4A' } }),
  },
  {
    id: 'baggage_included',
    type: 'baggage',
    label: 'С багажом',
    icon: React.createElement(BriefcaseFill, { style: { color: '#4FAF9A' } }),
  },
  {
    id: 'price_up_to_5000',
    type: 'price',
    label: 'до 5 000 ₽',
    maxPrice: 5_000,
  },
  {
    id: 'airline_aeroflot',
    type: 'airline',
    label: 'Аэрофлот',
    companyName: 'Аэрофлот',
    icon: React.createElement(Avatar, {
      size: 16,
      src: aeroflotLogo,
      alt: 'Аэрофлот',
    }),
  },

  {
    id: 'morning_departure',
    type: 'departureTime',
    label: 'Утренний вылет',
    icon: React.createElement(SunFilled, { style: { color: '#F2B705' } }),
    departureTime: 'morning',
    exclusiveGroup: 'departureTime',
  },
  {
    id: 'night_departure',
    type: 'departureTime',
    label: 'Ночной вылет',
    icon: React.createElement(MoonFilled, { style: { color: '#516FD4' } }),
    departureTime: 'night',
    exclusiveGroup: 'departureTime',
  },

  // {
  //   id: 'has_sea',
  //   type: 'destination',
  //   label: 'Море и пляж',
  //   requestParam: 'has_sea',
  // },
  // {
  //   id: 'has_warm',
  //   type: 'destination',
  //   label: 'Тепло',
  //   icon: React.createElement(FireFilled, { style: { color: '#FF6B4A' } }),
  //   requestParam: 'has_warm',
  // },
  // {
  //   id: 'has_nature',
  //   type: 'destination',
  //   label: 'Природа',
  //   icon: React.createElement(EnvironmentFilled, { style: { color: '#4DAA57' } }),
  //   requestParam: 'has_nature',
  // },
];
