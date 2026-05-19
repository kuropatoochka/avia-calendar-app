import { useCallback } from 'react';
import { AirportService } from '@/shared/api';
import { useFetch } from '@/shared/hooks';

export const useAirportsQuery = () => {
  const loadAirports = useCallback(async (search?: string) => {
    const response = await AirportService.getAirports(search?.trim());
    return response.json();
  }, []);

  const [fetchAirports, isAirportsLoading, airportsError] = useFetch(loadAirports);

  return {
    fetchAirports,
    isAirportsLoading,
    airportsError,
  };
};
