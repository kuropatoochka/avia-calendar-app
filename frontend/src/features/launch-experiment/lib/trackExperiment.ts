import type { GoalName } from '../consts/experimentGoals';
import type { ExperimentVariant } from '../lib/getExperimentVariant';
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
