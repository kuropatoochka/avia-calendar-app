import type { DepartureTime, FlightFiltersState } from '../model/types';
import { Checkbox, Flex, InputNumber, Radio, Typography } from 'antd';
import { DEPARTURE_TIME_LABELS, DEPARTURE_TIMES } from '../model/labels';
import { FieldRow } from './field-row';
import styles from './flight-filters.module.css';

type UpdateFilter = <K extends keyof FlightFiltersState>(
  key: K,
  value: FlightFiltersState[K],
) => void;

type FlightSectionProps = {
  filters: FlightFiltersState;
  updateFilter: UpdateFilter;
};

export const FlightSection = ({ filters, updateFilter }: FlightSectionProps) => {
  return (
    <Flex vertical gap={16} className={styles.fullWidth}>
      <Flex vertical gap={8}>
        <Flex gap={16} wrap>
          <Checkbox
            checked={filters.stopsFilterType === 'direct'}
            onChange={(event) => {
              updateFilter('stopsFilterType', event.target.checked ? 'direct' : null);
            }}
          >
            Прямые
          </Checkbox>

          <Checkbox
            checked={filters.stopsFilterType === 'withStops'}
            onChange={(event) => {
              const checked = event.target.checked;

              updateFilter('stopsFilterType', checked ? 'withStops' : null);

              if (checked && filters.maxStops === 0) {
                updateFilter('maxStops', 1);
              }
            }}
          >
            С пересадкой
          </Checkbox>
        </Flex>
      </Flex>

      {filters.stopsFilterType === 'withStops' && (
        <FieldRow label="Пересадок не больше">
          <Flex gap={6} align="center">
            <InputNumber
              className={styles.numberInput}
              min={1}
              max={3}
              value={filters.maxStops}
              onChange={(value) => {
                if (typeof value === 'number') {
                  updateFilter('maxStops', value);
                }
              }}
            />
            <Typography.Text className={styles.unitLabel}>шт</Typography.Text>
          </Flex>
        </FieldRow>
      )}

      <FieldRow label="Максимальное время в пути">
        <Flex gap={6} align="center">
          <InputNumber
            className={styles.numberInput}
            min={0}
            value={filters.maxFlightDuration}
            onChange={(value) => {
              if (typeof value === 'number') {
                updateFilter('maxFlightDuration', value);
              }
            }}
          />
          <Typography.Text className={styles.unitLabel}>ч</Typography.Text>
        </Flex>
      </FieldRow>

      <Flex vertical gap={8} className={styles.fullWidth}>
        <Typography.Text className={styles.label}>Удобное время вылета</Typography.Text>

        <Radio.Group
          value={filters.departureTime}
          onChange={(event) =>
            updateFilter('departureTime', event.target.value as FlightFiltersState['departureTime'])
          }
        >
          <Flex className={styles.timeGrid}>
            {DEPARTURE_TIMES.map((value: DepartureTime) => (
              <Radio key={value} value={value}>
                {DEPARTURE_TIME_LABELS[value]}
              </Radio>
            ))}
          </Flex>
        </Radio.Group>
      </Flex>
    </Flex>
  );
};
