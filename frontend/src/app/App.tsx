import { RouterProvider } from 'react-router';
import { router } from './config/router';
import { StrictMode } from 'react';
import './styles';

export const App = () => {
  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
};
