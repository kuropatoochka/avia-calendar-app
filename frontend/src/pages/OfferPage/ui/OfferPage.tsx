import { FlightFilters } from '@/features/flight-filters';
import { SearchForm } from '@/features/search-form';
import styles from './styles.module.css';
import { TitleBlock } from './TitleBlock';

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
