import { createBrowserRouter, replace, type RouteObject } from 'react-router';
import { BaseLayout } from '../layout/BaseLayout';
import { PATHS } from '@/shared/consts';
import { LazyHotTickets } from '@/pages/OfferPage';

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
        Component: LazyHotTickets,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
