import {
  CheckCircleFilled,
  InfoCircleOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Popover } from 'antd';
import { useRef } from 'react';
import { CLASS_DELTAS, CLASS_NAMES } from '@/shared/consts';
import type { FlightDto, ServiceClass } from '@/shared/types';
import { AirlineCircle } from '@/shared/ui';
import {
  formatDuration,
  formatFlightDate,
  formatPassengers,
  formatSeats,
  formatStopsFull,
  getAirlines,
} from '@/shared/utils';
import { BaggageDetail, ClassDetail } from './FlightFareDetail';
import { FlightRouteDetail } from './FlightRouteDetail';
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

const getFullRouteName = (flight: FlightDto) =>
  [
    flight.originAirport,
    ...(flight.stops?.map((s) => s.airport) ?? []),
    flight.destinationAirport,
  ].join(' → ');

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
                  content={<FlightRouteDetail flight={flight} />}
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
