import { Layout as AntLayout, Skeleton } from 'antd';
import { Suspense } from 'react';
import { Outlet } from 'react-router';

export const Layout = () => {
  return (
    <AntLayout>
      <AntLayout.Content>
        <Suspense fallback={<Skeleton />}>
          <Outlet />
        </Suspense>
      </AntLayout.Content>
    </AntLayout>
  );
};
