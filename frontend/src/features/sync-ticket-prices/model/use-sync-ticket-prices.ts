import { useCallback, useRef, useState } from 'react';
import { AnalyticsService } from '@/shared/api';

type SyncTicketsParams = {
  date?: string;
};

export const useSyncTicketPrices = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestInProgressRef = useRef(false);

  const syncTicketsPrices = useCallback(async (params: SyncTicketsParams = {}) => {
    if (requestInProgressRef.current) {
      return null;
    }

    requestInProgressRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      return await AnalyticsService.syncTicketsPrices(params);
    } catch (err) {
      const normalizedError = err instanceof Error ? err : new Error('Не удалось обновить цены.');

      setError(normalizedError);
      throw normalizedError;
    } finally {
      requestInProgressRef.current = false;
      setIsLoading(false);
    }
  }, []);

  return {
    syncTicketsPrices,
    isLoading,
    error,
  };
};
