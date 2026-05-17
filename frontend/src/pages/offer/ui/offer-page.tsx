import { Collapse, Flex, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { FlightFiltersState } from '@/features/flight-filters';
import { FlightFilters as FlightFiltersSection } from '@/features/flight-filters';
import type {
  PriceDynamicsSearchParams,
  PriceDynamicsSelection,
} from '@/features/price-dynamics-chart';
import { PriceDynamicsContainer } from '@/features/price-dynamics-chart';
import type { SearchFormValues } from '@/features/search-form';
import { SearchForm } from '@/features/search-form';
import { ArrowDown } from '@/shared/assets';
import type { FlightFilters as FlightFiltersRequest } from '@/shared/types';
import { cn } from '@/shared/utils';
import styles from './offer-page.module.css';

const OfferPage = () => {
  const [searchParams, setSearchParams] = useState<PriceDynamicsSearchParams | null>(null);
  const [selectedPriceDate, setSelectedPriceDate] = useState<PriceDynamicsSelection | null>(null);

  const [activeFilters, setActiveFilters] = useState<FlightFiltersState | null>(null);
  const [priceDynamicsOpenKeys, setPriceDynamicsOpenKeys] = useState<string[]>(['price-dynamics']);

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

  const handleApplyFilters = (filters: FlightFiltersState) => {
    setActiveFilters(filters);

    const requestFilters = mapFiltersToRequest(filters);

    console.log('Apply filters request params', requestFilters);
  };

  const handleShowFlights = (selection: PriceDynamicsSelection) => {
    setSelectedPriceDate(selection);

    console.log('Show flights for selected date');
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
    setSearchParams(params);
  };

  const passengerCount = searchParams
    ? searchParams.passengersNumber +
      (searchParams.childrenNumber ?? 0) +
      (searchParams.toddlersNumber ?? 0)
    : 1;

  useEffect(() => {
    console.log('Offer page search state', {
      selectedPriceDate,
      activeFilters,
    });
  }, [selectedPriceDate, activeFilters]);

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
            <FlightFiltersSection onApply={handleApplyFilters} passengerCount={passengerCount} />
          </aside>
        </div>
      </Flex>
    </div>
  );
};

export default OfferPage;
