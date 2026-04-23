import { RouterProvider } from 'react-router';
import { router } from './config/router';
import { StrictMode } from 'react';

export const App = () => {
  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
};
