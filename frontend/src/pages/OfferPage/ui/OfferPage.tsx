import { SearchForm } from '@/features/search-form';
import { FlightFilters } from '@/features/flight-filters';
import { TitleBlock } from './TitleBlock';
import styles from './styles.module.css';

const OfferPage = () => {
  return (
    <>
      <TitleBlock />
      <SearchForm />
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
