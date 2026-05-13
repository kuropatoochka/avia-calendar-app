import { FlightService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';
import type { PriceDynamicsDto, PriceDynamicsRequest } from '@/shared/types';
import { useCallback, useState } from 'react';

export const usePriceDynamics = () => {
  const [priceDynamics, setPriceDynamics] = useState<PriceDynamicsDto[]>([]);

  const loadPriceDynamics = useCallback(async (params: PriceDynamicsRequest) => {
    // TODO: Remove mock delay when real backend integration is ready.
    await new Promise((resolve) => {
      setTimeout(resolve, 1200);
    });

    const response = await FlightService.getPriceDynamics(params);

    if (!response.ok) {
      throw new Error('Не удалось загрузить динамику цен');
    }

    const data: PriceDynamicsDto[] = await response.json();

    setPriceDynamics(data);

    return data;
  }, []);

  const [fetchPriceDynamics, isPriceDynamicsLoading, priceDynamicsError] =
    useFetch(loadPriceDynamics);

  return {
    priceDynamics,
    fetchPriceDynamics,
    isPriceDynamicsLoading,
    priceDynamicsError,
  };
};
