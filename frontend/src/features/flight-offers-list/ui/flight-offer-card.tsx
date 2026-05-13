import type { FlightOffer } from '../model/types';
import styles from './flight-offer-card.module.css';

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const serviceClassLabels: Record<FlightOffer['serviceClass'], string> = {
  economy: 'Эконом',
  comfort: 'Комфорт',
  business: 'Бизнес',
  first: 'Первый класс',
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}ч ${mins}м`;
};

type FlightOfferCardProps = {
  offer: FlightOffer;
  resolveAirportLabel: (airportId: string) => string;
};

export const FlightOfferCard = ({ offer, resolveAirportLabel }: FlightOfferCardProps) => {
  const originName = resolveAirportLabel(offer.originAirportId);
  const destinationName = resolveAirportLabel(offer.destinationAirportId);
  const stopsLabel = offer.stopsCount === 0 ? 'Без пересадок' : `Пересадок: ${offer.stopsCount}`;
  const baggageLabel = offer.baggageIncluded ? 'Багаж включен' : 'Без багажа';

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.airline}>{offer.airline}</p>
          <p className={styles.route}>{`${originName} - ${destinationName}`}</p>
        </div>
        <p className={styles.price}>{priceFormatter.format(offer.price)}</p>
      </div>
      <div className={styles.timesRow}>
        <div className={styles.timeBlock}>
          <span className={styles.time}>{offer.departureTime}</span>
          <span className={styles.airport}>{originName}</span>
        </div>
        <div className={styles.timeDivider} />
        <div className={styles.timeBlock}>
          <span className={styles.time}>{offer.arrivalTime}</span>
          <span className={styles.airport}>{destinationName}</span>
        </div>
      </div>
      <div className={styles.metaRow}>
        <span>{formatDuration(offer.duration)}</span>
        <span>{stopsLabel}</span>
        <span>{baggageLabel}</span>
        <span>{serviceClassLabels[offer.serviceClass]}</span>
      </div>
    </article>
  );
};
