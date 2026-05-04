import { useEffect, useState } from 'react';
import FlightService from '@/shared/api/FlightService';
import type { BestPricesDto, FlightDto, FlightsRequest } from '@/shared/types';

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const useFlightResults = (params: FlightsRequest | null) => {
  const [flights, setFlights] = useState<FlightDto[]>([]);
  const [bestPrices, setBestPrices] = useState<BestPricesDto>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [flightsRes, bestPricesRes] = await Promise.all([
          FlightService.getFlights(params),
          FlightService.getBestPrices({
            origin: params.origin,
            destination: params.destination,
            dateFrom: addDays(params.date, -3),
            dateTo: addDays(params.date, 3),
            passengers: params.passengers,
          }),
        ]);

        if (!flightsRes.ok || !bestPricesRes.ok) {
          setError('Ошибка загрузки данных');
          return;
        }

        const [flightsData, bestPricesData] = await Promise.all([
          flightsRes.json() as Promise<FlightDto[]>,
          bestPricesRes.json() as Promise<BestPricesDto>,
        ]);

        setFlights(flightsData);
        setBestPrices(bestPricesData);
      } catch {
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.origin, params?.destination, params?.date]);

  const sortedFlights = [...flights].sort((a, b) => a.price - b.price);

  return { flights: sortedFlights, bestPrices, loading, error };
};
