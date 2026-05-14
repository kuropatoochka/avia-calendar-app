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
import { ArrowRotateLeft, Cross, ExclamationMark, Search } from '@/shared/assets';
import { AIRLINE_OPTIONS, DEPARTURE_TIME_LABELS, DEPARTURE_TIMES } from '../model/labels';
import type { DepartureTime, FlightFiltersState } from '../model/types';
import { useFlightFilters } from '../model/use-flight-filters';
import styles from './flight-filters.module.css';

type FlightFiltersProps = {
  onApply?: (filters: FlightFiltersState) => void;
  passengerCount?: number;
};

type FieldRowProps = {
  label: ReactNode;
  children: ReactNode;
};

const FieldRow = ({ label, children }: FieldRowProps) => (
  <Flex justify="space-between" align="center" gap={12}>
    <Typography.Text className={styles.label}>{label}</Typography.Text>
    {children}
  </Flex>
);

const stopDurationTooltip = (value?: number) => {
  if (value === 1) return 'Менее 1 ч';
  if (value === 72) return 'Более 72 ч';
  return `${value} ч`;
};

const priceTooltip = (value?: number) => {
  if (value === 1_000) return 'Менее 1 000 ₽';
  if (value === 200_000) return 'Более 200 000 ₽';
  return `${value?.toLocaleString('ru-RU')} ₽`;
};

