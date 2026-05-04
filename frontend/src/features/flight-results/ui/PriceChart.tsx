import type { BestPricesDto } from '@/shared/types';
import { formatDateShort } from '@/shared/utils';
import styles from './styles.module.css';

type Props = {
  data: BestPricesDto;
  cityName: string;
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
};

const niceMax = (value: number) => Math.ceil(value / 1000) * 1000;

export const PriceChart = ({ data, cityName, selectedDate, onDateSelect }: Props) => {
  if (data.length === 0) return null;

  const W = 740;
  const H = 200;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 16;
  const paddingBottom = 48;

  const chartW = W - paddingLeft - paddingRight;
  const chartH = H - paddingTop - paddingBottom;

  const prices = data.map((d) => d.price);
  const minPrice = 0;
  const maxPrice = niceMax(Math.max(...prices));

  const yLevels = 5;
  const yStep = maxPrice / (yLevels - 1);

  const xScale = (i: number) => (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);

  const yScale = (price: number) => chartH - ((price - minPrice) / (maxPrice - minPrice)) * chartH;

  const points = data.map((d, i) => ({
    x: paddingLeft + xScale(i),
    y: paddingTop + yScale(d.price),
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const minPricePoint = points.reduce((min, p) => (p.price < min.price ? p : min), points[0]);

  return (
    <div className={styles.chartCard}>
      <p className={styles.chartTitle}>Динамика цен</p>
      <p className={styles.chartCity}>{cityName}</p>
      {onDateSelect && (
        <p className={styles.chartHint}>Нажмите на дату, чтобы выбрать её для поиска</p>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg} aria-label="График динамики цен">
        {/* Y-axis grid lines and labels */}
        {Array.from({ length: yLevels }, (_, i) => {
          const price = yStep * i;
          const y = paddingTop + yScale(price);
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={W - paddingRight}
                y2={y}
                stroke="#e8e8e8"
                strokeWidth={0.5}
                strokeDasharray="4 3"
              />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#999">
                {price === 0 ? '0' : (price / 1000).toFixed(0) + ' тыс'}
              </text>
            </g>
          );
        })}

        {/* Line */}
        <path d={pathD} fill="none" stroke="#1890ff" strokeWidth={2} strokeLinejoin="round" />

        {/* Dots, price labels and x-axis labels */}
        {points.map((p, i) => {
          const isSelected = p.date === selectedDate;
          const isCheapest = p.date === minPricePoint.date;
          const isClickable = !!onDateSelect;

          return (
            <g
              key={i}
              onClick={() => onDateSelect?.(p.date)}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
            >
              {/* Highlight column for selected */}
              {isSelected && (
                <rect
                  x={p.x - 24}
                  y={paddingTop}
                  width={48}
                  height={chartH + paddingBottom - 16}
                  fill="#e6f4ff"
                  rx={4}
                />
              )}

              {/* Price label above dot */}
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize={10}
                fill={isCheapest ? '#52c41a' : '#1890ff'}
                fontWeight={isCheapest ? 700 : 400}
              >
                {(p.price / 1000).toFixed(1)}к
              </text>

              {/* Dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? 6 : 4}
                fill={isSelected ? '#1890ff' : isCheapest ? '#52c41a' : '#1890ff'}
                stroke={isSelected ? '#fff' : 'none'}
                strokeWidth={2}
              />

              {/* Date label */}
              <text
                x={p.x}
                y={H - 28}
                textAnchor="middle"
                fontSize={11}
                fill={isSelected ? '#1890ff' : '#666'}
                fontWeight={isSelected ? 700 : 400}
              >
                {formatDateShort(p.date)}
              </text>

              {/* Cheapest marker */}
              {isCheapest && (
                <text x={p.x} y={H - 14} textAnchor="middle" fontSize={9} fill="#52c41a">
                  min
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
