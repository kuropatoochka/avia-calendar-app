import { FlightFilters } from '@/features/flight-filters';
import type { FlightFiltersState } from '@/features/flight-filters/model/types';
import {
  PriceDynamicsBlock,
  PriceDynamicsPlaceholder,
  type PriceDynamicsSelection,
} from '@/features/price-dynamics-chart/ui/PriceDynamicsWrapper';
import { SearchForm } from '@/features/search-form';
import {
  DEFAULT_DESTINATION_AIRPORT,
  DEFAULT_ORIGIN_AIRPORT,
} from '@/features/search-form/model/consts';
import type { SearchFormValues } from '@/features/search-form/model/types';
import { airportMock } from '@/shared/api';
import { ArrowDown } from '@/shared/assets';
import type { PriceDynamicsRequest } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Collapse, Flex, Space, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
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
  const [priceDynamicsOpenKeys, setPriceDynamicsOpenKeys] = useState<string[]>([]);

  const airportLookup = useMemo(() => {
    const entries = [...airportMock, ...DEFAULT_AIRPORTS];
    return new Map(entries.map((airport) => [airport.id, airport]));
  }, []);

  const getAirportLabel = (airportId: string) => {
    return airportLookup.get(airportId)?.airport ?? airportId.toUpperCase();
  };

  const handleSearch = (values: SearchFormValues) => {
    const [dateFrom, dateTo] = values.dateRange;

    if (!dateFrom || !dateTo) {
      setActiveSearch(null);
      return;
    }

    const baseParams: PriceDynamicsRequest = {
      originAirportId: values.originAirport,
      destinationAirportId: values.destinationAirport,
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

  useEffect(() => {
    if (priceDynamicsCharts) {
      setPriceDynamicsOpenKeys(['price-dynamics']);
    } else {
      setPriceDynamicsOpenKeys([]);
    }
  }, [priceDynamicsCharts]);

  const handleShowFlights = (selection: PriceDynamicsSelection) => {
    if (!activeSearch) {
      return;
    }

    console.log('Show flights for selected date', {
      direction: selection.direction,
      date: selection.date,
      baseSearchParams: activeSearch.baseParams,
      filters: activeFilters,
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
        <div className={styles.columns}>
          <div className={styles.results}>
            <Collapse
              className={styles.collapse}
              bordered={false}
              activeKey={priceDynamicsOpenKeys}
              destroyInactivePanel={false}
              onChange={(key) => {
                setPriceDynamicsOpenKeys(Array.isArray(key) ? key : [key]);
              }}
              expandIconPosition="end"
              expandIcon={({ isActive }) => (
                <ArrowDown
                  className={cn(styles.collapseArrow, isActive && styles.collapseArrowOpen)}
                />
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
          </div>
          <aside className={styles.filterWrapper}>
            <FlightFilters onApply={handleApplyFilters} />
          </aside>
        </div>
      </Flex>
    </div>
  );
};

export default OfferPage;
