import { useCallback } from 'react';
import { AirportService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';

export const useAirportsQuery = () => {
  const loadAirports = useCallback(async (search?: string) => {
    const data = await AirportService.getAirports({
      search: search?.trim(),
      offset: 0,
      limit: 20,
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
