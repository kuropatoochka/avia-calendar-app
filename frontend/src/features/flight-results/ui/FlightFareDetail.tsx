import type { SeatsLeft } from '../lib/types';
import type React from 'react';
import {
  CheckOutlined,
  CloseOutlined,
  HeartOutlined,
  SmileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { FlightDto, Passengers, ServiceClass } from '@/shared/types';
import { CLASS_DELTAS } from '../lib/consts';
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

// ── Passenger breakdown popover ──────────────────────────────────────────────

const PawIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="6.5" cy="3.5" rx="1.8" ry="2.2" />
    <ellipse cx="13.5" cy="3.5" rx="1.8" ry="2.2" />
    <ellipse cx="3" cy="8.5" rx="1.5" ry="2" />
    <ellipse cx="17" cy="8.5" rx="1.5" ry="2" />
    <path d="M10 7.5c-3.8 0-6.2 2.8-5 6.2.6 1.8 2.2 2.8 3.8 2.8h2.4c1.6 0 3.2-1 3.8-2.8 1.2-3.4-1.2-6.2-5-6.2z" />
  </svg>
);

type PassengerDetailProps = {
  passengers: Passengers;
  pricePerPassenger: number;
  baggageAnimals: number;
  baggageAnimalWeights: number[];
};

const HUMAN_ROWS: {
  key: keyof Omit<Passengers, 'animals'>;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'adults', label: 'Взрослый', Icon: UserOutlined },
  { key: 'children', label: 'Ребёнок', Icon: SmileOutlined },
  { key: 'toddler', label: 'Младенец', Icon: HeartOutlined },
];

// Flat fee for transporting an animal as checked baggage
const ANIMAL_BAGGAGE_FEE = 2000;

export const PassengerDetail = ({
  passengers,
  pricePerPassenger,
  baggageAnimals,
  baggageAnimalWeights,
}: PassengerDetailProps) => (
  <div className={styles.classDetail}>
    <p className={styles.classDetailTitle}>Пассажиры</p>
    {HUMAN_ROWS.filter(({ key }) => passengers[key] > 0).map(({ key, label, Icon }) => {
      const count = passengers[key];
      const total = pricePerPassenger * count;
      return (
        <div key={key} className={styles.classOption} style={{ cursor: 'default' }}>
          <Icon className={styles.classOptionIcon} />
          <span className={styles.classOptionLabel}>
            {label}
            {count > 1 ? ` × ${count}` : ''}
          </span>
          <span className={styles.classOptionPrice}>{total.toLocaleString('ru-RU')} ₽</span>
        </div>
      );
    })}
    {passengers.animals > 0 && (
      <div className={styles.classOption} style={{ cursor: 'default' }}>
        <PawIcon className={styles.classOptionIcon} />
        <span className={styles.classOptionLabel}>
          Животное в салоне{passengers.animals > 1 ? ` × ${passengers.animals}` : ''}
        </span>
        <span className={styles.classOptionPrice}>
          {(pricePerPassenger * passengers.animals).toLocaleString('ru-RU')} ₽
        </span>
      </div>
    )}
    {baggageAnimals > 0 &&
      baggageAnimalWeights.map((weight, i) => (
        <div key={`bag-animal-${i}`} className={styles.classOption} style={{ cursor: 'default' }}>
          <PawIcon className={styles.classOptionIcon} />
          <span className={styles.classOptionLabel}>Животное как багаж · {weight} кг</span>
          <span className={styles.classOptionPrice}>
            {ANIMAL_BAGGAGE_FEE.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      ))}
  </div>
);
