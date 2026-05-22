export const Goal = {
  TestButtonClick: 'TEST_BUTTON_CLICK',
  PriceDynamicsView: 'PRICE_DYNAMICS_VIEW',
  PriceDynamicsBarClick: 'PRICE_DYNAMICS_BAR_CLICK',
} as const;

export type GoalName = (typeof Goal)[keyof typeof Goal];

export const Experiment = {
  PriceDynamicsBestDates: 'price_dynamics_best_dates',
  RecommendationTags: 'recommendation_tags',
} as const;
