import { LaunchExperimentProvider } from '@/features/launch-experiment';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { StrictMode } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './config/router';
import './styles';
import { antdTheme } from './styles/antd-theme';

dayjs.locale('ru');

export const App = () => {
  return (
    <StrictMode>
      <ConfigProvider theme={antdTheme} locale={ruRU}>
        <LaunchExperimentProvider>
          <RouterProvider router={router} />
        </LaunchExperimentProvider>
      </ConfigProvider>
    </StrictMode>
  );
};
