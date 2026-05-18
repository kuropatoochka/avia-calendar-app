import type {
  PriceDynamicsChartItem,
  PriceDynamicsSearchParams,
  PriceDynamicsSelection,
} from '../model/types';
import { Alert, Divider, Flex, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
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

  const handleChartItemSelect = (
    item: PriceDynamicsChartItem,
    selectionParams: Omit<PriceDynamicsSelection, 'date'>,
  ) => {
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
                <Typography.Title type="secondary" level={3}>
                  {params.airportFromId} — {params.airportToId}
                </Typography.Title>

                <PriceDynamicsChart
                  items={outboundItems}
                  selectedItem={selectedOutboundItem}
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
                      {params.airportToId} — {params.airportFromId}
                    </Typography.Title>

                    <PriceDynamicsChart
                      items={inboundItems}
                      selectedItem={selectedInboundItem}
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
