import type {
  PriceDynamicsChartItem,
  PriceDynamicsSearchParams,
  PriceDynamicsSelection,
} from '../model/types';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Alert, Divider, Flex, Spin, Tooltip, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useLaunchExperiment } from '@/features/launch-experiment';
import { useAirportsQuery } from '@/features/search-form';
import { reachGoal } from '@/shared/utils';
import { PRICE_DYNAMICS_METRIKA_GOALS } from '../model/metrika-goals';
import { usePriceDynamicsQuery } from '../model/use-price-dynamics-query';
import { PriceDynamicsChart } from './price-dynamics-chart';
import { PriceDynamicsPlaceholder } from './price-dynamics-placeholder';
import styles from './price-dynamics.module.css';

interface Props {
  params: PriceDynamicsSearchParams | null;
  onSelect: (selection: PriceDynamicsSelection) => void;
}

const mapPriceDynamicsToChartItems = (
  data: { departure_date: string; min_total_price: number }[],
): PriceDynamicsChartItem[] => {
  return data.map(({ departure_date, min_total_price }) => ({
    date: departure_date,
    minTotalPrice: min_total_price,
  }));
};

export const PriceDynamicsContainer = ({ params, onSelect }: Props) => {
  const [outboundItems, setOutboundItems] = useState<PriceDynamicsChartItem[]>([]);
  const [inboundItems, setInboundItems] = useState<PriceDynamicsChartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PriceDynamicsSelection | null>(null);
  const [airportNames, setAirportNames] = useState<Record<number, string>>({});

  const {
    fetchPriceDynamics: fetchOutboundPriceDynamics,
    isPriceDynamicsLoading: isOutboundLoading,
    priceDynamicsError: outboundError,
  } = usePriceDynamicsQuery();

  const {
    fetchPriceDynamics: fetchInboundPriceDynamics,
    isPriceDynamicsLoading: isInboundLoading,
    priceDynamicsError: inboundError,
  } = usePriceDynamicsQuery();

  const { fetchAirports: fetchAirportsByIds } = useAirportsQuery();

  const variant = useLaunchExperiment();
  const highlightBestPrices = variant === 'B';

  useEffect(() => {
    if (!params) {
      return;
    }

    let isActual = true;

    const loadData = async () => {
      setOutboundItems([]);
      setInboundItems([]);
      setSelectedItem(null);

      const outboundData = await fetchOutboundPriceDynamics(params);

      if (isActual && outboundData) {
        setOutboundItems(mapPriceDynamicsToChartItems(outboundData));
      }

      if (params.tripType !== 'roundTrip') {
        return;
      }

      const inboundData = await fetchInboundPriceDynamics({
        ...params,
        airportFromId: params.airportToId,
        airportToId: params.airportFromId,
      });

      if (isActual && inboundData) {
        setInboundItems(mapPriceDynamicsToChartItems(inboundData));
      }
    };

    void loadData();

    return () => {
      isActual = false;
    };
  }, [params, fetchOutboundPriceDynamics, fetchInboundPriceDynamics]);

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

  const chartShownAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!params) {
      chartShownAtRef.current = null;
      return;
    }

    chartShownAtRef.current = performance.now();
  }, [params]);

  const handleChartItemSelect = (
    item: PriceDynamicsChartItem,
    selectionParams: Omit<PriceDynamicsSelection, 'date'>,
  ) => {
    const now = performance.now();
    const decisionTimeMs = chartShownAtRef.current
      ? Math.round(now - chartShownAtRef.current)
      : null;

    reachGoal(PRICE_DYNAMICS_METRIKA_GOALS.barClick, {
      variant,
      direction: selectionParams.direction,
      date: item.date,
      min_total_price: item.minTotalPrice,
      highlight_best_prices: highlightBestPrices,
      decision_time_ms: decisionTimeMs,
      decision_time_sec: decisionTimeMs ? Math.round(decisionTimeMs / 1000) : null,
    });

    const nextSelection: PriceDynamicsSelection = {
      ...selectionParams,
      date: item.date,
    };

    setSelectedItem(nextSelection);
    onSelect(nextSelection);
  };

  const isRoundTrip = params?.tripType === 'roundTrip';
  const isLoading = isOutboundLoading || isInboundLoading;
  const priceDynamicsError = outboundError ?? inboundError;

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
