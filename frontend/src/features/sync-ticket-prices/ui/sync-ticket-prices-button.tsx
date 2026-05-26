import { Button } from 'antd';
import { useCallback } from 'react';

type Props = {
  onSync: () => void | Promise<void>;
  isLoading: boolean;
};

export const SyncTicketPricesButton = ({ onSync, isLoading }: Props) => {
  const handleClick = useCallback(() => {
    void onSync();
  }, [onSync]);

  return (
    <Button onClick={handleClick} loading={isLoading} disabled={isLoading}>
      {isLoading ? 'Обновляем цены...' : 'Обновить цены'}
    </Button>
  );
};
