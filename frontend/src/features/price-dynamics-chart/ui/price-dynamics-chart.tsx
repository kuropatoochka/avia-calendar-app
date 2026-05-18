import type { PriceDynamicsChartItem } from '../model/types';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/utils';
import {
  BAR_BASE_Y,
  BAR_GAP,
  BAR_WIDTH,
  CHART_HEIGHT,
  DATE_LABEL_Y,
  DISABLED_BAR_HEIGHT,
  MAX_PRICE_BAR_HEIGHT,
  MAX_VISIBLE_PRICE_DIFF_PERCENT,
  MIN_PRICE_BAR_HEIGHT,
  PRICE_LABEL_Y,
} from '../model/consts';
import { getPriceHighlightMap } from '../model/get-price-highlight-map';
import { priceFormatter } from '../model/price-formatter';
import styles from './price-dynamics.module.css';

type RenderChartItem =
  | {
      type: 'active';
      item: PriceDynamicsChartItem;
    }
  | {
      type: 'disabled';
      date: string;
    };

const formatDateLabel = (date: string) => {
  return dayjs(date).format('DD.MM');
};

const getChartWidth = (itemsCount: number) => {
  if (!itemsCount) {
    return 0;
  }

  return itemsCount * BAR_WIDTH + (itemsCount - 1) * BAR_GAP;
};

const getBarHeight = (price: number, minPrice: number) => {
  if (price <= 0 || minPrice <= 0) {
    return DISABLED_BAR_HEIGHT;
  }

  const priceDiffPercent = (price - minPrice) / minPrice;
  const clampedDiffPercent = Math.min(
    Math.max(priceDiffPercent, 0),
    MAX_VISIBLE_PRICE_DIFF_PERCENT,
  );

  const visualRatio = clampedDiffPercent / MAX_VISIBLE_PRICE_DIFF_PERCENT;

  const height = MIN_PRICE_BAR_HEIGHT + visualRatio * (MAX_PRICE_BAR_HEIGHT - MIN_PRICE_BAR_HEIGHT);

  return Math.round(height);
};

const getDisabledBarsCount = (itemsCount: number, containerWidth: number) => {
  if (!itemsCount || !containerWidth) {
    return 0;
  }

  const chartWidth = getChartWidth(itemsCount);

  if (chartWidth >= containerWidth) {
    return 0;
  }

  const emptyWidth = containerWidth - chartWidth;

  return Math.floor((emptyWidth + BAR_GAP) / (BAR_WIDTH + BAR_GAP));
};

const getRenderItems = (
  items: PriceDynamicsChartItem[],
  containerWidth: number,
): RenderChartItem[] => {
  const disabledBarsCount = getDisabledBarsCount(items.length, containerWidth);
  const lastDate = items.at(-1)?.date;

  const activeItems: RenderChartItem[] = items.map((item) => ({
    type: 'active',
    item,
  }));

  if (!lastDate || disabledBarsCount === 0) {
    return activeItems;
  }

  const disabledItems: RenderChartItem[] = Array.from(
    { length: disabledBarsCount },
    (_, index) => ({
      type: 'disabled',
      date: dayjs(lastDate)
        .add(index + 1, 'day')
        .format('YYYY-MM-DD'),
    }),
  );

  return [...activeItems, ...disabledItems];
};

interface Props {
  items: PriceDynamicsChartItem[];
  selectedItem: PriceDynamicsChartItem | null;
  onSelect: (item: PriceDynamicsChartItem) => void;
  highlightBestPrices?: boolean;
}

export const PriceDynamicsChart = ({
  items,
  selectedItem,
  highlightBestPrices = false,
  onSelect,
}: Props) => {
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!items.length || !chartScrollRef.current) {
      return;
    }

    const element = chartScrollRef.current;

    const updateWidth = () => {
      setContainerWidth(element.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [items.length]);

  const renderItems = useMemo(() => {
    return getRenderItems(items, containerWidth);
  }, [items, containerWidth]);

  const priceHighlightMap = useMemo(() => {
    return getPriceHighlightMap(items, highlightBestPrices);
  }, [items, highlightBestPrices]);

  const priceRange = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        if (item.minTotalPrice <= 0) {
          return acc;
        }

        return {
          minPrice: Math.min(acc.minPrice, item.minTotalPrice),
          maxPrice: Math.max(acc.maxPrice, item.minTotalPrice),
        };
      },
      {
        minPrice: Infinity,
        maxPrice: 0,
      },
    );
  }, [items]);

  const minPrice = priceRange.minPrice === Infinity ? 0 : priceRange.minPrice;

  const chartWidth = getChartWidth(renderItems.length);

  if (!items.length) {
    return <div className={styles.stateText}>Нет данных по выбранному периоду</div>;
  }

  return (
    <div className={styles.chart}>
      <div className={styles.chartScroll} ref={chartScrollRef}>
        <svg
          className={styles.chartSvg}
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          role="img"
        >
          {renderItems.map((renderItem, index) => {
            const x = index * (BAR_WIDTH + BAR_GAP);

            if (renderItem.type === 'disabled') {
              const y = BAR_BASE_Y - DISABLED_BAR_HEIGHT;
              const dateLabel = formatDateLabel(renderItem.date);

              return (
                <g key={`disabled-${renderItem.date}`} className={styles.barGroupDisabled}>
                  <rect
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={DISABLED_BAR_HEIGHT}
                    rx={4}
                    className={styles.barDisabled}
                  />

                  <text
                    x={x + BAR_WIDTH / 2}
                    y={DATE_LABEL_Y}
                    textAnchor="middle"
                    className={styles.dateText}
                  >
                    {dateLabel}
                  </text>
                </g>
              );
            }

            const { item } = renderItem;

            const isUnavailable = item.minTotalPrice <= 0;

            const height = getBarHeight(item.minTotalPrice, minPrice);
            const y = BAR_BASE_Y - height;

            const isSelected = selectedItem?.date === item.date;
            const priceLabel = isUnavailable ? '-' : priceFormatter.format(item.minTotalPrice);
            const dateLabel = formatDateLabel(item.date);

            const priceHighlight = priceHighlightMap[item.date];
            const isBestPrice = priceHighlight === 'best';
            const isRecommendedPrice = priceHighlight === 'recommended';

            return (
              <g
                key={item.date}
                className={cn(styles.barGroup, {
                  [styles.barGroupDisabled]: isUnavailable,
                })}
                role={isUnavailable ? undefined : 'button'}
                tabIndex={isUnavailable ? undefined : 0}
                onClick={() => {
                  if (!isUnavailable) {
                    onSelect(item);
                  }
                }}
                onKeyDown={(event) => {
                  if (isUnavailable) {
                    return;
                  }

                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(item);
                  }
                }}
              >
                <rect
                  x={x}
                  y={y}
                  width={BAR_WIDTH}
                  height={height}
                  rx={4}
                  className={cn(styles.bar, {
                    [styles.barSelected]: isSelected,
                    [styles.barRecommendedPrice]: isRecommendedPrice,
                    [styles.barBestPrice]: isBestPrice,
                  })}
                />
                <text
                  x={x + BAR_WIDTH / 2}
                  y={PRICE_LABEL_Y}
                  textAnchor="middle"
                  className={styles.priceText}
                >
                  {priceLabel}
                </text>

                <text
                  x={x + BAR_WIDTH / 2}
                  y={DATE_LABEL_Y}
                  textAnchor="middle"
                  className={styles.dateText}
                >
                  {dateLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
