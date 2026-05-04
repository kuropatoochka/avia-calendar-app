import { CheckCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Fire, Plane } from '@/shared/assets';
import type { FlightDto, ServiceClass } from '@/shared/types';
import { CLASS_DELTAS, CLASS_NAMES } from '@/shared/types';
import { AirlineCircle } from '@/shared/ui';
import {
  formatFlightDate,
  formatPassengers,
  formatDuration,
  formatStops,
  formatSeats,
  getAirlines,
} from '@/shared/utils';
import styles from './styles.module.css';

const ALL_CLASSES: ServiceClass[] = ['economy', 'comfort', 'business', 'first'];

type SeatsLeft = FlightDto['seatsLeft'];

const PriceCell = ({ price }: { price: number }) => (
  <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
    {price.toLocaleString('ru-RU')}&nbsp;₽
  </span>
);

const getSeatsTooltip = (
  effectiveSeatsLeft: SeatsLeft,
  altSeatsLeft: SeatsLeft,
  serviceClass: ServiceClass,
  baseFarePrice: number,
  altBaseFarePrice: number,
  effectiveBaggage: boolean,
): React.ReactNode => {
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

  if (top3.length === 0) return 'Последние места на этот рейс';

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

type Props = {
  flight: FlightDto;
  passengersCount: number;
  bookedCount?: number;
  fareOverride?: boolean;
  serviceClass?: ServiceClass;
  onClick: () => void;
};

/** All IATA codes in route order */
const getAllCodes = (flight: FlightDto) => [
  flight.origin.toUpperCase(),
  ...(flight.stops?.map((s) => s.code) ?? []),
  flight.destination.toUpperCase(),
];

const getAllCities = (flight: FlightDto) => [
  flight.originCity,
  ...(flight.stops?.map((s) => s.city) ?? []),
  flight.destinationCity,
];

const StopsTooltip = ({ flight }: { flight: FlightDto }) => {
  const hasStops = (flight.stops?.length ?? 0) > 0;
  const allCodes = getAllCodes(flight);
  const allCities = getAllCities(flight);

  const legDurations: number[] = [];
  if (hasStops) {
    let flyingUsed = 0;
    flight.stops!.forEach((s) => {
      legDurations.push(s.legDurationMinutes);
      flyingUsed += s.legDurationMinutes;
    });
    const totalLayovers = flight.stops!.reduce((acc, s) => acc + s.durationMinutes, 0);
    legDurations.push(flight.duration - totalLayovers - flyingUsed);
  }

  return (
    <div className={styles.tooltipContent}>
      <p className={styles.tooltipDuration}>{formatDuration(flight.duration)} в пути</p>
      <div className={styles.tooltipCodesRow}>
        {allCodes.map((code, i) => (
          <span key={`code-${i}`} style={{ display: 'contents' }}>
            <span className={styles.tooltipCode}>{code}</span>
            {i < allCodes.length - 1 && (
              <div className={styles.tooltipSegment}>
                <div className={styles.tooltipSegmentLine} />
                <Plane className={styles.tooltipPlane} />
                <div className={styles.tooltipSegmentLine} />
                {hasStops && (
                  <span className={styles.tooltipLegDuration}>
                    {formatDuration(legDurations[i])}
                  </span>
                )}
              </div>
            )}
          </span>
        ))}
      </div>
      <div className={styles.tooltipCitiesRow}>
        {allCities.map((city, i) => (
          <span key={i} className={styles.tooltipCity}>
            {city}
          </span>
        ))}
      </div>
      {hasStops && (
        <div className={styles.tooltipStops}>
          {flight.stops!.map((stop) => (
            <p key={stop.code} className={styles.tooltipStopLine}>
              Пересадка: {stop.city}, {stop.airport} · {formatDuration(stop.durationMinutes)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
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
                title={getSeatsTooltip(
                  effectiveSeatsLeft,
                  altSeatsLeft,
                  serviceClass,
                  baseFarePrice,
                  altBaseFarePrice,
                  effectiveBaggage,
                )}
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
