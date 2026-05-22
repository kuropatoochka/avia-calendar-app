import type { RouteObject } from 'react-router';
import { createBrowserRouter } from 'react-router';
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
        Component: LazyOfferPage,
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
