import { CheckCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Fire } from '@/shared/assets';
import type { FlightDto, ServiceClass } from '@/shared/types';
import { formatSeats, formatStops } from '@/shared/utils';
import { SeatsTooltip } from './SeatsTooltip';
import { StopsTooltip } from './StopsTooltip';
import styles from './styles.module.css';

type Props = {
  flight: FlightDto;
  effectivePrice: number;
  effectiveOriginalPrice: number;
  hasDiscount: boolean;
  discount: number;
  showFlame: boolean;
  showLoneFlame: boolean;
  booked: boolean;
  bookedCount: number;
  passengersCount: number;
  serviceClass: ServiceClass;
  effectiveSeatsLeft: FlightDto['seatsLeft'];
  altSeatsLeft: FlightDto['seatsLeft'];
  baseFarePrice: number;
  altBaseFarePrice: number;
  effectiveBaggage: boolean;
};

export const FlightCardPriceRow = ({
  flight,
  effectivePrice,
  effectiveOriginalPrice,
  hasDiscount,
  discount,
  showFlame,
  showLoneFlame,
  booked,
  bookedCount,
  passengersCount,
  serviceClass,
  effectiveSeatsLeft,
  altSeatsLeft,
  baseFarePrice,
  altBaseFarePrice,
  effectiveBaggage,
}: Props) => {
  const displayCount = booked ? bookedCount : passengersCount;
  const totalPrice = effectivePrice * displayCount;
  const totalOriginalPrice = effectiveOriginalPrice * displayCount;

  return (
    <div className={styles.cardRow}>
      <div className={styles.priceGroup}>
        <span className={styles.price}>{totalPrice.toLocaleString('ru-RU')} ₽</span>
        {hasDiscount && (
          <span className={styles.originalPrice}>
            {totalOriginalPrice.toLocaleString('ru-RU')} ₽
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
  );
};
