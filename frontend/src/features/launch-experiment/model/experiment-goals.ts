export const Goal = {
  TestButtonClick: 'TEST_BUTTON_CLICK',
} as const;

export type GoalName = (typeof Goal)[keyof typeof Goal];
