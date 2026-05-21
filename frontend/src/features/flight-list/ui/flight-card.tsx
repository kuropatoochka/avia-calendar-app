import type { FlightCardViewModel } from '../model/types';
import styles from './flight-list.module.css';

type Props = {
  flight: FlightCardViewModel;
  onClick?: () => void;
};

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const formatTime = (time: string) => {
  return time.slice(0, 5);
};

const formatDate = (date: string) => {
  return dateFormatter.format(new Date(date));
};

const formatDuration = (durationMinutes: number) => {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} мин`;
  }

  if (minutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${minutes} мин`;
};

const formatStops = (stopsCount: number) => {
  if (stopsCount === 0) {
    return 'Прямой рейс';
  }

  if (stopsCount === 1) {
    return '1 пересадка';
  }

  return `${stopsCount} пересадки`;
};

export const FlightCard = ({ flight, onClick }: Props) => {
  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className={styles.cardTop}>
        <div className={styles.priceBlock}>
          <span className={styles.price}>{priceFormatter.format(flight.price)}</span>
          <span className={styles.priceCaption}>за всех пассажиров</span>
        </div>

        <span className={flight.stopsCount === 0 ? styles.directBadge : styles.transferBadge}>
          {formatStops(flight.stopsCount)}
        </span>
      </div>

      <div className={styles.cardMain}>
        <div className={styles.timeBlock}>
          <span className={styles.time}>{formatTime(flight.departureTime)}</span>
          <span className={styles.airport}>{flight.airportFrom}</span>
          <span className={styles.city}>{flight.cityFrom}</span>
        </div>

        <div className={styles.routeBlock}>
          <span className={styles.duration}>{formatDuration(flight.duration)}</span>

          <div className={styles.routeLine}>
            <span className={styles.routeDot} />
            <span className={styles.routeDash} />
            <span className={styles.routeDot} />
          </div>

          <span className={styles.date}>
            {formatDate(flight.departureDate)}
            {flight.arrivalDate !== flight.departureDate && ` — ${formatDate(flight.arrivalDate)}`}
          </span>
        </div>

        <div className={styles.timeBlockRight}>
          <span className={styles.time}>{formatTime(flight.arrivalTime)}</span>
          <span className={styles.airport}>{flight.airportTo}</span>
          <span className={styles.city}>{flight.cityTo}</span>
        </div>
      </div>

      <div className={styles.cardBottom}>
        <span>{flight.companyNames.join(', ')}</span>
        <span>{flight.planeTypes.join(', ')}</span>
      </div>
    </article>
  );
};
