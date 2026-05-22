import type { RouteObject } from 'react-router';
import { createBrowserRouter, replace } from 'react-router';
import { LazyOfferPage } from '@/pages/offer';
import { LazySearchPage } from '@/pages/search';
import { PATHS } from '@/shared/consts';
import { Layout } from '../layout/layout';

const routes: RouteObject[] = [
  {
    path: PATHS.base,
    Component: Layout,
    children: [
      {
        index: true,
        loader: () => replace(PATHS.offer),
      },
      {
        path: PATHS.offer,
        Component: LazyOfferPage,
      },
      {
        path: PATHS.search,
        Component: LazySearchPage,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
