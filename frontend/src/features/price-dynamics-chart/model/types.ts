import type { TripType } from '@/features/search-form';
import type { ServiceClass } from '@/shared/types';

export type PriceDynamicsSearchParams = {
  airportFromId: number;
  airportToId: number;
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
  airportFromId: number;
  airportToId: number;
  date: string;

  direction: PriceDynamicsDirection;
};

export type PriceDynamicsChartItem = {
  date: string;
  /** null means no flights are available on this date */
  minTotalPrice: number | null;
};
