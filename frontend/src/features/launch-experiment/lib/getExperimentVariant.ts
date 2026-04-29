import { DATA_SOURCE } from '@/shared/consts';

export type ExperimentVariant = 'A' | 'B';

const EXPERIMENT_STORAGE_KEY = 'experiment_variant';

export function getExperimentVariant(): ExperimentVariant {
  if (DATA_SOURCE === 'api') {
    return 'B';
  }

  const savedVariant = localStorage.getItem(EXPERIMENT_STORAGE_KEY);

  if (savedVariant === 'A' || savedVariant === 'B') {
    return savedVariant;
  }

  const variant = Math.random() < 0.3 ? 'A' : 'B';

  localStorage.setItem(EXPERIMENT_STORAGE_KEY, variant);

  return variant;
}
