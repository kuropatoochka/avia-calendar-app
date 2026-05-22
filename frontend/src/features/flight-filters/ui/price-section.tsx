import type { FlightFiltersState } from '../model/types';
import { Flex, Slider, Typography } from 'antd';
import { MAX_PRICE_FILTER } from '../model/defaults';
import { FieldRow } from './field-row';
import styles from './flight-filters.module.css';

type UpdateFilter = <K extends keyof FlightFiltersState>(
  key: K,
  value: FlightFiltersState[K],
) => void;

type PriceSectionProps = {
  filters: FlightFiltersState;
  updateFilter: UpdateFilter;
};

const priceTooltip = (value?: number) => {
  if (Number(value) >= MAX_PRICE_FILTER) {
    return 'Любая';
  }

  return `до ${value?.toLocaleString('ru-RU')} ₽`;
};

export const PriceSection = ({ filters, updateFilter }: PriceSectionProps) => {
  const maxPriceValue = Math.min(filters.maxPrice, MAX_PRICE_FILTER);

  return (
    <Flex vertical gap={4} className={styles.fullWidth}>
      <FieldRow label="Стоимость, руб.">
        <Typography.Text className={styles.sliderLabel}>
          {maxPriceValue >= MAX_PRICE_FILTER
            ? 'Любая'
            : `до ${maxPriceValue.toLocaleString('ru-RU')} ₽`}
        </Typography.Text>
      </FieldRow>

      <Slider
        className={styles.slider}
        min={1_000}
        max={MAX_PRICE_FILTER}
        step={100}
        value={maxPriceValue}
        onChange={(value) => updateFilter('maxPrice', value)}
        tooltip={{ formatter: priceTooltip }}
      />
    </Flex>
  );
};
