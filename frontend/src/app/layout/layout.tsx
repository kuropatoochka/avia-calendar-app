import { Layout as AntLayout, Skeleton } from 'antd';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router';
import { Header } from './header';

export type LayoutOutletContext = {
  pricesSyncVersion: number;
};

export const Layout = () => {
  const [pricesSyncVersion, setPricesSyncVersion] = useState(0);

  return (
    <AntLayout>
      <Header onSyncSuccess={() => setPricesSyncVersion((v) => v + 1)} />
      <AntLayout.Content>
        <Suspense fallback={<Skeleton />}>
          <Outlet context={{ pricesSyncVersion }} />
        </Suspense>
      </AntLayout.Content>
    </AntLayout>
  );
};