export const FlightFilters = ({ onApply, passengerCount = 1 }: FlightFiltersProps) => {
  const {
    draftFilters,
    updateDraftFilter,
    setBaggageMode,
    addBaggageEntry,
    removeBaggageEntry,
    updateAnimalCount,
    applyFilters,
    resetFilters,
  } = useFlightFilters();

  const mainBaggageCount = draftFilters.baggageForAll ? 1 : passengerCount;
  const hasExtraBaggage = draftFilters.baggageWeights.length > mainBaggageCount;

  const toggleDepartureTime = (value: DepartureTime, checked: boolean) => {
    if (!checked && draftFilters.departureTimes.length === 1) return;
    const next = checked
      ? [...draftFilters.departureTimes, value]
      : draftFilters.departureTimes.filter((t) => t !== value);
    updateDraftFilter('departureTimes', Array.from(new Set(next)));
  };

  const toggleArrivalTime = (value: DepartureTime, checked: boolean) => {
    if (!checked && draftFilters.arrivalTimes.length === 1) return;
    const next = checked
      ? [...draftFilters.arrivalTimes, value]
      : draftFilters.arrivalTimes.filter((t) => t !== value);
    updateDraftFilter('arrivalTimes', Array.from(new Set(next)));
  };

  const handleApplyFilters = () => {
    applyFilters();
    onApply?.(draftFilters);
  };

  const filterSections: CollapseProps['items'] = [
    {
      key: 'flight',
      label: <Typography.Text className={styles.sectionTitle}>Перелёт</Typography.Text>,
      children: (
        <Flex vertical gap={16} className={styles.fullWidth}>
          <FieldRow label="Количество допустимых пересадок">
            <Flex gap={6} align="center">
              <InputNumber
                className={styles.numberInput}
                min={0}
                max={3}
                value={draftFilters.maxStops}
                onChange={(value) => value !== null && updateDraftFilter('maxStops', value)}
              />
              <Typography.Text className={styles.unitLabel}>шт</Typography.Text>
            </Flex>
          </FieldRow>

          <Flex vertical gap={4} className={styles.fullWidth}>
            <Typography.Text className={styles.label}>Длительность пересадки, часы</Typography.Text>

            <Flex justify="space-between">
              <Typography.Text className={styles.sliderLabel}>
                {draftFilters.stopDurationRange[0]}
              </Typography.Text>
              <Typography.Text className={styles.sliderLabel}>
                {draftFilters.stopDurationRange[1]}
              </Typography.Text>
            </Flex>

            <Slider
              range
              className={styles.slider}
              min={1}
              max={72}
              disabled={draftFilters.maxStops === 0}
              value={draftFilters.stopDurationRange}
              onChange={(value) =>
                updateDraftFilter('stopDurationRange', value as [number, number])
              }
              tooltip={{ formatter: stopDurationTooltip }}
            />
          </Flex>

          <FieldRow label="Максимальное время перелёта">
            <Flex gap={6} align="center">
              <InputNumber
                className={styles.numberInput}
                min={0}
                value={draftFilters.maxFlightDuration}
                onChange={(value) =>
                  value !== null && updateDraftFilter('maxFlightDuration', value)
                }
              />
              <Typography.Text className={styles.unitLabel}>ч</Typography.Text>
            </Flex>
          </FieldRow>

          <Flex vertical gap={8} className={styles.fullWidth}>
            <Typography.Text className={styles.label}>Удобное время вылета</Typography.Text>
            <div className={styles.timeGrid}>
              {DEPARTURE_TIMES.map((value) => (
                <Checkbox
                  key={value}
                  checked={draftFilters.departureTimes.includes(value)}
                  onChange={(event) => toggleDepartureTime(value, event.target.checked)}
                >
                  {DEPARTURE_TIME_LABELS[value]}
                </Checkbox>
              ))}
            </div>
          </Flex>

          <Flex vertical gap={8} className={styles.fullWidth}>
            <Typography.Text className={styles.label}>Удобное время прилёта</Typography.Text>
            <div className={styles.timeGrid}>
              {DEPARTURE_TIMES.map((value) => (
                <Checkbox
                  key={value}
                  checked={draftFilters.arrivalTimes.includes(value)}
                  onChange={(event) => toggleArrivalTime(value, event.target.checked)}
                >
                  {DEPARTURE_TIME_LABELS[value]}
                </Checkbox>
              ))}
            </div>
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
              { value: false, label: 'Цена за всех' },
              { value: true, label: 'Цена за пассажира' },
            ]}
          />

          <Flex vertical gap={4} className={styles.fullWidth}>
            <Typography.Text className={styles.label}>Диапазон цены, руб.</Typography.Text>

            <Flex justify="space-between">
              <Typography.Text className={styles.sliderLabel}>
                {draftFilters.priceRange[0].toLocaleString('ru-RU')}
              </Typography.Text>
              <Typography.Text className={styles.sliderLabel}>
                {draftFilters.priceRange[1].toLocaleString('ru-RU')}
              </Typography.Text>
            </Flex>

            <Slider
              range
              className={styles.slider}
              min={1_000}
              max={200_000}
              step={100}
              value={draftFilters.priceRange}
              onChange={(value) => updateDraftFilter('priceRange', value as [number, number])}
              tooltip={{ formatter: priceTooltip }}
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
          {/* Багаж */}
          <Flex vertical gap={8} className={styles.fullWidth}>
            <Checkbox
              checked={draftFilters.baggageEnabled}
              onChange={(e) => updateDraftFilter('baggageEnabled', e.target.checked)}
            >
              Багаж
            </Checkbox>

            {draftFilters.baggageEnabled && (
              <Flex vertical gap={8} className={styles.fullWidth}>
                <Radio.Group
                  value={draftFilters.baggageForAll}
                  onChange={(e) => setBaggageMode(e.target.value as boolean, passengerCount)}
                  options={[
                    { value: true, label: 'Для всех пассажиров' },
                    { value: false, label: 'Для каждого пассажира' },
                  ]}
                />

                {draftFilters.baggageWeights.map((weight, index) => {
                  const isExtra = index >= mainBaggageCount;
                  const label = isExtra ? (
                    <>
                      Дополнительный
                      <br />
                      багаж {index - mainBaggageCount + 1}
                    </>
                  ) : draftFilters.baggageForAll ? (
                    'Вес багажа'
                  ) : (
                    `Пассажир ${index + 1}`
                  );

                  return (
                    <FieldRow key={index} label={label}>
                      <Flex gap={6} align="center">
                        <InputNumber
                          className={styles.numberInput}
                          min={0}
                          value={weight}
                          onChange={(value) => {
                            if (value !== null) {
                              const next = [...draftFilters.baggageWeights];
                              next[index] = value;
                              updateDraftFilter('baggageWeights', next);
                            }
                          }}
                        />
                        <Typography.Text className={styles.unitLabel}>кг</Typography.Text>
                      </Flex>
                    </FieldRow>
                  );
                })}

                <Flex justify="space-between" className={styles.fullWidth}>
                  <Button size="small" className={styles.actionButton} onClick={addBaggageEntry}>
                    Добавить ещё багаж
                  </Button>
                  {hasExtraBaggage && (
                    <Button
                      size="small"
                      className={styles.actionButton}
                      onClick={() => removeBaggageEntry(draftFilters.baggageWeights.length - 1)}
                    >
                      Удалить багаж
                    </Button>
                  )}
                </Flex>
              </Flex>
            )}
          </Flex>

          {/* Перевозка животных */}
          <Flex vertical gap={8} className={styles.fullWidth}>
            <Flex align="center" gap={6}>
              <Checkbox
                checked={draftFilters.petsEnabled}
                onChange={(e) => updateDraftFilter('petsEnabled', e.target.checked)}
              >
                Перевозка животных как багаж
              </Checkbox>
              <Tooltip title="Животные весом более 10 кг перевозятся как багаж">
                <ExclamationMark className={styles.infoIcon} />
              </Tooltip>
            </Flex>

            {draftFilters.petsEnabled && (
              <Flex vertical gap={8} className={styles.fullWidth}>
                <FieldRow label="Количество животных">
                  <Flex gap={6} align="center">
                    <InputNumber
                      className={styles.numberInput}
                      min={1}
                      max={9}
                      value={draftFilters.animalCount}
                      onChange={(value) => value !== null && updateAnimalCount(value)}
                    />
                    <Typography.Text className={styles.unitLabel}>шт</Typography.Text>
                  </Flex>
                </FieldRow>

                {draftFilters.animalWeights.map((weight, index) => (
                  <FieldRow key={index} label={`Животное ${index + 1}`}>
                    <Flex gap={6} align="center">
                      <InputNumber
                        className={styles.numberInput}
                        min={0}
                        value={weight}
                        onChange={(value) => {
                          if (value !== null) {
                            const next = [...draftFilters.animalWeights];
                            next[index] = value;
                            updateDraftFilter('animalWeights', next);
                          }
                        }}
                      />
                      <Typography.Text className={styles.unitLabel}>кг</Typography.Text>
                    </Flex>
                  </FieldRow>
                ))}
              </Flex>
            )}
          </Flex>

          {/* Авиакомпания */}
          <Flex vertical gap={4} className={styles.fullWidth}>
            <Typography.Text className={styles.label}>Авиакомпания</Typography.Text>
            <Select
              mode="multiple"
              className={styles.select}
              placeholder="Выберите авиакомпанию"
              value={draftFilters.airlines}
              onChange={(value) => updateDraftFilter('airlines', value)}
              options={AIRLINE_OPTIONS}
              suffixIcon={
                draftFilters.airlines.length > 0 ? (
                  <span
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateDraftFilter('airlines', []);
                    }}
                  >
                    <Cross className={styles.selectClearIcon} />
                  </span>
                ) : (
                  <Search className={styles.selectSearchIcon} />
                )
              }
            />
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
            onClick={resetFilters}
          />
        </Tooltip>
      </Flex>

      <Flex vertical gap={0} className={styles.panel}>
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
