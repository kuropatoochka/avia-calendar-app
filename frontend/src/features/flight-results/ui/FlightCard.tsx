import { CheckCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Fire, Plane } from '@/shared/assets';
import { CLASS_DELTAS, CLASS_NAMES } from '@/shared/consts';
import type { FlightDto, ServiceClass } from '@/shared/types';
import { AirlineCircle } from '@/shared/ui';
import {
  formatFlightDate,
  formatPassengers,
  formatSeats,
  formatStops,
  getAirlines,
} from '@/shared/utils';
import { SeatsTooltip } from './SeatsTooltip';
import { StopsTooltip } from './StopsTooltip';
import styles from './styles.module.css';

type Props = {
  flight: FlightDto;
  passengersCount: number;
  bookedCount?: number;
  fareOverride?: boolean;
  serviceClass?: ServiceClass;
  onClick: () => void;
};

export const FlightCard = ({
  flight,
  passengersCount,
  bookedCount = 0,
  fareOverride = false,
  serviceClass = 'economy',
  onClick,
}: Props) => {
  const booked = bookedCount > 0;
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
  const showFlame = discount >= 20;
  const showLoneFlame = !hasDiscount && effectivePrice < 10000;
  // Seat counts for current fare and the alternative fare
  const effectiveSeatsLeft = fareOverride ? flight.seatsLeftAlt : flight.seatsLeft;
  const altSeatsLeft = fareOverride ? flight.seatsLeft : flight.seatsLeftAlt;
  // Base price of the alternative fare (what clicking "Изменить тариф" would give)
  const altBaseFarePrice = fareOverride
    ? flight.price
    : flight.baggageIncluded
      ? flight.price - 2500
      : flight.price + 2500;
  const baggageLabel = effectiveBaggage ? 'Багаж' : 'Ручная кладь';
  const classLabel = CLASS_NAMES[serviceClass];
  const airlines = getAirlines(flight);
  const hasCarrierChange = airlines.length > 1;

  return (
    <button className={`${styles.card} ${booked ? styles.cardBooked : ''}`} onClick={onClick}>
      <div className={styles.cardRow}>
        <div className={styles.priceGroup}>
          <span className={styles.price}>{effectivePrice.toLocaleString('ru-RU')} ₽</span>
          {hasDiscount && (
            <span className={styles.originalPrice}>
              {effectiveOriginalPrice.toLocaleString('ru-RU')} ₽
            </span>
          )}
          <div className={styles.stopsBadgeGroup}>
            <Tooltip
              title={<StopsTooltip flight={flight} />}
              color="white"
              overlayInnerStyle={{ color: '#222', padding: '16px 20px', borderRadius: 12 }}
              overlayStyle={{ minWidth: flight.stopsCount > 0 ? 360 : 280 }}
              getPopupContainer={() => document.body}
            >
              <span
                className={`${styles.stopsLabel} ${flight.stopsCount === 0 ? styles.stopsLabelDirect : styles.stopsLabelTransfer}`}
                onClick={(e) => e.stopPropagation()}
              >
                {formatStops(flight.stopsCount)}
              </span>
            </Tooltip>
            {effectiveSeatsLeft[serviceClass] < 6 && (
              <Tooltip
                title={
                  <SeatsTooltip
                    effectiveSeatsLeft={effectiveSeatsLeft}
                    altSeatsLeft={altSeatsLeft}
                    serviceClass={serviceClass}
                    baseFarePrice={baseFarePrice}
                    altBaseFarePrice={altBaseFarePrice}
                    effectiveBaggage={effectiveBaggage}
                  />
                }
                color="white"
                overlayInnerStyle={{
                  color: '#444',
                  fontSize: 12,
                  padding: '8px 12px',
                  borderRadius: 8,
                }}
                getPopupContainer={() => document.body}
              >
                <span
                  className={`${styles.seatsLeftBadge} ${effectiveSeatsLeft[serviceClass] <= 2 ? styles.seatsLeftCritical : styles.seatsLeftWarning}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  Осталось {formatSeats(effectiveSeatsLeft[serviceClass])}
                </span>
              </Tooltip>
            )}
          </div>
        </div>
        <div className={styles.discountGroup}>
          {booked ? (
            <span className={styles.bookedBadge}>
              <span className={styles.bookedText}>
                Забронировано{bookedCount > 1 ? ` ${bookedCount}` : ''}
              </span>
              <CheckCircleFilled className={styles.bookedCheck} />
            </span>
          ) : hasDiscount ? (
            <>
              <span className={styles.discount}>-{discount}%</span>
              {showFlame && <Fire className={styles.fireIcon} />}
            </>
          ) : showLoneFlame ? (
            <Fire className={styles.fireIcon} />
          ) : null}
        </div>
      </div>

      <div className={styles.cardDetails}>
        <div className={styles.airlineCircleStack}>
          <AirlineCircle airline={flight.airline} size={40} />
          {hasCarrierChange && (
            <AirlineCircle airline={airlines[1]} size={40} className={styles.airlineLogoCircle2} />
          )}
        </div>

        <div className={styles.detailCol}>
          <span className={styles.detailMain}>{formatFlightDate(flight.date)}</span>
          <span className={styles.detailSub}>
            {flight.departureTime} – {flight.arrivalTime}
          </span>
        </div>

        <div className={styles.detailCol}>
          <span className={styles.detailMain}>{formatPassengers(passengersCount)}</span>
          <span className={styles.detailSub}>{classLabel}</span>
        </div>

        <div className={styles.detailCol}>
          <span className={styles.detailMain}>{baggageLabel}</span>
          <span className={styles.detailSub}>{flight.baggageWeight} кг</span>
        </div>

        <div className={styles.routeCol}>
          <div className={styles.route}>
            <span className={styles.routeCity}>{flight.originCity}</span>
            <Plane className={styles.routePlane} />
            <span className={styles.routeCity}>{flight.destinationCity}</span>
          </div>
        </div>
      </div>
    </button>
  );
};
