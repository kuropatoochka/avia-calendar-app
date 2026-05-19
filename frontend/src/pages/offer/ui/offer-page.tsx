import { Collapse, Flex, Space, Spin, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import type { FlightFiltersState } from '@/features/flight-filters';
import { FlightFilters as FlightFiltersSection } from '@/features/flight-filters';
import { FlightList, useFlightsQuery } from '@/features/flight-list';
import type {
  PriceDynamicsSearchParams,
  PriceDynamicsSelection,
} from '@/features/price-dynamics-chart';
import { PriceDynamicsContainer } from '@/features/price-dynamics-chart';
import {
  RecommendationTags,
  RecommendationTagsProvider,
  useTagFilter,
} from '@/features/recommendation-tags';
import type { SearchFormValues } from '@/features/search-form';
import { SearchForm } from '@/features/search-form';
import { ArrowDown } from '@/shared/assets';
import type {
  FlightDto,
  FlightFilters as FlightFiltersRequest,
  FlightsRequest,
} from '@/shared/types';
import { cn } from '@/shared/utils';
import styles from './offer-page.module.css';

const OfferPageContent = () => {
  const [searchParams, setSearchParams] = useState<PriceDynamicsSearchParams | null>(null);
  const [selectedPriceDate, setSelectedPriceDate] = useState<PriceDynamicsSelection | null>(null);
  const [filterKey, setFilterKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState<FlightFiltersState | null>(null);
  const [rawFlights, setRawFlights] = useState<FlightDto[]>([]);
  const [priceDynamicsOpenKeys, setPriceDynamicsOpenKeys] = useState<string[]>(['price-dynamics']);

  const { fetchFlights, isFlightsLoading, flightsError } = useFlightsQuery();
  const { filterFlights } = useTagFilter();

  const mapFiltersToRequest = useCallback(
    (filters: FlightFiltersState): FlightFiltersRequest => ({
      maxStops: filters.maxStops,
      stopDurationRange: filters.maxStops > 0 ? filters.stopDurationRange : undefined,
      maxFlightDuration: filters.maxFlightDuration,
      departureTimes: filters.departureTimes,
      arrivalTimes: filters.arrivalTimes,
      maxPrice: filters.maxPrice < 200_000 ? filters.maxPrice : undefined,
      baggageEnabled: filters.baggageEnabled,
      baggageWeights: filters.baggageEnabled ? filters.baggageWeights : undefined,
      extraBaggageEntries:
        filters.baggageEnabled && filters.extraBaggageEntries.length > 0
          ? filters.extraBaggageEntries
          : undefined,
      airlines: filters.airlines.length > 0 ? filters.airlines : undefined,
      petsEnabled: filters.petsEnabled,
      animalCount: filters.petsEnabled ? filters.animalCount : undefined,
      animalWeights: filters.petsEnabled ? filters.animalWeights : undefined,
    }),
    [],
  );

  useEffect(() => {
    if (!selectedPriceDate || !searchParams) {
      return;
    }

    const request: FlightsRequest = {
      originAirportId: selectedPriceDate.airportFromId,
      destinationAirportId: selectedPriceDate.airportToId,
      date: selectedPriceDate.date,
      serviceClass: searchParams.serviceClass,
      passengers: {
        adults: searchParams.passengersNumber,
        children: searchParams.childrenNumber ?? 0,
        toddler: searchParams.toddlersNumber ?? 0,
        animals: 0,
      },
      filters: activeFilters ? mapFiltersToRequest(activeFilters) : undefined,
    };

    fetchFlights(request).then((data) => {
      if (data) {
        setRawFlights(data);
      }
    });
  }, [selectedPriceDate, activeFilters, searchParams, fetchFlights, mapFiltersToRequest]);

  const handleApplyFilters = (filters: FlightFiltersState) => {
    setActiveFilters(filters);
  };

  const handleShowFlights = (selection: PriceDynamicsSelection) => {
    setSelectedPriceDate(selection);
  };

  const handleSearch = (values: SearchFormValues) => {
    const { originAirportId, destinationAirportId, dateRange, tripType, serviceClass, passengers } =
      values;

    const [dateFrom, dateTo] = dateRange;

    if (!dateFrom || !dateTo) {
      return;
    }

    const params: PriceDynamicsSearchParams = {
      airportFromId: originAirportId,
      airportToId: destinationAirportId,
      dateFrom: dateFrom.format('YYYY-MM-DD'),
      dateTo: dateTo.format('YYYY-MM-DD'),
      serviceClass,
      tripType,
      passengersNumber: passengers.adults + passengers.animals,
      childrenNumber: passengers.children,
      toddlersNumber: passengers.toddler,
    };

    setSelectedPriceDate(null);
    setRawFlights([]);
    setSearchParams(params);
    setFilterKey((k) => k + 1);
  };

  const filteredFlights = filterFlights(rawFlights);

  return (
    <div className={styles.page}>
      <Flex vertical gap={32}>
        <Space orientation="vertical" size={8}>
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
          ghost
          collapsible="disabled"
          expandIconPlacement="end"
          items={[
            {
              key: 'price-dynamics',
              label: <Typography.Title level={2}>График цен</Typography.Title>,
              children: (
                <PriceDynamicsContainer params={searchParams} onSelect={handleShowFlights} />
              ),
            },
          ]}
        />

        <RecommendationTags />

        <div className={styles.columns}>
          <FlightList
            flights={filteredFlights}
            isLoading={isFlightsLoading}
            error={flightsError}
            isIdle={selectedPriceDate === null}
          />

          <aside className={styles.filterWrapper}>
            <FlightFiltersSection
              key={filterKey}
              onApply={handleApplyFilters}
              passengers={
                searchParams
                  ? {
                      adults: searchParams.passengersNumber,
                      children: searchParams?.childrenNumber ?? 0,
                      toddler: searchParams?.toddlersNumber ?? 0,
                    }
                  : undefined
              }
            />
          </aside>

          {/* Flight results will be rendered here once FlightResultsBlock is built */}
          {isFlightsLoading && <Spin />}
        </div>
      </Flex>
    </div>
  );
};

const OfferPage = () => (
  <RecommendationTagsProvider>
    <OfferPageContent />
  </RecommendationTagsProvider>
);

export default OfferPage;
