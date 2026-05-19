import { useCallback } from 'react';
import { AirportService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';

export const useAirportsQuery = () => {
  const loadAirports = useCallback(async (search?: string, ids?: string[]) => {
    const shouldPaginate = !ids?.length;
    const data = await AirportService.getAirports({
      search: search?.trim(),
      offset: shouldPaginate ? 0 : undefined,
      limit: shouldPaginate ? 20 : undefined,
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
