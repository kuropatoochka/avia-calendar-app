import { FlightFilters } from '@/features/flight-filters';
import { TitleBlock } from './TitleBlock';
import styles from './styles.module.css';

const OfferPage = () => {
  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        <TitleBlock />
      </div>
      <aside className={styles.sidebar}>
        <FlightFilters />
      </aside>
    </div>
  );
};

export default OfferPage;
