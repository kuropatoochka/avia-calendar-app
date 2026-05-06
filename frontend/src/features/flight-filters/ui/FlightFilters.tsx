import type {
  BaggageType,
  DepartureTime,
  FlightFiltersState,
  PetTransport,
} from '../types/flightFilters';
import type { CollapseProps } from 'antd';
import type { ReactNode } from 'react';
import {
  Button,
  Checkbox,
  Collapse,
  Flex,
  InputNumber,
  Radio,
  Select,
  Slider,
  Tooltip,
  Typography,
} from 'antd';
import { ArrowRotateLeft } from '@/shared/assets';
import { AIRLINE_OPTIONS, DEPARTURE_TIME_LABELS, DEPARTURE_TIMES } from '../consts/labels';
import { useFlightFilters } from '../hooks/useFlightFilters';
import styles from './styles.module.css';

type FlightFiltersProps = {
  onApply?: (filters: FlightFiltersState) => void;
};

type FieldRowProps = {
  label: string;
  children: ReactNode;
};

const FieldRow = ({ label, children }: FieldRowProps) => (
  <Flex justify="space-between" align="center" gap={12}>
    <Typography.Text className={styles.label}>{label}</Typography.Text>
    {children}
  </Flex>
);

type SliderRangeLabelProps = {
  value: [number, number];
  formatter?: (value: number) => string;
};

const SliderRangeLabel = ({ value, formatter = String }: SliderRangeLabelProps) => (
  <Flex justify="space-between">
    <Typography.Text className={styles.sliderLabel}>{formatter(value[0])}</Typography.Text>
    <Typography.Text className={styles.sliderLabel}>{formatter(value[1])}</Typography.Text>
  </Flex>
);

