import type { PriceDynamicsChartItem } from '../model/types';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/utils';
import {
  BAR_BASE_Y,
  BAR_GAP,
  BAR_WIDTH,
  BEST_BADGE_HEIGHT,
  BEST_BADGE_ICON_SIZE,
  BEST_BADGE_MIN_Y,
  BEST_BADGE_OFFSET,
  BEST_BADGE_WIDTH,
  CHART_HEIGHT,
  CHART_SIDE_PADDING,
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

  const chartContentWidth = itemsCount * BAR_WIDTH + (itemsCount - 1) * BAR_GAP;
  const chartWidth = chartContentWidth + CHART_SIDE_PADDING * 2;
  return chartWidth;
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
            const x = CHART_SIDE_PADDING + index * (BAR_WIDTH + BAR_GAP);

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

            const bestBadgeX = x + BAR_WIDTH / 2 - BEST_BADGE_WIDTH / 2;

            const bestBadgeY = Math.max(
              y - BEST_BADGE_HEIGHT - BEST_BADGE_OFFSET,
              BEST_BADGE_MIN_Y,
            );

            const bestBadgeCenterX = x + BAR_WIDTH / 2;
            const bestBadgeCenterY = bestBadgeY + BEST_BADGE_HEIGHT / 2;

            const bestBadgeIconX = bestBadgeCenterX + 8;
            const bestBadgeIconY = bestBadgeCenterY - BEST_BADGE_ICON_SIZE / 2;

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
                {isBestPrice && (
                  <g className={styles.bestBadgeGroup}>
                    <rect
                      x={bestBadgeX}
                      y={bestBadgeY}
                      width={BEST_BADGE_WIDTH}
                      height={BEST_BADGE_HEIGHT}
                      rx={BEST_BADGE_HEIGHT / 2}
                      className={styles.bestBadge}
                    />

                    <text
                      x={bestBadgeCenterX - 7}
                      y={bestBadgeCenterY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={styles.bestBadgeText}
                    >
                      топ
                    </text>

                    <svg
                      x={bestBadgeIconX}
                      y={bestBadgeIconY}
                      width={BEST_BADGE_ICON_SIZE}
                      height={BEST_BADGE_ICON_SIZE}
                      viewBox="0 0 16 16"
                      fill="none"
                      className={styles.bestBadgeIcon}
                    >
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="m6.452 6.864 1.13-2.173a32 32 0 0 1 1.872-3.095c.964 1.045 1.906 2.3 2.612 3.622.748 1.402 1.184 2.789 1.184 4.032 0 1.427-.904 2.83-2.153 3.613q.088-.398.09-.863c0-1.255-.674-2.336-1.143-2.963a9 9 0 0 0-1.01-1.125l-.024-.02-.008-.008L9 7.88l-.001-.001C8.996 7.88 8.996 7.878 8 9a7 7 0 0 0 .984 1.133c.37.534.704 1.2.704 1.867 0 .77-.313 1.276-.618 1.587-.159.162-.279.38-.314.6a.8.8 0 0 0 0 .264q.017.095.06.182c.113.225.343.37.594.35 2.836-.235 5.34-2.87 5.34-5.733 0-3.149-2.177-6.538-4.357-8.845A1.3 1.3 0 0 0 9.435 0 1.32 1.32 0 0 0 8.35.556 34 34 0 0 0 6.25 4l-.955-1.337-.016-.022a.986.986 0 0 0-1.573.004C2.62 4.123 1.25 6.249 1.25 9.25c0 2.863 2.504 5.498 5.34 5.733.25.02.481-.125.593-.35a.7.7 0 0 0 .06-.182.8.8 0 0 0 .001-.263 1.15 1.15 0 0 0-.314-.601c-.305-.31-.617-.817-.617-1.587 0-.666.333-1.333.703-1.867l.09-.128C7.544 9.405 8 9 8 9l-.997-1.12H7l-.003.003-.008.007-.024.021-.073.07a9 9 0 0 0-.937 1.056c-.47.626-1.143 1.707-1.143 2.962 0 .31.033.598.09.863C3.654 12.08 2.75 10.677 2.75 9.25c0-2.171.847-3.812 1.745-5.126l.534.748zM8 9l.997-1.121L8 6.993l-.997.886z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </g>
                )}
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
