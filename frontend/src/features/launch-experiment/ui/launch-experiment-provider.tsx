import type { ReactNode } from 'react';
import { getExperimentVariant } from '../model/get-experiment-variant';
import { LaunchExperimentContext } from '../model/use-launch-experiment';

interface Props {
  children?: ReactNode;
}

export const LaunchExperimentProvider = ({ children }: Props) => {
  const variant = getExperimentVariant();

  return <LaunchExperimentContext value={variant}>{children}</LaunchExperimentContext>;
};
