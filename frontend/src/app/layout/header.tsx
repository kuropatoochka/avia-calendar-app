import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router';
import { BookingAvatar } from '@/features/booking-flight';
import { Logo } from '@/shared/assets';
import { PAGES, PATHS } from '@/shared/consts';
import styles from './layout.module.css';

export const Header = () => {
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
      <BookingAvatar />
    </Layout.Header>
  );
};
