import { Layout, Menu, Spin, message } from 'antd';
import { useCallback } from 'react';
import { Link, useLocation } from 'react-router';
import { BookingAvatar } from '@/features/booking-flight';
import { SyncTicketPricesButton, useSyncTicketPrices } from '@/features/sync-ticket-prices';
import { Logo } from '@/shared/assets';
import { DATA_SOURCE, PAGES, PATHS } from '@/shared/consts';
import styles from './layout.module.css';

const IS_MOCK = DATA_SOURCE === 'mock';

type Props = {
  onSyncSuccess: () => void;
};

export const Header = ({ onSyncSuccess }: Props) => {
  const { pathname } = useLocation();
  const { syncTicketsPrices, isLoading } = useSyncTicketPrices();

  const handleSync = useCallback(async () => {
    try {
      const result = await syncTicketsPrices();
      if (!result) return;
      message.success('Цены обновлены');
      onSyncSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось обновить цены.';
      message.error(errorMessage);
    }
  }, [syncTicketsPrices, onSyncSuccess]);

  const items = PAGES.map(({ path, title }) => ({
    key: path,
    label: <Link to={path}>{title}</Link>,
  }));

  return (
    <>
      <Spin fullscreen spinning={isLoading} description="Обновляем цены..." />
      <Layout.Header className={styles.header}>
        <Link to={PATHS.offer} className={styles.logo}>
          <Logo />
        </Link>
        <Menu items={items} selectedKeys={[pathname]} mode="horizontal" className={styles.menu} />
        {!IS_MOCK && <SyncTicketPricesButton onSync={handleSync} isLoading={isLoading} />}
        <BookingAvatar />
      </Layout.Header>
    </>
  );
};
