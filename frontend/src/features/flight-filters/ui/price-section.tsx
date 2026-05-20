import type { FlightFiltersState } from '../model/types';
import { Flex, Slider, Typography } from 'antd';
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
  if (Number(value) >= 90_000) {
    return 'Любая';
  }

  return `до ${value?.toLocaleString('ru-RU')} ₽`;
};

export const PriceSection = ({ filters, updateFilter }: PriceSectionProps) => {
  return (
    <Flex vertical gap={4} className={styles.fullWidth}>
      <FieldRow label="Стоимость, руб.">
        <Typography.Text className={styles.sliderLabel}>
          {filters.maxPrice >= 90_000
            ? 'Любая'
            : `до ${filters.maxPrice.toLocaleString('ru-RU')} ₽`}
        </Typography.Text>
      </FieldRow>

      <Slider
        className={styles.slider}
        min={1_000}
        max={100_000}
        step={100}
        value={filters.maxPrice}
        onChange={(value) => updateFilter('maxPrice', value)}
        tooltip={{ formatter: priceTooltip }}
      />
    </Flex>
  );
};
