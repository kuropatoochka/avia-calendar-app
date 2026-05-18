import { CLASS_DELTAS, CLASS_NAMES } from '@/shared/consts';
import type { FlightDto, ServiceClass } from '@/shared/types';

const ALL_CLASSES: ServiceClass[] = ['economy', 'comfort', 'business', 'first'];

type SeatsLeft = FlightDto['seatsLeft'];

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
  type Alt = { label: string; price: number };
  const candidates: Alt[] = [];

  // Alt fare, same class
  if ((altSeatsLeft[serviceClass] ?? 0) > 0) {
    candidates.push({
      label: effectiveBaggage ? 'Без багажа' : 'С багажом',
      price: altBaseFarePrice + CLASS_DELTAS[serviceClass],
    });
  }

  // Same fare, other classes
  for (const cls of ALL_CLASSES) {
    if (cls !== serviceClass && (effectiveSeatsLeft[cls] ?? 0) > 0) {
      candidates.push({ label: CLASS_NAMES[cls], price: baseFarePrice + CLASS_DELTAS[cls] });
    }
  }

  // Alt fare, other classes (to fill up to 3 if needed)
  for (const cls of ALL_CLASSES) {
    if (cls !== serviceClass && (altSeatsLeft[cls] ?? 0) > 0) {
      candidates.push({
        label: `${effectiveBaggage ? 'Без багажа' : 'С багажом'} · ${CLASS_NAMES[cls]}`,
        price: altBaseFarePrice + CLASS_DELTAS[cls],
      });
    }
  }

  // Sort by price, deduplicate, take top 3
  const seen = new Set<string>();
  const top3 = candidates
    .sort((a, b) => a.price - b.price)
    .filter(({ label, price }) => {
      const key = `${label}|${price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);

  if (top3.length === 0) return <span>Последние места на этот рейс</span>;

  return (
    <div style={{ minWidth: 200 }}>
      <div style={{ marginBottom: 6, fontSize: 11, color: '#aaa' }}>Другие варианты</div>
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
