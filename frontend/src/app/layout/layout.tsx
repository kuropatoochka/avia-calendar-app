import { Layout as AntLayout, Skeleton, Spin, message } from 'antd';
import { Suspense, useCallback, useState } from 'react';
import { Outlet } from 'react-router';
import { useSyncTicketPrices } from '@/features/sync-ticket-prices';
import { Header } from './header';

export type LayoutOutletContext = {
  pricesSyncVersion: number;
};

export const Layout = () => {
  const [pricesSyncVersion, setPricesSyncVersion] = useState(0);
  const { syncTicketsPrices, isLoading } = useSyncTicketPrices();

  const handleSyncTicketPrices = useCallback(async () => {
    try {
      const result = await syncTicketsPrices();

      if (!result) {
        return;
      }

      message.success('Цены обновлены');
      setPricesSyncVersion((version) => version + 1);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось обновить цены.';

      message.error(errorMessage);
    }
  }, [syncTicketsPrices]);

  return (
    <AntLayout>
      <Spin fullscreen spinning={isLoading} description="Обновляем цены..." />
      <Header onSyncTicketPrices={handleSyncTicketPrices} isSyncing={isLoading} />
      <AntLayout.Content>
        <Suspense fallback={<Skeleton />}>
          <Outlet context={{ pricesSyncVersion }} />
        </Suspense>
      </AntLayout.Content>
    </AntLayout>
  );
};
