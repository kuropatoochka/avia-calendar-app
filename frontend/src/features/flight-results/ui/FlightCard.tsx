import type { FlightDto, ServiceClass } from '@/shared/types';
import { getAirlines } from '@/shared/utils';
import { CLASS_DELTAS, CLASS_NAMES } from '../lib/consts';
import { FlightCardDetailsRow } from './FlightCardDetailsRow';
import { FlightCardPriceRow } from './FlightCardPriceRow';
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
  const effectiveSeatsLeft = fareOverride ? flight.seatsLeftAlt : flight.seatsLeft;
  const altSeatsLeft = fareOverride ? flight.seatsLeft : flight.seatsLeftAlt;
  const altBaseFarePrice = fareOverride
    ? flight.price
    : flight.baggageIncluded
      ? flight.price - 2500
      : flight.price + 2500;
  const classLabel = CLASS_NAMES[serviceClass];
  const airlines = getAirlines(flight);

  return (
    <button className={`${styles.card} ${booked ? styles.cardBooked : ''}`} onClick={onClick}>
      <FlightCardPriceRow
        flight={flight}
        effectivePrice={effectivePrice}
        effectiveOriginalPrice={effectiveOriginalPrice}
        hasDiscount={hasDiscount}
        discount={discount}
        showFlame={showFlame}
        showLoneFlame={showLoneFlame}
        booked={booked}
        bookedCount={bookedCount}
        passengersCount={passengersCount}
        serviceClass={serviceClass}
        effectiveSeatsLeft={effectiveSeatsLeft}
        altSeatsLeft={altSeatsLeft}
        baseFarePrice={baseFarePrice}
        altBaseFarePrice={altBaseFarePrice}
        effectiveBaggage={effectiveBaggage}
      />
      <FlightCardDetailsRow
        flight={flight}
        passengersCount={passengersCount}
        classLabel={classLabel}
        effectiveBaggage={effectiveBaggage}
        airlines={airlines}
      />
    </button>
  );
};
