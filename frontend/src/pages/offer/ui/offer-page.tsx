import { Flex, Space, Typography } from 'antd';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { FlightFiltersState } from '@/features/flight-filters';
import {
  DEFAULT_FLIGHT_FILTERS,
  filterTicketGroups,
  FlightFilters as FlightFiltersSection,
  getActiveFiltersCount,
  mapFiltersToTicketRequest,
  useCompaniesQuery,
} from '@/features/flight-filters';
import type { FlightBookingPayload } from '@/features/flight-list';
import { FlightList, useTicketsQuery } from '@/features/flight-list';
import {
  Experiment,
  Goal,
  trackExperimentEvent,
  useLaunchExperiment,
} from '@/features/launch-experiment';
import type {
  PriceDynamicsSearchParams,
  PriceDynamicsSelection,
} from '@/features/price-dynamics-chart';
import { PriceDynamicsContainer } from '@/features/price-dynamics-chart';
import type { TagId } from '@/features/recommendation-tags';
import { RecommendationTags, RecommendationTagsProvider } from '@/features/recommendation-tags';
import type { SearchFormValues } from '@/features/search-form';
import { SearchForm } from '@/features/search-form';
import type { TicketItemDto, TicketsRequest } from '@/shared/types';
import styles from './offer-page.module.css';

const DEFAULT_TICKETS_LIMIT = 100;
const DEFAULT_BAGGAGE_WEIGHT = 20;
const PRICE_TAG_MAX = 5_000;
const AEROFLOT_COMPANY_NAME = 'Аэрофлот';

type BuildTicketsRequestParams = {
  offset: number;
  selectedDate?: PriceDynamicsSelection | null;
  params?: PriceDynamicsSearchParams | null;
  filters?: FlightFiltersState | null;
};

type AdditionalFiltersApplySource = 'panel' | 'tag';

const getPassengerCount = (params: PriceDynamicsSearchParams | null) => {
  if (!params) {
    return 1;
  }

  return params.passengersNumber + (params.childrenNumber ?? 0) + (params.toddlersNumber ?? 0);
};

const getDefaultBaggageWeights = (params: PriceDynamicsSearchParams | null) => {
  return Array.from({ length: getPassengerCount(params) }, () => DEFAULT_BAGGAGE_WEIGHT);
};

const isSupportedRecommendationTag = (tagId: TagId) => {
  return (
    tagId === 'morning_departure' ||
    tagId === 'night_departure' ||
    tagId === 'direct_flight' ||
    tagId === 'baggage_included' ||
    tagId === 'price_up_to_5000' ||
    tagId === 'airline_aeroflot'
  );
};

