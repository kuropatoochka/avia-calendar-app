import type { GoalName } from './experiment-goals';
import type { ExperimentVariant } from './get-experiment-variant';
import { reachGoal } from '@/shared/utils';

type TrackExperimentParams = {
  goal: GoalName;
  experiment: string;
  variant: ExperimentVariant;
  payload?: Record<string, string | number | boolean | null | undefined>;
};

export function trackExperimentEvent({
  goal,
  experiment,
  variant,
  payload,
}: TrackExperimentParams) {
  reachGoal(goal, {
    experiment,
    variant,
    ...payload,
  });
}
