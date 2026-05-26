import type {
  PriceDynamicsChartItem,
  PriceDynamicsSearchParams,
  PriceDynamicsSelection,
} from '../model/types';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Alert, Divider, Flex, Spin, Tooltip, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Experiment,
  Goal,
  trackExperimentEvent,
  useLaunchExperiment,
} from '@/features/launch-experiment';
import { useAirportsQuery } from '@/features/search-form';
import type { PriceDynamicsDto } from '@/shared/types';
import { usePriceDynamicsQuery } from '../model/use-price-dynamics-query';
import { PriceDynamicsChart } from './price-dynamics-chart';
import { PriceDynamicsPlaceholder } from './price-dynamics-placeholder';
import styles from './price-dynamics.module.css';

interface Props {
  params: PriceDynamicsSearchParams | null;
  onSelect: (selection: PriceDynamicsSelection) => void;
  refreshKey?: number;
}

type ChartDirection = PriceDynamicsSelection['direction'];
type BestPriceRank = 1 | 2 | 3 | null;

type SelectedItemState = {
  searchKey: string;
  selection: PriceDynamicsSelection;
} | null;

const TOP_PRICES_COUNT = 3;

const mapPriceDynamicsToChartItems = (data: PriceDynamicsDto[]): PriceDynamicsChartItem[] => {
  return data.map(({ departure_date, min_total_price }) => ({
    date: departure_date,
    minTotalPrice: min_total_price,
  }));
};

const getBestPriceRank = (
  item: PriceDynamicsChartItem,
  items: PriceDynamicsChartItem[],
): BestPriceRank => {
  const bestItems = [...items]
    .sort(
      (firstItem, secondItem) =>
        firstItem.minTotalPrice - secondItem.minTotalPrice ||
        firstItem.date.localeCompare(secondItem.date),
    )
    .slice(0, TOP_PRICES_COUNT);

  const index = bestItems.findIndex((bestItem) => bestItem.date === item.date);

  if (index === -1) {
    return null;
  }

  return (index + 1) as BestPriceRank;
};

const getSearchKey = (params: PriceDynamicsSearchParams | null) => {
  if (!params) {
    return '';
  }

  return [
    params.tripType,
    params.airportFromId,
    params.airportToId,
    params.dateFrom,
    params.dateTo,
    params.serviceClass,
    params.passengersNumber,
    params.childrenNumber,
    params.toddlersNumber,
  ].join('|');
};

