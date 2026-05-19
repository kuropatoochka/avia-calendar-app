import type { FlightDto, ServiceClass } from '@/shared/types';
import { CLASS_DELTAS, CLASS_NAMES } from '../lib/consts';

const ALL_CLASSES: ServiceClass[] = ['economy', 'comfort', 'business', 'first'];

type SeatsLeft = FlightDto['seatsLeft'];

type Candidate = { label: string; price: number };

const PriceCell = ({ price }: { price: number }) => (
  <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
    {price.toLocaleString('ru-RU')}&nbsp;₽
  </span>
);

type Props = {
  effectiveSeatsLeft: SeatsLeft;
  altSeatsLeft: SeatsLeft;
  serviceClass: ServiceClass;
  baseFarePrice: number;
  altBaseFarePrice: number;
  effectiveBaggage: boolean;
};

export const SeatsTooltip = ({
  effectiveSeatsLeft,
  altSeatsLeft,
  serviceClass,
  baseFarePrice,
  altBaseFarePrice,
  effectiveBaggage,
}: Props) => {
  const currentPrice = baseFarePrice + CLASS_DELTAS[serviceClass];

  const baseBaggageLabel = effectiveBaggage ? 'С багажом' : 'Ручная кладь';
  const altBaggageLabel = effectiveBaggage ? 'Ручная кладь' : 'С багажом';

  // Build every (class × fare) combination that has available seats,
  // excluding the currently selected option.
  const candidates: Candidate[] = [];
  const seen = new Set<string>();

  const push = (label: string, price: number) => {
    const key = `${label}|${price}`;
    if (!seen.has(key)) {
      seen.add(key);
      candidates.push({ label, price });
    }
  };

  for (const cls of ALL_CLASSES) {
    // Base fare in this class — skip if it is the currently selected combination
    if ((effectiveSeatsLeft[cls] ?? 0) > 0 && cls !== serviceClass) {
      push(`${CLASS_NAMES[cls]} · ${baseBaggageLabel}`, baseFarePrice + CLASS_DELTAS[cls]);
    }

    // Alt fare in this class (always a different combination from current)
    if ((altSeatsLeft[cls] ?? 0) > 0) {
      push(`${CLASS_NAMES[cls]} · ${altBaggageLabel}`, altBaseFarePrice + CLASS_DELTAS[cls]);
    }
  }

  // Split into above / below current price and sort each group
  const above = candidates.filter((c) => c.price > currentPrice).sort((a, b) => a.price - b.price); // cheapest first — "next-highest"

  const below = candidates.filter((c) => c.price < currentPrice).sort((a, b) => b.price - a.price); // most-expensive first — "nearest below"

  // Prefer options above; pad with nearest-below when fewer than 3 available above
  const top3: Candidate[] = [...above, ...below].slice(0, 3);

  if (top3.length === 0) {
    return <span style={{ fontSize: 12 }}>Это лучший вариант на данном рейсе</span>;
  }

  const headerLabel = above.length > 0 ? 'Следующие варианты по цене' : 'Ближайшие варианты';

  return (
    <div style={{ minWidth: 210 }}>
      <div style={{ marginBottom: 6, fontSize: 11, color: '#aaa' }}>{headerLabel}</div>
      {top3.map(({ label, price }, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            lineHeight: '1.8',
          }}
        >
          <span style={{ fontSize: 12 }}>{label}</span>
          <PriceCell price={price} />
        </div>
      ))}
    </div>
  );
};
