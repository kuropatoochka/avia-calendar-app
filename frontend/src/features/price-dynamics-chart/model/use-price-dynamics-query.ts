import type { PriceDynamicsSearchParams } from './types';
import { useCallback } from 'react';
import { FlightService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';
import type { PriceDynamicsRequest } from '@/shared/types';

export const usePriceDynamicsQuery = () => {
  const loadPriceDynamics = useCallback(async (params: PriceDynamicsSearchParams) => {
    const requestParams: PriceDynamicsRequest = {
      airport_from: params.airportFromId,
      airport_to: params.airportToId,
      from_date: params.dateFrom,
      to_date: params.dateTo,
      service_class: params.serviceClass,
      passengers_number: params.passengersNumber,
      children_number: params.childrenNumber,
      toddlers_number: params.toddlersNumber,
    };

    // TODO: Remove mock delay when real backend integration is ready.
    await new Promise((resolve) => {
      setTimeout(resolve, 1200);
    });

    const data = await FlightService.getPriceDynamics(requestParams);

    return data;
  }, []);

  const [fetchPriceDynamics, isPriceDynamicsLoading, priceDynamicsError] =
    useFetch(loadPriceDynamics);

  return {
    fetchPriceDynamics,
    isPriceDynamicsLoading,
    priceDynamicsError,
  };
};
