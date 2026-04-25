import { Layout, Skeleton } from 'antd';
import { Header } from './Header';
import { Suspense } from 'react';
import { Outlet } from 'react-router';

export const BaseLayout = () => {
  return (
    <Layout>
      <Header />
      <Layout.Content>
        <Suspense fallback={<Skeleton />}>
          <Outlet />
        </Suspense>
      </Layout.Content>
    </Layout>
  );
};
