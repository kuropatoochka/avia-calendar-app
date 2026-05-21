import type { TripType } from '@/features/search-form';
import type { ServiceClass } from '@/shared/types';

export type PriceDynamicsSearchParams = {
  airportFromId: string;
  airportToId: string;
  dateFrom: string;
  dateTo: string;
  tripType: TripType;
  serviceClass: ServiceClass;
  passengersNumber: number;
  childrenNumber?: number;
  toddlersNumber?: number;
};

export type PriceDynamicsDirection = 'outbound' | 'inbound';

export type PriceDynamicsSelection = {
  airportFromId: string;
  airportToId: string;
  date: string;
  direction: PriceDynamicsDirection;
};

export type PriceDynamicsChartItem = {
  date: string;
  minTotalPrice: number;
};
