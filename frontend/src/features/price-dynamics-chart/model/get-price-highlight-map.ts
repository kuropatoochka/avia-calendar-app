import type { PriceDynamicsChartItem } from './types';

type PriceHighlight = 'best' | 'recommended';

type PriceHighlightMap = Partial<Record<string, PriceHighlight>>;

const BEST_PRICES_COUNT = 3;

export const getPriceHighlightMap = (
  items: PriceDynamicsChartItem[],
  enabled: boolean,
): PriceHighlightMap => {
  if (!enabled) {
    return {};
  }

  const availableItems = [...items]
    .filter((item) => item.minTotalPrice > 0)
    .sort((a, b) => a.minTotalPrice - b.minTotalPrice)
    .slice(0, BEST_PRICES_COUNT);

  return availableItems.reduce<PriceHighlightMap>((acc, item, index) => {
    acc[item.date] = index === 0 ? 'best' : 'recommended';

    return acc;
  }, {});
};
