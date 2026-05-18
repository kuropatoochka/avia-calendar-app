import type { LayoverNote, SeatsLeft } from '../lib/types';
import {
  CheckCircleFilled,
  InfoCircleOutlined,
  CloseOutlined,
  CheckOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { Popover } from 'antd';
import { useRef } from 'react';
import { CLASS_DELTAS, CLASS_NAMES } from '@/shared/consts';
import type { FlightDto, ServiceClass } from '@/shared/types';
import { AirlineCircle } from '@/shared/ui';
import {
  formatFlightDate,
  formatPassengers,
  formatDuration,
  formatStopsFull,
  formatSeats,
  getAirlines,
} from '@/shared/utils';
import { buildLegs, getLayoverNotes } from '../lib/flightUtils';
import styles from './styles.module.css';

type Props = {
  flight: FlightDto;
  passengersCount: number;
  bookedCount: number;
  fareOverride: boolean;
  serviceClass: ServiceClass;
  onFareChange: () => void;
  onClassChange: (cls: ServiceClass) => void;
  onToggleBooked: () => void;
  onAddOne: () => void;
  onRemoveOne: () => void;
  onClose: () => void;
};

const CLASS_OPTIONS: { key: ServiceClass; label: string }[] = [
  { key: 'economy', label: 'Эконом' },
  { key: 'comfort', label: 'Комфорт' },
  { key: 'business', label: 'Бизнес' },
  { key: 'first', label: 'Первый класс' },
];

const getFullRouteName = (flight: FlightDto) =>
  [
    flight.originAirport,
    ...(flight.stops?.map((s) => s.airport) ?? []),
    flight.destinationAirport,
  ].join(' → ');

/* ── Seat icon SVG ── */
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

const NOTE_PREFIXES: Record<LayoverNote['kind'], string> = {
  danger: '⚠',
  warning: '·',
  info: '·',
};

/* ── Route detail popover ── */
const RouteDetail = ({ flight }: { flight: FlightDto }) => {
  const legs = buildLegs(flight);
  const hasStops = (flight.stops?.length ?? 0) > 0;
  return (
    <div className={styles.routeDetail}>
      <p className={styles.routeDetailTitle}>
        {flight.originCity} — {flight.destinationCity}
      </p>
      <p className={styles.routeDetailSub}>{formatDuration(flight.duration)} в пути</p>
      {legs.map((leg, i) => (
        <div key={i}>
          <div className={styles.routeDetailLeg}>
            <div className={styles.routeDetailLegInfo}>
              <AirlineCircle airline={leg.airline} size={34} />
              <div>
                <p className={styles.routeDetailAirlineName}>{leg.airline}</p>
                <p className={styles.routeDetailLegTime}>{formatDuration(leg.duration)} в полёте</p>
              </div>
            </div>
            <div className={styles.routeDetailPoints}>
              <div className={styles.routeDetailPoint}>
                <div className={styles.routeDetailDotCol}>
                  <div className={styles.routeDetailDot} />
                  <div className={styles.routeDetailLine} />
                </div>
                <span className={styles.routeDetailTime}>{leg.dep}</span>
                <div>
                  <p className={styles.routeDetailCity}>{leg.from}</p>
                  <p className={styles.routeDetailAirport}>
                    {leg.fromAirport}, {leg.fromCode}
                  </p>
                </div>
              </div>
              <div className={styles.routeDetailPoint}>
                <div className={styles.routeDetailDotCol}>
                  <div className={styles.routeDetailDot} />
                </div>
                <span className={styles.routeDetailTime}>{leg.arr}</span>
                <div>
                  <p className={styles.routeDetailCity}>{leg.to}</p>
                  <p className={styles.routeDetailAirport}>
                    {leg.toAirport}, {leg.toCode}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {hasStops &&
            i < legs.length - 1 &&
            (() => {
              const stop = flight.stops![i];
              const notes = getLayoverNotes(stop, leg.arr, leg.airline);
              return (
                <div className={styles.routeDetailTransfer}>
                  <span className={styles.routeDetailTransferBadge}>
                    Пересадка в {stop.city} · {formatDuration(stop.durationMinutes)}
                  </span>
                  {notes.map((note, ni) => (
                    <span
                      key={ni}
                      className={`${styles.routeDetailNote} ${styles[`routeDetailNote_${note.kind}`]}`}
                    >
                      {NOTE_PREFIXES[note.kind]} {note.text}
                    </span>
                  ))}
                </div>
              );
            })()}
        </div>
      ))}
    </div>
  );
};

/* ── Baggage detail popover ── */

type BaggageDetailProps = {
  flight: FlightDto;
  altSeatsLeft: SeatsLeft;
  fareOverride: boolean;
  serviceClass: ServiceClass;
  onFareChange: () => void;
};

const BaggageDetail = ({
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

/* ── Class selector popover ── */
type ClassDetailProps = {
  seatsLeft: SeatsLeft;
  baseFarePrice: number;
  serviceClass: ServiceClass;
  onClassChange: (cls: ServiceClass) => void;
};

const ClassDetail = ({
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

export const FlightModal = ({
  flight,
  passengersCount,
  bookedCount,
  fareOverride,
  serviceClass,
  onFareChange,
  onClassChange,
  onToggleBooked,
  onAddOne,
  onRemoveOne,
  onClose,
}: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const getContainer = () => modalRef.current ?? document.body;

  const booked = bookedCount > 0;
  const airlines = getAirlines(flight);
  const hasCarrierChange = airlines.length > 1;

  const effectiveBaggage = fareOverride ? !flight.baggageIncluded : flight.baggageIncluded;
  const baseFarePrice = fareOverride
    ? flight.baggageIncluded
      ? flight.price - 2500
      : flight.price + 2500
    : flight.price;
  const effectivePrice = baseFarePrice + CLASS_DELTAS[serviceClass];
  const effectiveOriginalPrice = flight.originalPrice + CLASS_DELTAS[serviceClass];
  const discount = Math.round((1 - effectivePrice / effectiveOriginalPrice) * 100);
  const hasDiscount = discount > 0;

  const effectiveSeatsLeft = fareOverride ? flight.seatsLeftAlt : flight.seatsLeft;
  const altSeatsLeft = fareOverride ? flight.seatsLeft : flight.seatsLeftAlt;
  const noSeatsInCurrentClass = effectiveSeatsLeft[serviceClass] === 0;

  const count = booked ? bookedCount : 1;
  const displayPrice = effectivePrice * count;
  const displayOriginalPrice = effectiveOriginalPrice * count;

  return (
    <>
      <div className={styles.modalBackdrop} onClick={onClose} />
      <div className={styles.modalWrapper} onClick={onClose}>
        <div className={styles.modal} ref={modalRef} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Детали рейса</h2>
            <button className={styles.modalClose} onClick={onClose}>
              ×
            </button>
          </div>

          <div className={styles.modalAirline}>
            <div className={styles.modalAirlineCircles}>
              <AirlineCircle airline={flight.airline} size={50} />
              {hasCarrierChange && (
                <AirlineCircle
                  airline={airlines[1]}
                  size={50}
                  className={styles.modalAirlineCircle2}
                />
              )}
            </div>
            <div className={styles.modalAirlineInfo}>
              <p className={styles.modalAirlineName}>
                {hasCarrierChange ? airlines.join(' + ') : flight.airline}
              </p>
              <p className={styles.modalFlightNumber}>{getFullRouteName(flight)}</p>
            </div>
            <div className={styles.modalFlightMeta}>
              <span
                className={`${styles.modalStopsBadge} ${flight.stopsCount === 0 ? styles.modalStopsBadgeDirect : styles.modalStopsBadgeTransfer}`}
              >
                {formatStopsFull(flight.stopsCount)}
              </span>
              <span className={styles.modalDurationLabel}>
                {formatDuration(flight.duration)} в пути
              </span>
            </div>
          </div>

          <div className={styles.modalDivider} />

          <div className={styles.modalGrid}>
            <div>
              <p className={styles.modalLabel}>Дата</p>
              <p className={styles.modalValue}>{formatFlightDate(flight.date)}</p>
            </div>
            <div>
              <p className={styles.modalLabel}>Время</p>
              <p className={styles.modalValue}>
                {flight.departureTime} – {flight.arrivalTime}
              </p>
            </div>
            <div>
              <div className={styles.modalLabelRow}>
                <p className={styles.modalLabel}>Маршрут</p>
                <Popover
                  content={<RouteDetail flight={flight} />}
                  trigger="hover"
                  placement="right"
                  getPopupContainer={getContainer}
                  overlayStyle={{ maxWidth: 340 }}
                >
                  <span className={styles.modalInfoIconWrap}>
                    <InfoCircleOutlined className={styles.modalInfoIcon} />
                  </span>
                </Popover>
              </div>
              <p className={styles.modalValue}>
                {flight.originCity} – {flight.destinationCity}
              </p>
            </div>
            <div>
              <p className={styles.modalLabel}>Пассажиры</p>
              <p className={styles.modalValue}>{formatPassengers(passengersCount)}</p>
            </div>
            <div>
              <div className={styles.modalLabelRow}>
                <p className={styles.modalLabel}>Класс</p>
                <Popover
                  content={
                    <ClassDetail
                      seatsLeft={effectiveSeatsLeft}
                      baseFarePrice={baseFarePrice}
                      serviceClass={serviceClass}
                      onClassChange={onClassChange}
                    />
                  }
                  trigger="hover"
                  placement="right"
                  getPopupContainer={getContainer}
                  overlayStyle={{ maxWidth: 260 }}
                >
                  <span className={styles.modalInfoIconWrap}>
                    <InfoCircleOutlined className={styles.modalInfoIcon} />
                  </span>
                </Popover>
              </div>
              <p className={styles.modalValue}>{CLASS_NAMES[serviceClass]}</p>
            </div>
            <div>
              <div className={styles.modalLabelRow}>
                <p className={styles.modalLabel}>Багаж</p>
                <Popover
                  content={
                    <BaggageDetail
                      flight={flight}
                      altSeatsLeft={altSeatsLeft}
                      fareOverride={fareOverride}
                      serviceClass={serviceClass}
                      onFareChange={onFareChange}
                    />
                  }
                  trigger="hover"
                  placement="right"
                  getPopupContainer={getContainer}
                  overlayStyle={{ maxWidth: 300 }}
                >
                  <span className={styles.modalInfoIconWrap}>
                    <InfoCircleOutlined className={styles.modalInfoIcon} />
                  </span>
                </Popover>
              </div>
              <p className={styles.modalValue}>
                {effectiveBaggage ? 'Багаж' : 'Ручная кладь'} ·{' '}
                {effectiveBaggage ? flight.baggageWeight : 10} кг
              </p>
            </div>
          </div>

          <div className={styles.modalDivider} />

          {effectiveSeatsLeft[serviceClass] < 6 && (
            <span
              className={`${styles.seatsLeftBadge} ${effectiveSeatsLeft[serviceClass] <= 2 ? styles.seatsLeftCritical : styles.seatsLeftWarning}`}
            >
              Осталось {formatSeats(effectiveSeatsLeft[serviceClass])}
            </span>
          )}

          <div className={styles.modalPriceRow}>
            <div className={styles.modalPriceGroup}>
              <span className={styles.modalPrice} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {displayPrice.toLocaleString('ru-RU')} ₽
              </span>
              {hasDiscount && (
                <span
                  className={styles.modalOriginalPrice}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {displayOriginalPrice.toLocaleString('ru-RU')} ₽
                </span>
              )}
            </div>
            {hasDiscount && <div className={styles.modalDiscountBadge}>-{discount}%</div>}
          </div>

          <div className={styles.modalBtnRow}>
            <button
              className={booked ? styles.modalBookBtnBooked : styles.modalBookBtn}
              onClick={onToggleBooked}
              disabled={!booked && noSeatsInCurrentClass}
              style={
                !booked && noSeatsInCurrentClass
                  ? { opacity: 0.45, cursor: 'not-allowed' }
                  : undefined
              }
            >
              {booked ? (
                <>
                  <CheckCircleFilled style={{ marginRight: 8 }} />
                  Забронировано{bookedCount > 1 ? ` ${bookedCount}` : ''}
                </>
              ) : noSeatsInCurrentClass ? (
                'Мест нет'
              ) : (
                'Забронировать'
              )}
            </button>
            {booked && (
              <>
                <button
                  className={styles.modalAddOneBtn}
                  onClick={onRemoveOne}
                  title="Убрать один билет"
                >
                  <MinusOutlined />
                </button>
                <button
                  className={styles.modalAddOneBtn}
                  onClick={onAddOne}
                  disabled={bookedCount >= effectiveSeatsLeft[serviceClass]}
                  title="Добавить ещё билет"
                  style={{
                    opacity: bookedCount >= effectiveSeatsLeft[serviceClass] ? 0.35 : 1,
                    cursor:
                      bookedCount >= effectiveSeatsLeft[serviceClass] ? 'not-allowed' : 'pointer',
                  }}
                >
                  <PlusOutlined />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
