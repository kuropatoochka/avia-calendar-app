import type { PriceDynamicsChartItem } from '../model/types';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/utils';
import { getPriceHighlightMap } from '../model/get-price-highlight-map';
import styles from './price-dynamics.module.css';

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const CHART_HEIGHT = 200;
const BAR_WIDTH = 48;
const BAR_GAP = 16;

// const TOP_LABEL_Y = 16;
const BAR_TOP_OFFSET = 24;
const BAR_BASE_Y = 150;

const PRICE_LABEL_Y = 170;
const DATE_LABEL_Y = 190;

const MIN_BAR_HEIGHT = 4;

const formatDateLabel = (date: string) => {
  return dayjs(date).format('DD.MM');
};

const getChartWidth = (itemsCount: number) => {
  if (!itemsCount) {
    return 0;
  }

  return itemsCount * BAR_WIDTH + (itemsCount - 1) * BAR_GAP;
};

const getBarHeight = (price: number, minPrice: number, maxPrice: number) => {
  const availableHeight = BAR_BASE_Y - BAR_TOP_OFFSET;

  if (price <= 0) {
    return MIN_BAR_HEIGHT;
  }

  if (maxPrice === minPrice) {
    return Math.round(availableHeight * 0.65);
  }

  const ratio = (price - minPrice) / (maxPrice - minPrice);

  return Math.round(MIN_BAR_HEIGHT + ratio * (availableHeight - MIN_BAR_HEIGHT));
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
  const disabledBarFullWidth = BAR_WIDTH + BAR_GAP;

  return Math.floor(emptyWidth / disabledBarFullWidth);
};

type RenderChartItem =
  | {
      type: 'active';
      item: PriceDynamicsChartItem;
    }
  | {
      type: 'disabled';
      date: string;
    };

const getRenderItems = (
  items: PriceDynamicsChartItem[],
  containerWidth: number,
): RenderChartItem[] => {
  const disabledBarsCount = getDisabledBarsCount(items.length, containerWidth);
  const lastDate = items.at(-1)?.date;

  if (!lastDate || disabledBarsCount === 0) {
    return items.map((item) => ({
      type: 'active',
      item,
    }));
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

  return [
    ...items.map((item) => ({
      type: 'active' as const,
      item,
    })),
    ...disabledItems,
  ];
};

interface Props {
  items: PriceDynamicsChartItem[];
  selectedItem: PriceDynamicsChartItem | null;
  highlightBestPrices?: boolean;
  onSelect: (item: PriceDynamicsChartItem) => void;
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
    if (!chartScrollRef.current) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      console.log(entry.contentRect.width);

      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(chartScrollRef.current);

    return () => {
      observer.disconnect();
    };
  }, [items.length]);

  const priceHighlightMap = useMemo(() => {
    return getPriceHighlightMap(items, highlightBestPrices);
  }, [items, highlightBestPrices]);

  const renderItems = useMemo(() => {
    return getRenderItems(items, containerWidth);
  }, [items, containerWidth]);

  const prices = useMemo(() => {
    return items.map((item) => item.minTotalPrice);
  }, [items]);

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

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
              const y = BAR_BASE_Y - MIN_BAR_HEIGHT;
              const dateLabel = formatDateLabel(renderItem.date);

              return (
                <g key={`disabled-${renderItem.date}`} className={styles.barGroupDisabled}>
                  <rect
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={MIN_BAR_HEIGHT}
                    rx={4}
                    className={styles.barDisabled}
                  />

                  <text
                    x={x + BAR_WIDTH / 2}
                    y={DATE_LABEL_Y}
                    textAnchor="middle"
                    className={cn(styles.dateText, styles.dateTextDisabled)}
                  >
                    {dateLabel}
                  </text>
                </g>
              );
            }

            const { item } = renderItem;

            const isUnavailable = item.minTotalPrice <= 0;
            const height = getBarHeight(item.minTotalPrice, minPrice, maxPrice);
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
                {/* {isBestPrice && (
                  <text
                    x={x + BAR_WIDTH / 2}
                    y={TOP_LABEL_Y}
                    textAnchor="middle"
                    className={styles.bestPriceText}
                  >
                    дешево
                  </text>
                )} */}

                <rect
                  x={x}
                  y={y}
                  width={BAR_WIDTH}
                  height={height}
                  rx={4}
                  className={cn(styles.bar, {
                    [styles.barUnavailable]: isUnavailable,
                    [styles.barRecommendedPrice]: isRecommendedPrice,
                    [styles.barBestPrice]: isBestPrice,
                    [styles.barSelected]: isSelected,
                  })}
                />

                <text
                  x={x + BAR_WIDTH / 2}
                  y={PRICE_LABEL_Y}
                  textAnchor="middle"
                  className={cn(styles.priceText, {
                    [styles.priceTextUnavailable]: isUnavailable,
                  })}
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
