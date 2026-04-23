import { createBrowserRouter, type RouteObject } from 'react-router';
import { Layout } from '../layout/Layout';

const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
  },
];

export const router = createBrowserRouter(routes);
