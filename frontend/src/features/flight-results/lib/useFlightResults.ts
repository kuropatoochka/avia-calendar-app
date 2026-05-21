import { useEffect, useState } from 'react';
import type { FlightDto, FlightsRequest } from '@/shared/types';

export const useFlightResults = (params: FlightsRequest | null) => {
  const [flights, setFlights] = useState<FlightDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          originAirportId: params.originAirportId,
          destinationAirportId: params.destinationAirportId,
          date: params.date,
          serviceClass: params.serviceClass,
        });
        const response = await fetch(`/api/flights?${searchParams.toString()}`);

        if (!response.ok) {
          setError('Ошибка загрузки данных');
          return;
        }

        const data = (await response.json()) as FlightDto[];
        setFlights(data);
      } catch {
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.originAirportId, params?.destinationAirportId, params?.date, params?.serviceClass]);

  const sortedFlights = [...flights].sort((a, b) => a.price - b.price);

  return { flights: sortedFlights, loading, error };
};
