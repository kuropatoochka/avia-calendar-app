import { createBrowserRouter, type RouteObject } from 'react-router';
import { BaseLayout } from '../layout/BaseLayout';
import { PATHS } from '@/shared/consts';

const routes: RouteObject[] = [
  {
    path: PATHS.base,
    Component: BaseLayout,
    children: [
      {
        path: PATHS.hotTickets,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
