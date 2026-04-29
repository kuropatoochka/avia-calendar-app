import { StrictMode } from 'react';
import { RouterProvider } from 'react-router';
import { LaunchExperimentProvider } from '@/features/launch-experiment';
import { router } from './config/router';
import './styles';

export const App = () => {
  return (
    <StrictMode>
      <LaunchExperimentProvider>
        <RouterProvider router={router} />
      </LaunchExperimentProvider>
    </StrictMode>
  );
};
