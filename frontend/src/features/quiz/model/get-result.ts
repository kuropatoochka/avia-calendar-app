import type { AnswerScores, DestinationKey } from './types';
import { DESTINATIONS } from './quiz-data';

export const getQuizResult = (answers: AnswerScores[]): DestinationKey => {
  const totals: Record<string, number> = {};

  for (const scores of answers) {
    for (const [key, value] of Object.entries(scores)) {
      totals[key] = (totals[key] ?? 0) + (value ?? 0);
    }
  }

  const winner = Object.entries(totals).sort(([, a], [, b]) => b - a)[0];

  if (!winner) {
    return 'sochi';
  }

  const key = winner[0] as DestinationKey;
  return key in DESTINATIONS ? key : 'sochi';
};

export const pickRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};
