import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router';
import { BookingAvatar } from '@/features/booking-flight';
import { SyncTicketPricesButton } from '@/features/sync-ticket-prices';
import { Logo } from '@/shared/assets';
import { PAGES, PATHS } from '@/shared/consts';
import styles from './layout.module.css';

type Props = {
  onSyncTicketPrices: () => void | Promise<void>;
  isSyncing: boolean;
};

export const Header = ({ onSyncTicketPrices, isSyncing }: Props) => {
  const { pathname } = useLocation();

  const items = PAGES.map(({ path, title }) => {
    return {
      key: path,
      label: <Link to={path}>{title}</Link>,
    };
  });

  return (
    <Layout.Header className={styles.header}>
      <Link to={PATHS.offer} className={styles.logo}>
        <Logo />
      </Link>
      <Menu items={items} selectedKeys={[pathname]} mode="horizontal" className={styles.menu} />
      <SyncTicketPricesButton onSync={onSyncTicketPrices} isLoading={isSyncing} />
      <BookingAvatar />
    </Layout.Header>
  );
};
