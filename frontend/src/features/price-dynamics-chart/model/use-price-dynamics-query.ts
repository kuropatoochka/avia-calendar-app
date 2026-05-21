import type { PriceDynamicsSearchParams } from './types';
import { useCallback } from 'react';
import { FlightService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';
import type { PriceDynamicsRequest } from '@/shared/types';

export const usePriceDynamicsQuery = () => {
  const loadPriceDynamics = useCallback(async (params: PriceDynamicsSearchParams) => {
    const requestParams: PriceDynamicsRequest = {
      originAirportId: String(params.airportFromId),
      destinationAirportId: String(params.airportToId),
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      serviceClass: params.serviceClass,
      passengers: {
        adults: params.passengersNumber,
        children: params.childrenNumber ?? 0,
        toddler: params.toddlersNumber ?? 0,
        animals: 0,
      },
    };

    // TODO: Remove mock delay when real backend integration is ready.
    await new Promise((resolve) => {
      setTimeout(resolve, 1200);
    });

    const response = await FlightService.getPriceDynamics(requestParams);

    return response.json() as Promise<{ departure_date: string; min_total_price: number }[]>;
  }, []);

  const [fetchPriceDynamics, isPriceDynamicsLoading, priceDynamicsError] =
    useFetch(loadPriceDynamics);

  return {
    fetchPriceDynamics,
    isPriceDynamicsLoading,
    priceDynamicsError,
  };
};