export const FlightFilters = ({ onApply }: FlightFiltersProps) => {
  const { draftFilters, updateDraftFilter, applyFilters, resetFilters } = useFlightFilters();

  const toggleDepartureTime = (value: DepartureTime, checked: boolean) => {
    if (!checked && draftFilters.departureTimes.length === 1) return;

    const next = checked
      ? [...draftFilters.departureTimes, value]
      : draftFilters.departureTimes.filter((time) => time !== value);

    updateDraftFilter('departureTimes', Array.from(new Set(next)));
  };

  const toggleBaggageType = (value: BaggageType, checked: boolean) => {
    if (value === 'hand') return;

    const next: BaggageType[] = checked
      ? [...draftFilters.baggageTypes, value]
      : draftFilters.baggageTypes.filter((type) => type !== value);

    updateDraftFilter('baggageTypes', next);
  };

  const togglePetTransport = (value: PetTransport, checked: boolean) => {
    const next: PetTransport[] = checked
      ? [...draftFilters.petTransport, value]
      : draftFilters.petTransport.filter((type) => type !== value);

    updateDraftFilter('petTransport', next);
  };

  const handleApplyFilters = () => {
    applyFilters();
    onApply?.(draftFilters);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const filterSections: CollapseProps['items'] = [
    {
      key: 'flight',
      label: <Typography.Text className={styles.sectionTitle}>Перелёт</Typography.Text>,
      children: (
        <Flex vertical gap={16} className={styles.fullWidth}>
          <FieldRow label="Количество доступных пересадок, шт.">
            <InputNumber
              className={styles.numberInput}
              min={0}
              value={draftFilters.maxStops}
              onChange={(value) => value !== null && updateDraftFilter('maxStops', value)}
            />
          </FieldRow>

          <Flex vertical gap={4} className={styles.fullWidth}>
            <Typography.Text className={styles.label}>Длительность пересадки, часы</Typography.Text>

            <SliderRangeLabel value={draftFilters.stopDurationRange} />

            <Slider
              range
              min={1}
              max={72}
              value={draftFilters.stopDurationRange}
              onChange={(value) =>
                updateDraftFilter('stopDurationRange', value as [number, number])
              }
              tooltip={{ formatter: (value) => `${value} ч` }}
            />
          </Flex>

          <FieldRow label="Максимальное время перелёта, часы">
            <InputNumber
              className={styles.numberInput}
              min={1}
              value={draftFilters.maxFlightDuration}
              onChange={(value) => value !== null && updateDraftFilter('maxFlightDuration', value)}
            />
          </FieldRow>

          <Flex vertical gap={8} className={styles.fullWidth}>
            <Typography.Text className={styles.label}>Удобное время вылета</Typography.Text>

            <Flex wrap gap={12}>
              {DEPARTURE_TIMES.map((value) => (
                <Checkbox
                  key={value}
                  checked={draftFilters.departureTimes.includes(value)}
                  onChange={(event) => toggleDepartureTime(value, event.target.checked)}
                >
                  {DEPARTURE_TIME_LABELS[value]}
                </Checkbox>
              ))}
            </Flex>
          </Flex>
        </Flex>
      ),
    },
    {
      key: 'price',
      label: <Typography.Text className={styles.sectionTitle}>Стоимость</Typography.Text>,
      children: (
        <Flex vertical gap={16} className={styles.fullWidth}>
          <Radio.Group
            value={draftFilters.pricePerPassenger}
            onChange={(event) => updateDraftFilter('pricePerPassenger', event.target.value)}
            options={[
              { value: true, label: 'Цена за пассажира' },
              { value: false, label: 'Цена за всех' },
            ]}
          />

          <Flex vertical gap={4} className={styles.fullWidth}>
            <Typography.Text className={styles.label}>Диапазон цены, руб.</Typography.Text>

            <SliderRangeLabel
              value={draftFilters.priceRange}
              formatter={(value) => value.toLocaleString('ru-RU')}
            />

            <Slider
              range
              min={100}
              max={1_000_000}
              step={100}
              value={draftFilters.priceRange}
              onChange={(value) => updateDraftFilter('priceRange', value as [number, number])}
              tooltip={{ formatter: (value) => `${value?.toLocaleString('ru-RU')} ₽` }}
            />
          </Flex>
        </Flex>
      ),
    },
    {
      key: 'conditions',
      label: <Typography.Text className={styles.sectionTitle}>Условия</Typography.Text>,
      children: (
        <Flex vertical gap={16} className={styles.fullWidth}>
          <Flex vertical gap={8} className={styles.fullWidth}>
            <Typography.Text className={styles.label}>Тип багажа</Typography.Text>

            <Flex wrap gap={12}>
              <Checkbox checked disabled>
                Ручная кладь
              </Checkbox>

              <Checkbox
                checked={draftFilters.baggageTypes.includes('checked')}
                onChange={(event) => toggleBaggageType('checked', event.target.checked)}
              >
                Багаж
              </Checkbox>
            </Flex>
          </Flex>

          <FieldRow label="Багаж, кг">
            <InputNumber
              className={styles.numberInput}
              min={0}
              value={draftFilters.maxBaggageWeight}
              onChange={(value) => value !== null && updateDraftFilter('maxBaggageWeight', value)}
            />
          </FieldRow>

          <Flex vertical gap={4} className={styles.fullWidth}>
            <Typography.Text className={styles.label}>Авиакомпания</Typography.Text>

            <Select
              className={styles.select}
              placeholder="Выберите авиакомпанию"
              value={draftFilters.airline || undefined}
              onChange={(value) => updateDraftFilter('airline', value ?? '')}
              options={AIRLINE_OPTIONS}
              allowClear
            />
          </Flex>

          <Flex vertical gap={8} className={styles.fullWidth}>
            <Typography.Text className={styles.label}>Перевозка животных</Typography.Text>

            <Flex wrap gap={12}>
              <Checkbox
                checked={draftFilters.petTransport.includes('cabin')}
                onChange={(event) => togglePetTransport('cabin', event.target.checked)}
              >
                В салоне
              </Checkbox>

              <Checkbox
                checked={draftFilters.petTransport.includes('baggage')}
                onChange={(event) => togglePetTransport('baggage', event.target.checked)}
              >
                Как багаж
              </Checkbox>
            </Flex>
          </Flex>
        </Flex>
      ),
    },
  ];

  return (
    <Flex vertical gap={12} className={styles.container}>
      <Flex justify="space-between" align="center" gap={12} className={styles.header}>
        <Typography.Title level={4} className={styles.title}>
          Дополнительные фильтры
        </Typography.Title>

        <Tooltip title="Сброс фильтров">
          <Button
            type="text"
            aria-label="Сброс фильтров"
            icon={<ArrowRotateLeft />}
            onClick={handleResetFilters}
          />
        </Tooltip>
      </Flex>

      <Flex vertical gap={16} className={styles.panel}>
        <Collapse
          className={styles.collapse}
          bordered={false}
          defaultActiveKey={['flight', 'price', 'conditions']}
          items={filterSections}
        />

        <Flex justify="flex-end" className={styles.actions}>
          <Button type="primary" className={styles.applyButton} onClick={handleApplyFilters}>
            Применить фильтры
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
