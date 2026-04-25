import { Layout, Skeleton } from 'antd';
import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { Header } from './Header';

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
