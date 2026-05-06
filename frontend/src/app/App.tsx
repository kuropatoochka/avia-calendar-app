import { ConfigProvider } from 'antd';
import { StrictMode } from 'react';
import { RouterProvider } from 'react-router';
import { LaunchExperimentProvider } from '@/features/launch-experiment';
import { router } from './config/router';
import './styles';

export const App = () => {
  return (
    <StrictMode>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#40a9ff',
            fontFamily: 'Inter, Arial, sans-serif',
          },
        }}
      >
        <LaunchExperimentProvider>
          <RouterProvider router={router} />
        </LaunchExperimentProvider>
      </ConfigProvider>
    </StrictMode>
  );
};
