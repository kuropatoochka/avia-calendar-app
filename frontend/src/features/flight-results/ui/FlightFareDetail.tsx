import type { SeatsLeft } from '../lib/types';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { CLASS_DELTAS } from '@/shared/consts';
import type { FlightDto, ServiceClass } from '@/shared/types';
import styles from './styles.module.css';

// ── Seat icon ────────────────────────────────────────────────────────────────

const SeatIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 20 22"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="5" y="1" width="10" height="11" rx="2" />
    <rect x="3" y="13" width="14" height="4" rx="2" />
    <rect x="3" y="18" width="3" height="3" rx="1" />
    <rect x="14" y="18" width="3" height="3" rx="1" />
  </svg>
);

const CLASS_OPTIONS: { key: ServiceClass; label: string }[] = [
  { key: 'economy', label: 'Эконом' },
  { key: 'comfort', label: 'Комфорт' },
  { key: 'business', label: 'Бизнес' },
  { key: 'first', label: 'Первый класс' },
];

// ── Baggage detail popover ───────────────────────────────────────────────────

type BaggageDetailProps = {
  flight: FlightDto;
  altSeatsLeft: SeatsLeft;
  fareOverride: boolean;
  serviceClass: ServiceClass;
  onFareChange: () => void;
};

export const BaggageDetail = ({
  flight,
  altSeatsLeft,
  fareOverride,
  serviceClass,
  onFareChange,
}: BaggageDetailProps) => {
  const effectiveBaggage = fareOverride ? !flight.baggageIncluded : flight.baggageIncluded;
  const noSeats = (altSeatsLeft[serviceClass] ?? 0) === 0;
  const altBaseFare = fareOverride
    ? flight.price
    : flight.baggageIncluded
      ? flight.price - 2500
      : flight.price + 2500;
  const switchPrice = (altBaseFare + CLASS_DELTAS[serviceClass]).toLocaleString('ru-RU');
  const switchLabel = effectiveBaggage ? 'Поменять на ручную кладь?' : 'Поменять на багаж?';

  return (
    <div className={styles.baggageDetail}>
      <p className={styles.baggageDetailTitle}>Условия тарифа</p>

      <div className={styles.baggageDetailRow}>
        <CheckOutlined className={styles.baggageDetailIconOk} />
        <div className={styles.baggageDetailText}>
          <span>Ручная кладь — 1 шт</span>
          <span className={styles.baggageDetailHint}>до 10 кг · 55 × 40 × 20 см</span>
        </div>
      </div>

      <div className={styles.baggageDetailRow}>
        {effectiveBaggage ? (
          <>
            <CheckOutlined className={styles.baggageDetailIconOk} />
            <div className={styles.baggageDetailText}>
              <span>Багаж включён</span>
              <span className={styles.baggageDetailHint}>
                до {flight.baggageWeight} кг · 158 лин. см
              </span>
            </div>
          </>
        ) : (
          <>
            <CloseOutlined className={styles.baggageDetailIconNo} />
            <span>Без багажа</span>
          </>
        )}
      </div>

      <div className={styles.baggageDetailRow}>
        <CloseOutlined className={styles.baggageDetailIconNo} />
        <span>Без возврата</span>
      </div>

      <div className={styles.baggageDetailRow}>
        <CheckOutlined className={styles.baggageDetailIconOk} />
        <span>Обмен платный</span>
      </div>

      <p className={styles.baggageDetailFooter}>
        Общее количество чемоданов и сумок на всех пассажиров
      </p>

      <p className={styles.changeFareLabel}>{switchLabel}</p>
      <button
        className={styles.changeFareBtn}
        onClick={onFareChange}
        disabled={noSeats}
        style={noSeats ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
      >
        <span>Изменить тариф</span>
        <span className={styles.changeFarePrice}>{switchPrice} ₽</span>
      </button>
    </div>
  );
};

// ── Class selector popover ───────────────────────────────────────────────────

type ClassDetailProps = {
  seatsLeft: SeatsLeft;
  baseFarePrice: number;
  serviceClass: ServiceClass;
  onClassChange: (cls: ServiceClass) => void;
};

export const ClassDetail = ({
  seatsLeft,
  baseFarePrice,
  serviceClass,
  onClassChange,
}: ClassDetailProps) => (
  <div className={styles.classDetail}>
    <p className={styles.classDetailTitle}>Класс обслуживания</p>
    {CLASS_OPTIONS.map(({ key, label }) => {
      const price = baseFarePrice + CLASS_DELTAS[key];
      const selected = serviceClass === key;
      const noSeats = (seatsLeft[key] ?? 0) === 0;
      return (
        <button
          key={key}
          className={`${styles.classOption} ${selected ? styles.classOptionSelected : ''}`}
          onClick={() => !noSeats && onClassChange(key)}
          disabled={noSeats}
          style={noSeats ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
        >
          <SeatIcon className={styles.classOptionIcon} />
          <span className={styles.classOptionLabel}>{label}</span>
          <span className={styles.classOptionPrice}>
            {noSeats ? 'Нет мест' : `${price.toLocaleString('ru-RU')} ₽`}
          </span>
        </button>
      );
    })}
  </div>
);
