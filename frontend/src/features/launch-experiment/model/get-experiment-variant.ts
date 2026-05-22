export type ExperimentVariant = 'A' | 'B';

const EXPERIMENT_STORAGE_KEY = 'experiment_variant';

export function getExperimentVariant(): ExperimentVariant {
  const savedVariant = localStorage.getItem(EXPERIMENT_STORAGE_KEY);

  if (savedVariant === 'A' || savedVariant === 'B') {
    return savedVariant;
  }

  const variant = Math.random() < 0.5 ? 'A' : 'B';

  localStorage.setItem(EXPERIMENT_STORAGE_KEY, variant);

  return variant;
}
