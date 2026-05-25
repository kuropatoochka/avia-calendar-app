import type { GoalName } from './experiment-consts';
import type { ExperimentVariant } from './get-experiment-variant';
import { reachGoal } from '@/shared/utils';

type MetrikaParams = Record<string, string | number | boolean | null | undefined>;

type TrackExperimentParams = {
  goal: GoalName;
  experiment: string;
  variant: ExperimentVariant;
  params?: MetrikaParams;
};

export function trackExperimentEvent({ goal, experiment, variant, params }: TrackExperimentParams) {
  reachGoal(goal, {
    experiment,
    variant,
    ...params,
  });
}
