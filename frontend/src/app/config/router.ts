import type { RouteObject } from 'react-router';
import { createBrowserRouter, replace } from 'react-router';
import { LazyOfferPage } from '@/pages/OfferPage';
import { PATHS } from '@/shared/consts';
import { BaseLayout } from '../layout/BaseLayout';

const routes: RouteObject[] = [
  {
    path: PATHS.base,
    Component: BaseLayout,
    children: [
      {
        index: true,
        loader: () => replace(PATHS.offer),
      },
      {
        path: PATHS.offer,
        Component: LazyOfferPage,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
