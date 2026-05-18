import { useEffect, useState } from 'react';
import { FlightService } from '@/shared/api';
import type { FlightDto, FlightsRequest, PriceDynamicsDto } from '@/shared/types';

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const useFlightResults = (params: FlightsRequest | null) => {
  const [flights, setFlights] = useState<FlightDto[]>([]);
  const [priceDynamics, setPriceDynamics] = useState<PriceDynamicsDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [flightsRes, priceDynamicsRes] = await Promise.all([
          FlightService.getFlights(params),
          FlightService.getPriceDynamics({
            originAirportId: params.originAirportId,
            destinationAirportId: params.destinationAirportId,
            dateFrom: addDays(params.date, -3),
            dateTo: addDays(params.date, 3),
            passengers: params.passengers,
            serviceClass: params.serviceClass,
          }),
        ]);

        if (!flightsRes.ok || !priceDynamicsRes.ok) {
          setError('Ошибка загрузки данных');
          return;
        }

        const [flightsData, priceDynamicsData] = await Promise.all([
          flightsRes.json() as Promise<FlightDto[]>,
          priceDynamicsRes.json() as Promise<PriceDynamicsDto[]>,
        ]);

        setFlights(flightsData);
        setPriceDynamics(priceDynamicsData);
      } catch {
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.originAirportId, params?.destinationAirportId, params?.date, params?.serviceClass]);

  const sortedFlights = [...flights].sort((a, b) => a.price - b.price);

  return { flights: sortedFlights, priceDynamics, loading, error };
};
