import type { ReactNode } from 'react';
import { getExperimentVariant } from '../lib/getExperimentVariant';
import { LaunchExperimentContext } from '../lib/useLaunchExperiment';

interface Props {
  children?: ReactNode;
}

export const LaunchExperimentProvider = ({ children }: Props) => {
  const variant = getExperimentVariant();

  return <LaunchExperimentContext value={variant}>{children}</LaunchExperimentContext>;
};
