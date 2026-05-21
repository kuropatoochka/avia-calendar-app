import { Collapse, Flex, Space, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { FlightFiltersState } from '@/features/flight-filters';
import {
  DEFAULT_FLIGHT_FILTERS,
  filterTicketGroups,
  FlightFilters as FlightFiltersSection,
  mapFiltersToTicketRequest,
  useCompaniesQuery,
} from '@/features/flight-filters';
import { useTicketsQuery } from '@/features/flight-list/model/use-tickets-query';
import { FlightList } from '@/features/flight-list/ui/flight-list';
import { useLaunchExperiment } from '@/features/launch-experiment';
import type {
  PriceDynamicsSearchParams,
  PriceDynamicsSelection,
} from '@/features/price-dynamics-chart';
import { PriceDynamicsContainer } from '@/features/price-dynamics-chart';
import type { TagId } from '@/features/recommendation-tags';
import {
  RecommendationTags,
  RecommendationTagsProvider,
  useRecommendationTags,
} from '@/features/recommendation-tags';
import { getRecommendationTagFilters } from '@/features/recommendation-tags/lib/get-recommendation-tag-filters';
import type { SearchFormValues } from '@/features/search-form';
import { SearchForm } from '@/features/search-form';
import { ArrowDown } from '@/shared/assets';
import type { TicketsRequest } from '@/shared/types';
import { cn } from '@/shared/utils';
import styles from './offer-page.module.css';

const DEFAULT_TICKETS_LIMIT = 100;

const DEFAULT_BAGGAGE_WEIGHT = 20;

const getPassengerCount = (params: PriceDynamicsSearchParams | null) => {
  if (!params) {
    return 1;
  }

  return params.passengersNumber + (params.childrenNumber ?? 0) + (params.toddlersNumber ?? 0);
};

const getDefaultBaggageWeights = (params: PriceDynamicsSearchParams | null) => {
  return Array.from({ length: getPassengerCount(params) }, () => DEFAULT_BAGGAGE_WEIGHT);
};

const OfferPageContent = () => {
  const [searchParams, setSearchParams] = useState<PriceDynamicsSearchParams | null>(null);
  const [selectedPriceDate, setSelectedPriceDate] = useState<PriceDynamicsSelection | null>(null);
  const [filterKey, setFilterKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState<FlightFiltersState | null>(null);
  const [priceDynamicsOpenKeys, setPriceDynamicsOpenKeys] = useState<string[]>(['price-dynamics']);

  const variant = useLaunchExperiment();
  const showRecommendationTags = variant === 'B';

  const { selectedTagIds } = useRecommendationTags();

  const handleRecommendationTagToggle = (tagId: TagId, selected: boolean) => {
    if (!showRecommendationTags) {
      return;
    }

    if (
      tagId !== 'morning_departure' &&
      tagId !== 'night_departure' &&
      tagId !== 'direct_flight' &&
      tagId !== 'baggage_included'
    ) {
      return;
    }

    setActiveFilters((prev) => {
      const nextFilters = prev ?? DEFAULT_FLIGHT_FILTERS;

      if (tagId === 'morning_departure' || tagId === 'night_departure') {
        return {
          ...nextFilters,
          departureTime: selected ? (tagId === 'morning_departure' ? 'morning' : 'night') : null,
        };
      }

      if (tagId === 'direct_flight') {
        return {
          ...nextFilters,
          stopsFilterType: selected ? 'direct' : null,
          maxStops: selected ? 0 : DEFAULT_FLIGHT_FILTERS.maxStops,
        };
      }

      if (tagId === 'baggage_included') {
        return {
          ...nextFilters,
          baggageEnabled: selected,
          baggageWeights: selected
            ? getDefaultBaggageWeights(searchParams)
            : DEFAULT_FLIGHT_FILTERS.baggageWeights,
          extraBaggageEntries: selected
            ? nextFilters.extraBaggageEntries
            : DEFAULT_FLIGHT_FILTERS.extraBaggageEntries,
        };
      }

      return nextFilters;
    });
  };

  const { ticketGroups, fetchTickets, resetTickets, isTicketsLoading, ticketsError } =
    useTicketsQuery();
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

  const filtersKey = useMemo(
    () => `${filterKey}-${JSON.stringify(activeFilters ?? DEFAULT_FLIGHT_FILTERS)}`,
    [filterKey, activeFilters],
  );

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
      ...(showRecommendationTags ? getRecommendationTagFilters(selectedTagIds) : {}),
    };

    void fetchTickets(request);
  }, [
    selectedPriceDate,
    activeFilters,
    searchParams,
    selectedTagIds,
    fetchTickets,
    showRecommendationTags,
  ]);

  const handleApplyFilters = (filters: FlightFiltersState) => {
    setActiveFilters(filters);
  };

  const handleShowFlights = (selection: PriceDynamicsSelection) => {
    setSelectedPriceDate(selection);
  };

  const handleSearch = (values: SearchFormValues) => {
    const {
      originAirport: originAirportId,
      destinationAirport: destinationAirportId,
      dateRange,
      tripType,
      serviceClass,
      passengers,
    } = values;

    const [dateFrom, dateTo] = dateRange;

    if (!dateFrom || !dateTo) {
      return;
    }

    const params: PriceDynamicsSearchParams = {
      airportFromId: Number(originAirportId),
      airportToId: Number(destinationAirportId),
      dateFrom: dateFrom.format('YYYY-MM-DD'),
      dateTo: dateTo.format('YYYY-MM-DD'),
      serviceClass,
      tripType,
      passengersNumber: passengers.adults,
      childrenNumber: passengers.children,
      toddlersNumber: passengers.toddler,
    };

    setSelectedPriceDate(null);
    resetTickets();
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
            {showRecommendationTags && (
              <RecommendationTags onTagToggle={handleRecommendationTagToggle} />
            )}

            <FlightList
              flights={visibleTicketGroups}
              isLoading={isTicketsLoading}
              error={ticketsError}
              isIdle={selectedPriceDate === null}
            />
          </Flex>

          <aside className={styles.filterWrapper}>
            <FlightFiltersSection
              key={filtersKey}
              filters={activeFilters}
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
