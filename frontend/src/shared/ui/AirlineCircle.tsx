import { Tooltip } from 'antd';
import { AIRLINE_LOGOS } from '@/shared/assets/airlines';

type Props = {
  airline: string;
  size?: number;
  className?: string;
};

/**
 * Circular airline logo badge.
 * - Circular logos (Аэрофлот, S7, Уральские): object-fit cover — fills the circle perfectly.
 * - Text/wordmark logos (Победа, Россия): object-fit contain with padding on white bg.
 * - Unknown airlines: falls back to two-letter initials.
 * Always shows the full airline name in a tooltip on hover.
 */
export const AirlineCircle = ({ airline, size = 40, className }: Props) => {
  const config = AIRLINE_LOGOS[airline];

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'default',
  };

  let inner: React.ReactNode;

  if (config) {
    inner = (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: config.circular ? 'transparent' : '#fff',
          border: config.circular ? 'none' : '1px solid #f0f0f0',
          padding: config.circular ? 0 : Math.round(size * 0.1),
        }}
      >
        <img
          src={config.src}
          alt={airline}
          style={{
            width: '100%',
            height: '100%',
            objectFit: config.circular ? 'cover' : 'contain',
            borderRadius: config.circular ? '50%' : 0,
          }}
        />
      </div>
    );
  } else {
    // Fallback: initials
    inner = (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'var(--color-primary-100)',
          color: 'var(--color-primary-600)',
          fontSize: size * 0.3,
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {airline.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <Tooltip
      title={airline}
      placement="top"
      mouseEnterDelay={0.2}
      getPopupContainer={() => document.body}
    >
      {inner}
    </Tooltip>
  );
};