export const PriceDynamicsContainer = ({ params, onSelect, refreshKey }: Props) => {
  const [selectedItemState, setSelectedItemState] = useState<SelectedItemState>(null);
  const [airportNames, setAirportNames] = useState<Record<number, string>>({});

  const chartViewIdsRef = useRef<Record<ChartDirection, string | null>>({
    outbound: null,
    inbound: null,
  });

  const viewTrackedRef = useRef<Record<ChartDirection, boolean>>({
    outbound: false,
    inbound: false,
  });

  const clickOrdersRef = useRef<Record<ChartDirection, number>>({
    outbound: 0,
    inbound: 0,
  });

  const variant = useLaunchExperiment();
  const highlightBestPrices = variant === 'B';

  const {
    priceDynamics: outboundPriceDynamics,
    fetchPriceDynamics: fetchOutboundPriceDynamics,
    clearPriceDynamics: clearOutboundPriceDynamics,
    isPriceDynamicsLoading: isOutboundLoading,
    priceDynamicsError: outboundError,
  } = usePriceDynamicsQuery();

  const {
    priceDynamics: inboundPriceDynamics,
    fetchPriceDynamics: fetchInboundPriceDynamics,
    clearPriceDynamics: clearInboundPriceDynamics,
    isPriceDynamicsLoading: isInboundLoading,
    priceDynamicsError: inboundError,
  } = usePriceDynamicsQuery();

  const { fetchAirports: fetchAirportsByIds } = useAirportsQuery();

  const searchKey = useMemo(() => getSearchKey(params), [params]);

  const isRoundTrip = params?.tripType === 'roundTrip';
  const isLoading = isOutboundLoading || isInboundLoading;
  const priceDynamicsError = outboundError || inboundError;

  const outboundItems = useMemo(() => {
    return mapPriceDynamicsToChartItems(outboundPriceDynamics);
  }, [outboundPriceDynamics]);

  const inboundItems = useMemo(() => {
    return mapPriceDynamicsToChartItems(inboundPriceDynamics);
  }, [inboundPriceDynamics]);

  const selectedItem =
    selectedItemState?.searchKey === searchKey ? selectedItemState.selection : null;

  const selectedOutboundItem =
    selectedItem?.direction === 'outbound'
      ? (outboundItems.find((item) => item.date === selectedItem.date) ?? null)
      : null;

  const selectedInboundItem =
    selectedItem?.direction === 'inbound'
      ? (inboundItems.find((item) => item.date === selectedItem.date) ?? null)
      : null;

  const outboundTitleFrom = params
    ? (airportNames[params.airportFromId] ?? String(params.airportFromId))
    : '';

  const outboundTitleTo = params
    ? (airportNames[params.airportToId] ?? String(params.airportToId))
    : '';

  const resetChartTracking = useCallback(() => {
    chartViewIdsRef.current = {
      outbound: null,
      inbound: null,
    };

    viewTrackedRef.current = {
      outbound: false,
      inbound: false,
    };

    clickOrdersRef.current = {
      outbound: 0,
      inbound: 0,
    };
  }, []);

  const trackPriceDynamicsView = useCallback(
    (direction: ChartDirection, datesCount: number) => {
      if (!params || datesCount === 0) {
        return null;
      }

      if (viewTrackedRef.current[direction]) {
        return chartViewIdsRef.current[direction];
      }

      const chartViewId = crypto.randomUUID();

      chartViewIdsRef.current[direction] = chartViewId;
      viewTrackedRef.current[direction] = true;

      trackExperimentEvent({
        goal: Goal.PriceDynamicsView,
        experiment: Experiment.PriceDynamicsBestDates,
        variant,
        params: {
          chart_view_id: chartViewId,
          direction,
          trip_type: params.tripType,
          dates_count: datesCount,
        },
      });

      return chartViewId;
    },
    [params, variant],
  );

  useEffect(() => {
    resetChartTracking();

    if (!params) {
      clearOutboundPriceDynamics();
      clearInboundPriceDynamics();
      return;
    }

    void fetchOutboundPriceDynamics(params);

    if (params.tripType !== 'roundTrip') {
      clearInboundPriceDynamics();
      return;
    }

    void fetchInboundPriceDynamics({
      ...params,
      airportFromId: params.airportToId,
      airportToId: params.airportFromId,
    });
  }, [
    params,
    fetchOutboundPriceDynamics,
    fetchInboundPriceDynamics,
    clearOutboundPriceDynamics,
    clearInboundPriceDynamics,
    resetChartTracking,
    refreshKey,
  ]);

  useEffect(() => {
    if (!params || isLoading || priceDynamicsError) {
      return;
    }

    trackPriceDynamicsView('outbound', outboundItems.length);

    if (isRoundTrip) {
      trackPriceDynamicsView('inbound', inboundItems.length);
    }
  }, [
    params,
    isLoading,
    priceDynamicsError,
    isRoundTrip,
    outboundItems.length,
    inboundItems.length,
    trackPriceDynamicsView,
  ]);

  useEffect(() => {
    if (!params) {
      return;
    }

    let isActual = true;

    const loadAirports = async () => {
      setAirportNames({});

      const airports = await fetchAirportsByIds(undefined, [
        params.airportFromId,
        params.airportToId,
      ]);

      if (!isActual || !airports) {
        return;
      }

      const nextNames = airports.reduce<Record<number, string>>((acc, airport) => {
        acc[airport.id] = airport.name;
        return acc;
      }, {});

      setAirportNames(nextNames);
    };

    void loadAirports();

    return () => {
      isActual = false;
    };
  }, [params, fetchAirportsByIds]);

  const handleChartItemSelect = (
    item: PriceDynamicsChartItem,
    selectionParams: Omit<PriceDynamicsSelection, 'date' | 'searchViewId'>,
  ) => {
    if (!params) {
      return;
    }

    const direction = selectionParams.direction;

    if (selectedItem?.direction === direction && selectedItem.date === item.date) {
      return;
    }

    const chartItems = direction === 'outbound' ? outboundItems : inboundItems;
    const chartViewId = trackPriceDynamicsView(direction, chartItems.length);

    if (!chartViewId) {
      return;
    }

    const searchViewId = crypto.randomUUID();
    const bestPriceRank = getBestPriceRank(item, chartItems);
    const isHighlighted = highlightBestPrices && bestPriceRank !== null;

    clickOrdersRef.current[direction] += 1;

    trackExperimentEvent({
      goal: Goal.PriceDynamicsBarClick,
      experiment: Experiment.PriceDynamicsBestDates,
      variant,
      params: {
        chart_view_id: chartViewId,
        direction,
        trip_type: params.tripType,
        date: item.date,
        click_order: clickOrdersRef.current[direction],
        best_price_rank: bestPriceRank,
        is_highlighted: isHighlighted,
      },
    });

    trackExperimentEvent({
      goal: Goal.RecommendationFiltersView,
      experiment: Experiment.RecommendationTags,
      variant,
      params: {
        search_view_id: searchViewId,
      },
    });

    const nextSelection: PriceDynamicsSelection = {
      ...selectionParams,
      date: item.date,
      searchViewId,
    };

    setSelectedItemState({
      searchKey,
      selection: nextSelection,
    });

    onSelect(nextSelection);
  };

  if (!params) {
    return <PriceDynamicsPlaceholder />;
  }

  return (
    <Flex component="section" vertical className={styles.container}>
      <Spin spinning={isLoading}>
        <Flex gap={16} vertical>
          {priceDynamicsError && <Alert type="error" showIcon description={priceDynamicsError} />}

          {!priceDynamicsError && (
            <>
              <Flex gap={16} vertical>
                <Flex justify="space-between">
                  <Typography.Title type="secondary" level={3}>
                    {outboundTitleFrom} — {outboundTitleTo}
                  </Typography.Title>

                  <Tooltip title="Цена указана без учета дополнительных фильтров" placement="left">
                    <QuestionCircleOutlined style={{ color: 'var(--color-accent)' }} />
                  </Tooltip>
                </Flex>

                <PriceDynamicsChart
                  items={outboundItems}
                  selectedItem={selectedOutboundItem}
                  highlightBestPrices={highlightBestPrices}
                  onSelect={(item) => {
                    handleChartItemSelect(item, {
                      airportFromId: params.airportFromId,
                      airportToId: params.airportToId,
                      direction: 'outbound',
                    });
                  }}
                />
              </Flex>

              {isRoundTrip && (
                <>
                  <Divider style={{ margin: '16px 0' }} />

                  <Flex gap={16} vertical>
                    <Typography.Title type="secondary" level={3}>
                      {outboundTitleTo} — {outboundTitleFrom}
                    </Typography.Title>

                    <PriceDynamicsChart
                      items={inboundItems}
                      selectedItem={selectedInboundItem}
                      highlightBestPrices={highlightBestPrices}
                      onSelect={(item) => {
                        handleChartItemSelect(item, {
                          airportFromId: params.airportToId,
                          airportToId: params.airportFromId,
                          direction: 'inbound',
                        });
                      }}
                    />
                  </Flex>
                </>
              )}
            </>
          )}
        </Flex>
      </Spin>
    </Flex>
  );
};
