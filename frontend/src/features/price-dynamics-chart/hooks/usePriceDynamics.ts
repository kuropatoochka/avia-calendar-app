import { useCallback, useState } from 'react';
import { FlightService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';
import type { PriceDynamicsDto, PriceDynamicsRequest } from '@/shared/types';

export const usePriceDynamics = () => {
  const [priceDynamics, setPriceDynamics] = useState<PriceDynamicsDto[]>([]);

  const loadPriceDynamics = useCallback(async (params: PriceDynamicsRequest) => {
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
