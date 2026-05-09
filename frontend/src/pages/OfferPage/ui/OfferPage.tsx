import { FlightFilters, FlightFiltersProvider } from '@/features/flight-filters';
import { FlightResultsBlock } from '@/features/flight-results';
import { SearchForm } from '@/features/search-form';
import type { FlightsRequest } from '@/shared/types';
import styles from './styles.module.css';
import { TitleBlock } from './TitleBlock';

const DEFAULT_SEARCH_PARAMS: FlightsRequest = {
  origin: 'svo',
  destination: 'led',
  date: '2026-05-01',
  passengers: { adults: 1 },
};

const OfferPage = () => (
  <FlightFiltersProvider>
    <TitleBlock />
    <SearchForm />
    <div className={styles.columns}>
      <div className={styles.results}>
        <FlightResultsBlock searchParams={DEFAULT_SEARCH_PARAMS} />
      </div>
      <aside className={styles.filterWrapper}>
        <FlightFilters />
      </aside>
    </div>
  </FlightFiltersProvider>
);

export default OfferPage;
