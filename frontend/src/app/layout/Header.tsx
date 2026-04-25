import { Layout, Menu } from 'antd';
import styles from './styles.module.css';
import { PAGES, PATHS } from '@/shared/consts';
import { Link, useLocation } from 'react-router';
import { Logo } from '@/shared/assets';

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
      <Link to={PATHS.base} className={styles.logo}>
        <Logo />
      </Link>
      <Menu items={items} selectedKeys={[pathname]} className={styles.menu} mode="horizontal" />
    </Layout.Header>
  );
};
