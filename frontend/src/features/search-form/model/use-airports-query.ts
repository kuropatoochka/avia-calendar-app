import { useCallback } from 'react';
import { AirportService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';

const DEFAULT_AIRPORTS_LIMIT = 20;
const MAX_AIRPORTS_LIMIT = 500;

const getAirportsLimit = (ids?: number[]) => {
  if (!ids?.length) {
    return DEFAULT_AIRPORTS_LIMIT;
  }

  return Math.min(ids.length, MAX_AIRPORTS_LIMIT);
};

export const useAirportsQuery = () => {
  const loadAirports = useCallback(async (search?: string, ids?: number[]) => {
    const data = await AirportService.getAirports({
      search: search?.trim() || undefined,
      offset: 0,
      limit: getAirportsLimit(ids),
      ids,
    });

    return data.items;
  }, []);

  const [fetchAirports, isAirportsLoading, airportsError] = useFetch(loadAirports);

  return {
    fetchAirports,
    isAirportsLoading,
    airportsError,
  };
};
