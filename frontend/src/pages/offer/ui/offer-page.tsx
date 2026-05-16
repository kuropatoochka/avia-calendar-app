import { Collapse, Flex, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import type { FlightFiltersState } from '@/features/flight-filters';
import { FlightFilters as FlightFiltersSection } from '@/features/flight-filters';
import type { PriceDynamicsSelection } from '@/features/price-dynamics-chart/ui/PriceDynamicsWrapper';
import {
  PriceDynamicsBlock,
  PriceDynamicsPlaceholder,
} from '@/features/price-dynamics-chart/ui/PriceDynamicsWrapper';
import type { SearchFormValues } from '@/features/search-form';
import {
  DEFAULT_DESTINATION_AIRPORT,
  DEFAULT_ORIGIN_AIRPORT,
  SearchForm,
} from '@/features/search-form';
import { airportMock } from '@/shared/api';
import { ArrowDown } from '@/shared/assets';
import type { FlightFilters as FlightFiltersRequest, PriceDynamicsRequest } from '@/shared/types';
import { cn } from '@/shared/utils';
import styles from './offer-page.module.css';

type PriceDynamicsChartConfig = {
  label: string;
  params: PriceDynamicsRequest;
  originLabel: string;
  destinationLabel: string;
};

type ActiveSearchState = {
  baseParams: PriceDynamicsRequest;
  tripType: SearchFormValues['tripType'];
  originLabel: string;
  destinationLabel: string;
};

const DEFAULT_AIRPORTS = [DEFAULT_ORIGIN_AIRPORT, DEFAULT_DESTINATION_AIRPORT];

const OfferPage = () => {
  const [activeSearch, setActiveSearch] = useState<ActiveSearchState | null>(null);
  const [activeFilters, setActiveFilters] = useState<FlightFiltersState | null>(null);
  const [priceDynamicsOpenKeys, setPriceDynamicsOpenKeys] = useState<string[]>(['price-dynamics']);

  const airportLookup = useMemo(() => {
    const entries = [...airportMock, ...DEFAULT_AIRPORTS];

    return new Map(entries.map((airport) => [airport.id, airport]));
  }, []);

  const getAirportLabel = (airportId: string) => {
    return airportLookup.get(airportId)?.airport ?? airportId.toUpperCase();
  };

  const mapFiltersToRequest = (filters: FlightFiltersState): FlightFiltersRequest => ({
    maxStops: filters.maxStops,
    stopDurationRange: filters.maxStops > 0 ? filters.stopDurationRange : undefined,
    maxFlightDuration: filters.maxFlightDuration,
    departureTimes: filters.departureTimes,
    arrivalTimes: filters.arrivalTimes,
    pricePerPassenger: filters.pricePerPassenger,
    priceRange: filters.priceRange,
    baggageEnabled: filters.baggageEnabled,
    baggageForAll: filters.baggageEnabled ? filters.baggageForAll : undefined,
    baggageWeights: filters.baggageEnabled ? filters.baggageWeights : undefined,
    airlines: filters.airlines.length > 0 ? filters.airlines : undefined,
    petsEnabled: filters.petsEnabled,
    animalCount: filters.petsEnabled ? filters.animalCount : undefined,
    animalWeights: filters.petsEnabled ? filters.animalWeights : undefined,
  });

  const handleSearch = (values: SearchFormValues) => {
    const [dateFrom, dateTo] = values.dateRange;
    const [originAirportId, destinationAirportId] = [
      values.originAirport,
      values.destinationAirport,
    ];

    if (!dateFrom || !dateTo || originAirportId === destinationAirportId) {
      setActiveSearch(null);
      return;
    }

    const baseParams: PriceDynamicsRequest = {
      originAirportId,
      destinationAirportId,
      dateFrom: dateFrom.format('YYYY-MM-DD'),
      dateTo: dateTo.format('YYYY-MM-DD'),
      passengers: {
        adults: values.passengers.adults,
        children: values.passengers.children,
        toddler: values.passengers.toddler,
        animals: values.passengers.animals,
      },
      serviceClass: values.serviceClass,
    };

    setActiveSearch({
      baseParams,
      tripType: values.tripType,
      originLabel: getAirportLabel(values.originAirport),
      destinationLabel: getAirportLabel(values.destinationAirport),
    });
  };

  const handleApplyFilters = (filters: FlightFiltersState) => {
    setActiveFilters(filters);
  };

  const priceDynamicsCharts = useMemo<PriceDynamicsChartConfig[] | null>(() => {
    if (!activeSearch) {
      return null;
    }

    const charts: PriceDynamicsChartConfig[] = [
      {
        label: 'Туда',
        params: activeSearch.baseParams,
        originLabel: activeSearch.originLabel,
        destinationLabel: activeSearch.destinationLabel,
      },
    ];

    if (activeSearch.tripType === 'roundTrip') {
      charts.push({
        label: 'Обратно',
        params: {
          ...activeSearch.baseParams,
          originAirportId: activeSearch.baseParams.destinationAirportId,
          destinationAirportId: activeSearch.baseParams.originAirportId,
        },
        originLabel: activeSearch.destinationLabel,
        destinationLabel: activeSearch.originLabel,
      });
    }

    return charts;
  }, [activeSearch]);

  const handleShowFlights = (selection: PriceDynamicsSelection) => {
    console.log('Show flights for selected date', {
      direction: selection.direction,
      date: selection.date,
      baseSearchParams: activeSearch?.baseParams,
      filters: activeFilters ? mapFiltersToRequest(activeFilters) : undefined,
    });
  };

  return (
    <div className={styles.page}>
      <Flex vertical gap={32}>
        <Space direction="vertical" size={8}>
          <Typography.Title>Куда летим?</Typography.Title>
          <Typography.Paragraph type="secondary">
            Да хоть куда, лишь бы подешевле...
          </Typography.Paragraph>
        </Space>

        <SearchForm onSearch={handleSearch} />

        <Collapse
          className={styles.collapse}
          bordered={false}
          activeKey={priceDynamicsOpenKeys}
          onChange={(key) => {
            setPriceDynamicsOpenKeys(Array.isArray(key) ? key : key ? [key] : []);
          }}
          expandIcon={({ isActive }) => (
            <ArrowDown className={cn(styles.collapseArrow, isActive && styles.collapseArrowOpen)} />
          )}
          items={[
            {
              key: 'price-dynamics',
              label: (
                <Typography.Title level={4} className={styles.sectionTitle}>
                  Динамика цен
                </Typography.Title>
              ),
              children: (
                <div className={styles.collapseBody}>
                  {priceDynamicsCharts ? (
                    <PriceDynamicsBlock
                      sections={priceDynamicsCharts}
                      onShowFlights={handleShowFlights}
                    />
                  ) : (
                    <PriceDynamicsPlaceholder />
                  )}
                </div>
              ),
            },
          ]}
        />

        <div className={styles.columns}>
          <aside className={styles.filterWrapper}>
            <FlightFiltersSection
              onApply={handleApplyFilters}
              passengerCount={
                activeSearch
                  ? activeSearch.baseParams.passengers.adults +
                    activeSearch.baseParams.passengers.children
                  : 1
              }
            />
          </aside>
        </div>
      </Flex>
    </div>
  );
};

export default OfferPage;
