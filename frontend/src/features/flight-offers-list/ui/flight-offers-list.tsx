import type { FlightOffer } from '../model/types';
import { Spin } from 'antd';
import { FlightOfferCard } from './flight-offer-card';
import styles from './flight-offers-list.module.css';

type FlightOffersListProps = {
  offers: FlightOffer[];
  isLoading: boolean;
  error: string | null;
  hasRequested: boolean;
  resolveAirportLabel: (airportId: string) => string;
};

export const FlightOffersList = ({
  offers,
  isLoading,
  error,
  hasRequested,
  resolveAirportLabel,
}: FlightOffersListProps) => {
  if (!hasRequested) {
    return (
      <div className={styles.stateCard}>
        Выберите дату на графике и нажмите «Показать рейсы», чтобы увидеть предложения.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.stateCard}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return <div className={styles.stateCard}>{error}</div>;
  }

  if (!offers.length) {
    return <div className={styles.stateCard}>На выбранную дату нет предложений.</div>;
  }

  return (
    <div className={styles.list}>
      {offers.map((offer) => (
        <FlightOfferCard key={offer.id} offer={offer} resolveAirportLabel={resolveAirportLabel} />
      ))}
    </div>
  );
};
