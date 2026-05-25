import type { PriceDynamicsSearchParams } from './types';
import { useCallback, useState } from 'react';
import { FlightService } from '@/shared/api';
import type { PriceDynamicsRequest } from '@/shared/types';

type PriceDynamicsItem = {
  departure_date: string;
  min_total_price: number;
};

export const usePriceDynamicsQuery = () => {
  const [priceDynamics, setPriceDynamics] = useState<PriceDynamicsItem[]>([]);
  const [isPriceDynamicsLoading, setIsPriceDynamicsLoading] = useState(false);
  const [priceDynamicsError, setPriceDynamicsError] = useState('');

  const fetchPriceDynamics = useCallback(async (params: PriceDynamicsSearchParams) => {
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

    try {
      setIsPriceDynamicsLoading(true);
      setPriceDynamicsError('');
      setPriceDynamics([]);

      // TODO: Remove mock delay when real backend integration is ready.
      await new Promise((resolve) => {
        setTimeout(resolve, 1200);
      });

      const data = await FlightService.getPriceDynamics(requestParams);

      setPriceDynamics(data);

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить динамику цен';

      setPriceDynamicsError(message);
      setPriceDynamics([]);

      return null;
    } finally {
      setIsPriceDynamicsLoading(false);
    }
  }, []);

  const clearPriceDynamics = useCallback(() => {
    setPriceDynamics([]);
    setPriceDynamicsError('');
  }, []);

  return {
    priceDynamics,
    fetchPriceDynamics,
    clearPriceDynamics,
    isPriceDynamicsLoading,
    priceDynamicsError,
  };
};
