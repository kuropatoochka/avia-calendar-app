import { Button, message } from 'antd';
import { useCallback } from 'react';
import { useSyncTicketPrices } from '../model/use-sync-ticket-prices';

export const SyncTicketPricesButton = () => {
  const { syncTicketsPrices, isLoading } = useSyncTicketPrices();

  const handleClick = useCallback(async () => {
    try {
      const result = await syncTicketsPrices();

      if (!result) {
        return;
      }

      message.success('Цены обновлены');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось обновить цены.';

      message.error(errorMessage);
    }
  }, [syncTicketsPrices]);

  return (
    <Button onClick={handleClick} loading={isLoading} disabled={isLoading}>
      {isLoading ? 'Обновляем цены...' : 'Обновить цены'}
    </Button>
  );
};