const OfferPageContent = () => {
  const [searchParams, setSearchParams] = useState<PriceDynamicsSearchParams | null>(null);
  const [selectedPriceDate, setSelectedPriceDate] = useState<PriceDynamicsSelection | null>(null);
  const [filterKey, setFilterKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState<FlightFiltersState | null>(null);
  const [ticketGroups, setTicketGroups] = useState<TicketItemDto[][]>([]);
  const [ticketsTotal, setTicketsTotal] = useState(0);

  const priceDynamicsRef = useRef<HTMLDivElement | null>(null);

  const variant = useLaunchExperiment();
  const showRecommendationTags = variant === 'B';

  const { fetchTickets, fetchMoreTickets, isTicketsLoading, isLoadingMore, ticketsError } =
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

  const filtersKey = useMemo(
    () => `${filterKey}-${JSON.stringify(activeFilters ?? DEFAULT_FLIGHT_FILTERS)}`,
    [filterKey, activeFilters],
  );

  const bookingDetails = useMemo(() => {
    if (!searchParams) {
      return null;
    }

    const filters = activeFilters ?? DEFAULT_FLIGHT_FILTERS;

    return {
      serviceClass: searchParams.serviceClass,
      passengers: {
        adults: searchParams.passengersNumber,
        children: searchParams.childrenNumber ?? 0,
        toddler: searchParams.toddlersNumber ?? 0,
      },
      baggage: {
        enabled: filters.baggageEnabled,
        weights: filters.baggageWeights,
      },
    };
  }, [searchParams, activeFilters]);

  const trackAdditionalFiltersApply = useCallback(
    (source: AdditionalFiltersApplySource, activeFiltersCount: number) => {
      if (!selectedPriceDate?.searchViewId) {
        return;
      }

      trackExperimentEvent({
        goal: Goal.AdditionalFiltersApply,
        experiment: Experiment.RecommendationTags,
        variant,
        params: {
          search_view_id: selectedPriceDate.searchViewId,
          source,
          active_filters_count: activeFiltersCount,
        },
      });
    },
    [selectedPriceDate, variant],
  );

  const buildTicketsRequest = useCallback(
    ({
      offset,
      selectedDate = selectedPriceDate,
      params = searchParams,
      filters = activeFilters,
    }: BuildTicketsRequestParams): TicketsRequest | null => {
      if (!selectedDate || !params) {
        return null;
      }

      return {
        airport_from: selectedDate.airportFromId,
        airport_to: selectedDate.airportToId,
        date: selectedDate.date,
        service_class: params.serviceClass,
        passengers_number: params.passengersNumber,
        children_number: params.childrenNumber ?? 0,
        todlers_number: params.toddlersNumber ?? 0,
        offset,
        limit: DEFAULT_TICKETS_LIMIT,
        ...(filters ? mapFiltersToTicketRequest(filters) : {}),
      };
    },
    [activeFilters, searchParams, selectedPriceDate],
  );

  const loadFirstTicketsPage = useCallback(
    async (request: TicketsRequest | null) => {
      setTicketGroups([]);
      setTicketsTotal(0);

      if (!request) {
        return;
      }

      const data = await fetchTickets(request);

      if (!data) {
        return;
      }

      setTicketGroups(data.items);
      setTicketsTotal(data.total);
    },
    [fetchTickets],
  );

  const handleRecommendationTagToggle = (tagId: TagId, selected: boolean) => {
    if (!showRecommendationTags || !isSupportedRecommendationTag(tagId)) {
      return;
    }

    const nextFilters = activeFilters ?? DEFAULT_FLIGHT_FILTERS;

    let updatedFilters: FlightFiltersState = nextFilters;

    if (tagId === 'morning_departure' || tagId === 'night_departure') {
      updatedFilters = {
        ...nextFilters,
        departureTime: selected ? (tagId === 'morning_departure' ? 'morning' : 'night') : null,
      };
    }

    if (tagId === 'direct_flight') {
      updatedFilters = {
        ...nextFilters,
        stopsFilterType: selected ? 'direct' : null,
        maxStops: selected ? 0 : DEFAULT_FLIGHT_FILTERS.maxStops,
      };
    }

    if (tagId === 'baggage_included') {
      updatedFilters = {
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

    if (tagId === 'price_up_to_5000') {
      updatedFilters = {
        ...nextFilters,
        maxPrice: selected ? PRICE_TAG_MAX : DEFAULT_FLIGHT_FILTERS.maxPrice,
      };
    }

    if (tagId === 'airline_aeroflot') {
      const aeroflotCompany = companies.find((company) => company.name === AEROFLOT_COMPANY_NAME);

      if (!aeroflotCompany) {
        return;
      }

      updatedFilters = {
        ...nextFilters,
        airlines: selected ? [aeroflotCompany.id] : DEFAULT_FLIGHT_FILTERS.airlines,
      };
    }

    setActiveFilters(updatedFilters);

    const request = buildTicketsRequest({
      offset: 0,
      filters: updatedFilters,
    });

    trackAdditionalFiltersApply('tag', getActiveFiltersCount(updatedFilters));

    void loadFirstTicketsPage(request);
  };

  const handleApplyFilters = (filters: FlightFiltersState) => {
    setActiveFilters(filters);

    const request = buildTicketsRequest({
      offset: 0,
      filters,
    });

    trackAdditionalFiltersApply('panel', getActiveFiltersCount(filters));

    void loadFirstTicketsPage(request);
  };

  const handleShowFlights = (selection: PriceDynamicsSelection) => {
    setSelectedPriceDate(selection);

    const request = buildTicketsRequest({
      offset: 0,
      selectedDate: selection,
    });

    void loadFirstTicketsPage(request);
  };

  const handleLoadMore = useCallback(() => {
    if (isTicketsLoading || isLoadingMore) {
      return;
    }

    if (ticketGroups.length >= ticketsTotal) {
      return;
    }

    const request = buildTicketsRequest({
      offset: ticketGroups.length,
    });

    if (!request) {
      return;
    }

    void fetchMoreTickets(request).then((data) => {
      if (!data) {
        return;
      }

      setTicketGroups((prev) => [...prev, ...data.items]);
      setTicketsTotal(data.total);
    });
  }, [
    buildTicketsRequest,
    fetchMoreTickets,
    isLoadingMore,
    isTicketsLoading,
    ticketGroups.length,
    ticketsTotal,
  ]);

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
    setTicketGroups([]);
    setTicketsTotal(0);
    setActiveFilters(null);
    setSearchParams(params);
    setFilterKey((key) => key + 1);
  };

  const handleBookFlight = (flight: FlightBookingPayload) => {
    // TODO: уточнить контракт бронирования для составных маршрутов.
    // Сейчас API принимает один flight_instance_id, а предложение может состоять из нескольких segments.
    console.log(flight);
  };

  const handleScrollToPriceDynamics = () => {
    requestAnimationFrame(() => {
      priceDynamicsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
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

        <Flex vertical gap={16} ref={priceDynamicsRef}>
          <Typography.Title level={2}>График цен</Typography.Title>
          <PriceDynamicsContainer params={searchParams} onSelect={handleShowFlights} />
        </Flex>

        <div className={styles.columns}>
          <Flex component="main" gap={24} vertical className={styles.resultsColumn}>
            {showRecommendationTags && (
              <RecommendationTags onTagToggle={handleRecommendationTagToggle} />
            )}

            <FlightList
              flights={visibleTicketGroups}
              isLoading={isTicketsLoading}
              isLoadingMore={isLoadingMore}
              error={ticketsError}
              isIdle={selectedPriceDate === null}
              bookingDetails={bookingDetails}
              onBook={handleBookFlight}
              onLoadMore={handleLoadMore}
              hasMore={ticketGroups.length < ticketsTotal}
              onScrollToPriceDynamics={handleScrollToPriceDynamics}
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
                      children: searchParams.childrenNumber ?? 0,
                      toddler: searchParams.toddlersNumber ?? 0,
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
