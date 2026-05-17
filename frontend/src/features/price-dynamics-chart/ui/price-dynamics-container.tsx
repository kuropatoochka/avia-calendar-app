import type { PriceDynamicsSelection, PriceDynamicsSearchParams } from '../model/types';
import { Alert, Button, Flex, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { usePriceDynamicsQuery } from '../model/use-price-dynamics-query';
import { PriceDynamicsChart } from './price-dynamics-chart';
import { PriceDynamicsPlaceholder } from './price-dynamics-placeholder';

export type PriceDynamicsChartItem = {
  date: string;
  minTotalPrice: number;
};

interface Props {
  params: PriceDynamicsSearchParams | null;
  onSelect: (selection: PriceDynamicsSelection) => void;
}

export const PriceDynamicsContainer = ({ params, onSelect }: Props) => {
  const [priceDynamics, setPriceDynamics] = useState<PriceDynamicsChartItem[]>([]);
  const [selectedChartItem, setSelectedChartItem] = useState<PriceDynamicsChartItem | null>(null);

  const { fetchPriceDynamics, isPriceDynamicsLoading, priceDynamicsError } =
    usePriceDynamicsQuery();

  useEffect(() => {
    if (!params) {
      return;
    }

    const loadData = async () => {
      setSelectedChartItem(null);

      const data = await fetchPriceDynamics(params);

      if (!data) {
        return;
      }

      setPriceDynamics(
        data.map(({ departure_date, min_total_price }) => ({
          date: departure_date,
          minTotalPrice: min_total_price,
        })),
      );
    };

    void loadData();
  }, [params, fetchPriceDynamics]);

  const handleChartItemSelect = (item: PriceDynamicsChartItem) => {
    setSelectedChartItem(item);
  };

  const handleShowFlights = () => {
    if (!params || !selectedChartItem) {
      return;
    }

    onSelect({
      airportFromId: params.airportFromId,
      airportToId: params.airportToId,
      date: selectedChartItem.date,
    });
  };

  if (!params) {
    return (
      <Flex component="section" vertical justify="center" align="center">
        <PriceDynamicsPlaceholder />
      </Flex>
    );
  }

  return (
    <Flex component="section" vertical justify="center" align="center">
      <Flex vertical justify="center" align="stretch">
        <Spin spinning={isPriceDynamicsLoading}>
          <Typography.Title level={3}>
            {params.airportFromId} — {params.airportToId}
          </Typography.Title>

          {priceDynamicsError && <Alert type="error" showIcon description={priceDynamicsError} />}

          {!priceDynamicsError && (
            <PriceDynamicsChart
              items={priceDynamics}
              selectedItem={selectedChartItem}
              onSelect={handleChartItemSelect}
            />
          )}
        </Spin>

        <Button type="primary" disabled={!selectedChartItem} onClick={handleShowFlights}>
          {selectedChartItem
            ? `Показать рейсы на ${selectedChartItem.date}`
            : 'Выберите дату на графике'}
        </Button>
      </Flex>
    </Flex>
  );
};
