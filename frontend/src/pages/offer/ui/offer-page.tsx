import { Collapse, Flex, Space, Spin, Typography } from 'antd';
import { useState } from 'react';
import type { FlightFiltersState } from '@/features/flight-filters';
import { FlightFilters as FlightFiltersSection } from '@/features/flight-filters';
import type {
  PriceDynamicsSearchParams,
  PriceDynamicsSelection,
} from '@/features/price-dynamics-chart';
import { PriceDynamicsContainer } from '@/features/price-dynamics-chart';
import type { SearchFormValues } from '@/features/search-form';
import { SearchForm } from '@/features/search-form';
import { FlightService } from '@/shared/api';
import { ArrowDown } from '@/shared/assets';
import type { FlightFilters, FlightsRequest, TicketsListDto } from '@/shared/types';
import { cn } from '@/shared/utils';
import styles from './offer-page.module.css';

const OfferPage = () => {
  const [searchParams, setSearchParams] = useState<PriceDynamicsSearchParams | null>(null);
  const [, setSelectedPriceDate] = useState<PriceDynamicsSelection | null>(null);
  const [filterKey, setFilterKey] = useState(0);

  const [activeFilters, setActiveFilters] = useState<FlightFiltersState | null>(null);
  const [priceDynamicsOpenKeys, setPriceDynamicsOpenKeys] = useState<string[]>(['price-dynamics']);

  const [, setFlights] = useState<TicketsListDto | null>(null);
  const [isFlightsLoading, setIsFlightsLoading] = useState(false);

  /**
   * Maps the UI filter state to backend-compatible query params.
   * Fields not supported by the backend (maxStops, departureTimes, etc.)
   * are intentionally omitted — they are applied client-side when needed.
   */
  const mapFiltersToRequest = (filters: FlightFiltersState): FlightFilters => {
    const result: FlightFilters = {};

    if (filters.maxPrice < 200_000) {
      result.price_to = filters.maxPrice;
    }

    if (filters.airlines.length > 0) {
      result.company = filters.airlines.join(',');
    }

    if (filters.baggageEnabled) {
      const mainBaggage = filters.baggageWeights.reduce((sum, w) => sum + w, 0);
      const extraBaggage = filters.extraBaggageEntries.reduce((sum, e) => sum + e.weight, 0);
      const totalBaggage = mainBaggage + extraBaggage;
      if (totalBaggage > 0) result.baggage_size = totalBaggage;
    }

    return result;
  };

  const handleApplyFilters = (filters: FlightFiltersState) => {
    setActiveFilters(filters);
  };

  const handleShowFlights = async (selection: PriceDynamicsSelection) => {
    setSelectedPriceDate(selection);

    if (!searchParams) return;

    const request: FlightsRequest = {
      airportFromId: selection.airportFromId,
      airportToId: selection.airportToId,
      date: selection.date,
      passengers: {
        adults: searchParams.passengersNumber,
        children: searchParams.childrenNumber ?? 0,
        toddler: searchParams.toddlersNumber ?? 0,
        animals: 0,
      },
      serviceClass: searchParams.serviceClass,
      filters: activeFilters ? mapFiltersToRequest(activeFilters) : undefined,
    };

    try {
      setIsFlightsLoading(true);
      const data = await FlightService.getFlights(request);
      setFlights(data);
      console.log('Fetched flights', data);
    } catch (err) {
      console.error('Failed to fetch flights', err);
    } finally {
      setIsFlightsLoading(false);
    }
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
    setFlights(null);
    setSearchParams(params);
    setFilterKey((k) => k + 1);
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

export default OfferPage;
