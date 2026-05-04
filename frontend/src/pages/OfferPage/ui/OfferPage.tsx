import { useState } from 'react';
import { FlightFiltersProvider } from '@/features/flight-filters';
import { FlightResultsBlock } from '@/features/flight-results';
import type { FlightsRequest } from '@/shared/types/api';
import { TitleBlock } from './TitleBlock';
import styles from './styles.module.css';

const DEFAULT_SEARCH_PARAMS: FlightsRequest = {
  origin: 'svo',
  destination: 'led',
  date: '2026-05-01',
  passengers: { adults: 1 },
};

const OfferPage = () => {
  const [searchParams, setSearchParams] = useState<FlightsRequest>(DEFAULT_SEARCH_PARAMS);

  const handleDateChange = (date: string) => {
    setSearchParams(prev => ({ ...prev, date }));
  };

  return (
    // FlightFiltersProvider makes filter state available to both
    // <FlightFilters /> (Feature 5) and <FlightResultsBlock /> (Feature 9)
    // when Feature 5 is placed on this page.
    <FlightFiltersProvider>
      <div className={styles.page}>
        <TitleBlock />
        {/* Feature 4 (search form) mounts here */}
        {/* Feature 5 (filters) mounts here */}
        {/* Feature 7 (calendar) mounts here */}
        <FlightResultsBlock
          searchParams={searchParams}
          onDateChange={handleDateChange}
        />
      </div>
    </FlightFiltersProvider>
  );
};

export default OfferPage;
