import { Collapse, Flex, Space, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { FlightFiltersState } from '@/features/flight-filters';
import {
  filterTicketGroups,
  FlightFilters as FlightFiltersSection,
  mapFiltersToTicketRequest,
  useCompaniesQuery,
} from '@/features/flight-filters';
import { FlightList, useFlightsQuery } from '@/features/flight-list';
import type {
  PriceDynamicsSearchParams,
  PriceDynamicsSelection,
} from '@/features/price-dynamics-chart';
import { PriceDynamicsContainer } from '@/features/price-dynamics-chart';
import { RecommendationTags, RecommendationTagsProvider } from '@/features/recommendation-tags';
import type { SearchFormValues } from '@/features/search-form';
import { SearchForm } from '@/features/search-form';
import { ArrowDown } from '@/shared/assets';
import type { TicketItemDto, TicketsRequest } from '@/shared/types';
import { cn } from '@/shared/utils';
import styles from './offer-page.module.css';

const DEFAULT_TICKETS_LIMIT = 100;

const OfferPageContent = () => {
  const [searchParams, setSearchParams] = useState<PriceDynamicsSearchParams | null>(null);
  const [selectedPriceDate, setSelectedPriceDate] = useState<PriceDynamicsSelection | null>(null);
  const [filterKey, setFilterKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState<FlightFiltersState | null>(null);
  const [ticketGroups, setTicketGroups] = useState<TicketItemDto[][]>([]);
  const [priceDynamicsOpenKeys, setPriceDynamicsOpenKeys] = useState<string[]>(['price-dynamics']);

  const { fetchFlights, isFlightsLoading, flightsError } = useFlightsQuery();
  const { companies } = useCompaniesQuery();

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: company.id,
        label: company.name,
      })),
    [companies],
  );

  const visibleTicketGroups = useMemo(
    () => filterTicketGroups(ticketGroups, activeFilters),
    [ticketGroups, activeFilters],
  );

  console.log('[FRONT] visible tickets', {
    raw: ticketGroups.length,
    visible: visibleTicketGroups.length,
    stops: visibleTicketGroups.map((group) => group.length - 1),
    durations: visibleTicketGroups.map((group) =>
      group.reduce((sum, ticket) => sum + ticket.duration, 0),
    ),
  });

  useEffect(() => {
    if (!selectedPriceDate || !searchParams) {
      return;
    }

    const request: TicketsRequest = {
      airport_from: selectedPriceDate.airportFromId,
      airport_to: selectedPriceDate.airportToId,
      date: selectedPriceDate.date,
      service_class: searchParams.serviceClass,
      passengers_number: searchParams.passengersNumber,
      children_number: searchParams.childrenNumber ?? 0,
      todlers_number: searchParams.toddlersNumber ?? 0,
      offset: 0,
      limit: DEFAULT_TICKETS_LIMIT,
      ...(activeFilters ? mapFiltersToTicketRequest(activeFilters) : {}),
    };

    fetchFlights(request).then((data) => {
      if (data) {
        setTicketGroups(data.items);
      }
    });
  }, [selectedPriceDate, activeFilters, searchParams, fetchFlights]);

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
      passengersNumber: passengers.adults,
      childrenNumber: passengers.children,
      toddlersNumber: passengers.toddler,
    };

    setSelectedPriceDate(null);
    setTicketGroups([]);
    setActiveFilters(null);
    setSearchParams(params);
    setFilterKey((key) => key + 1);
  };

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

        <div className={styles.columns}>
          <Flex component="main" gap={24} vertical className={styles.resultsColumn}>
            <RecommendationTags />

            <FlightList
              flights={visibleTicketGroups}
              isLoading={isFlightsLoading}
              error={flightsError}
              isIdle={selectedPriceDate === null}
            />
          </Flex>

          <aside className={styles.filterWrapper}>
            <FlightFiltersSection
              key={filterKey}
              onApply={handleApplyFilters}
              companyOptions={companyOptions}
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
