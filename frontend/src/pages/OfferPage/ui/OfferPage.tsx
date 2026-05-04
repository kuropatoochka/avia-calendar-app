import { FlightFiltersProvider } from '@/features/flight-filters';
import { FlightResultsBlock } from '@/features/flight-results';
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
  // FlightFiltersProvider makes filter state available to both
  // <FlightFilters /> (Feature 5) and <FlightResultsBlock /> (Feature 9)
  // when Feature 5 is placed on this page.
  <FlightFiltersProvider>
    <div className={styles.page}>
      <TitleBlock />
      {/* Feature 4 (search form) mounts here */}
      {/* Feature 5 (filters) mounts here */}
      {/* Feature 7 (calendar) mounts here */}
      <FlightResultsBlock searchParams={DEFAULT_SEARCH_PARAMS} />
    </div>
  </FlightFiltersProvider>
);

export default OfferPage;
