import type { ExperimentVariant } from '../lib/getExperimentVariant';
import { createContext, useContext } from 'react';

type LaunchExperimentContextType = ExperimentVariant | null;

export const LaunchExperimentContext = createContext<LaunchExperimentContextType>(null);

export const useLaunchExperiment = () => {
  const context = useContext(LaunchExperimentContext);

  if (context === null) {
    throw new Error('Контекст для проведения эксперимента не установлен');
  }

  return context;
};
