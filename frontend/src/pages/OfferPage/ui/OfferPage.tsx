import { FlightFilters } from '@/features/flight-filters';
import { TitleBlock } from './TitleBlock';
import styles from './styles.module.css';

const OfferPage = () => {
  return (
    <>
      <TitleBlock />
      <div className={styles.columns}>
        <div className={styles.results} />
        <aside className={styles.filterWrapper}>
          <FlightFilters />
        </aside>
      </div>
    </>
  );
};

export default OfferPage;
