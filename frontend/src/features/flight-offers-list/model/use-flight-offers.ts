import type { FlightOffer } from './types';
import { useCallback, useState } from 'react';
import { FlightService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';
import type { FlightsRequest } from '@/shared/types';

export const useFlightOffers = () => {
  const [offers, setOffers] = useState<FlightOffer[]>([]);

  const loadOffers = useCallback(async (params: FlightsRequest) => {
    const response = await FlightService.getFlights(params);

    if (!response.ok) {
      throw new Error('Не удалось загрузить предложения');
    }

    const data: FlightOffer[] = await response.json();

    setOffers(data);

    return data;
  }, []);

  const [fetchOffers, isOffersLoading, offersError] = useFetch(loadOffers);

  const resetOffers = useCallback(() => {
    setOffers([]);
  }, []);

  return {
    offers,
    fetchOffers,
    isOffersLoading,
    offersError,
    resetOffers,
  };
};
