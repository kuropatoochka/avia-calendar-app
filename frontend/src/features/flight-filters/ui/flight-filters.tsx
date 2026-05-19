import type { DepartureTime, FlightFiltersState } from '../model/types';
import type { CollapseProps } from 'antd';
import type { ReactNode } from 'react';
import { DownOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Collapse,
  Flex,
  InputNumber,
  Select,
  Slider,
  Tooltip,
  Typography,
} from 'antd';
import { Fragment, useState } from 'react';
import { ArrowRotateLeft, Cross, ExclamationMark, Search } from '@/shared/assets';
import { useFlightFiltersShared } from '../lib/FlightFiltersContext';
import { AIRLINE_OPTIONS, DEPARTURE_TIME_LABELS, DEPARTURE_TIMES } from '../model/labels';
import styles from './flight-filters.module.css';

type PassengerCounts = {
  adults: number;
  children: number;
  toddler: number;
};

type PassengerEntry = {
  label: string;
  defaultWeight: number;
};

const buildPassengerEntries = (passengers?: PassengerCounts): PassengerEntry[] => {
  const adults = passengers?.adults ?? 1;
  const children = passengers?.children ?? 0;
  const toddlers = passengers?.toddler ?? 0;
  const entries: PassengerEntry[] = [];
  for (let i = 0; i < adults; i++)
    entries.push({ label: adults > 1 ? `Пассажир ${i + 1}` : 'Пассажир', defaultWeight: 20 });
  for (let i = 0; i < children; i++)
    entries.push({ label: children > 1 ? `Ребёнок ${i + 1}` : 'Ребёнок', defaultWeight: 0 });
  for (let i = 0; i < toddlers; i++)
    entries.push({ label: toddlers > 1 ? `Младенец ${i + 1}` : 'Младенец', defaultWeight: 0 });
  return entries;
};

type FlightFiltersProps = {
  onApply?: (filters: FlightFiltersState) => void;
  passengers?: PassengerCounts;
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
  if (value === 0) return '< 1 ч';
  if (value === 72) return 'Любая';
  return `${value} ч`;
};

const priceTooltip = (value?: number) => {
  if (value === 200_000) return 'Любая';
  return `до ${value?.toLocaleString('ru-RU')} ₽`;
};

export const FlightFilters = ({ onApply, passengers }: FlightFiltersProps) => {
  const {
    draftFilters,
    updateDraftFilter,
    addBaggageEntry,
    removeBaggageEntry,
    updateAnimalCount,
    applyFilters,
    resetFilters,
  } = useFlightFiltersShared();

  const [addingBaggageFor, setAddingBaggageFor] = useState(false);
  const [passengerSelectOpen, setPassengerSelectOpen] = useState(false);

  const passengerEntries = buildPassengerEntries(passengers);
  const firstChildIndex = passengerEntries.findIndex((e) => e.defaultWeight === 0);

  const [minStopDur, maxStopDur] = draftFilters.stopDurationRange;
  const stopDurationLabel =
    maxStopDur >= 72
      ? minStopDur === 0
        ? 'Любая'
        : `от ${minStopDur} ч`
      : minStopDur === 0
        ? `до ${maxStopDur} ч`
        : `${minStopDur}–${maxStopDur} ч`;

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
            <FieldRow label="Длительность пересадки, часы">
              <Typography.Text className={styles.sliderLabel}>{stopDurationLabel}</Typography.Text>
            </FieldRow>

            <Slider
              range
              className={styles.slider}
              min={0}
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
        <Flex vertical gap={4} className={styles.fullWidth}>
          <FieldRow label="Стоимость, руб.">
            <Typography.Text className={styles.sliderLabel}>
              {draftFilters.maxPrice >= 200_000
                ? 'Любая'
                : `до ${draftFilters.maxPrice.toLocaleString('ru-RU')} ₽`}
            </Typography.Text>
          </FieldRow>

          <Slider
            className={styles.slider}
            min={1_000}
            max={200_000}
            step={100}
            value={draftFilters.maxPrice}
            onChange={(value) => updateDraftFilter('maxPrice', value)}
            tooltip={{ formatter: priceTooltip }}
          />
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
            <Flex align="center" gap={6}>
              <Checkbox
                checked={draftFilters.baggageEnabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  updateDraftFilter('baggageEnabled', enabled);
                  if (enabled) {
                    updateDraftFilter(
                      'baggageWeights',
                      passengerEntries.map(
                        (entry, i) => draftFilters.baggageWeights[i] ?? entry.defaultWeight,
                      ),
                    );
                  }
                }}
              >
                Багаж
              </Checkbox>
              {draftFilters.baggageEnabled && firstChildIndex !== -1 && (
                <Tooltip title="при выборе «0» кг, багаж не учитывается">
                  <ExclamationMark className={styles.infoIcon} />
                </Tooltip>
              )}
            </Flex>

            {draftFilters.baggageEnabled && (
              <Flex vertical gap={8} className={styles.fullWidth}>
                {passengerEntries.map((entry, pIndex) => {
                  const weight = draftFilters.baggageWeights[pIndex] ?? entry.defaultWeight;
                  const passengerExtras = draftFilters.extraBaggageEntries
                    .map((e, i) => ({ ...e, globalIndex: i }))
                    .filter((e) => e.passengerIndex === pIndex);

                  const mainInputNode = (
                    <Flex gap={6} align="center">
                      <InputNumber
                        className={styles.numberInput}
                        min={0}
                        value={weight}
                        onChange={(value) => {
                          if (value !== null) {
                            const next = Array.from(
                              { length: Math.max(draftFilters.baggageWeights.length, pIndex + 1) },
                              (_, i) =>
                                draftFilters.baggageWeights[i] ??
                                passengerEntries[i]?.defaultWeight ??
                                20,
                            );
                            next[pIndex] = value;
                            updateDraftFilter('baggageWeights', next);
                          }
                        }}
                      />
                      <Typography.Text className={styles.unitLabel}>кг</Typography.Text>
                    </Flex>
                  );

                  return (
                    <Fragment key={pIndex}>
                      <FieldRow label={entry.label}>{mainInputNode}</FieldRow>

                      {passengerExtras.map((extra, extraOrder) => (
                        <FieldRow key={extra.globalIndex} label={`Доп. багаж ${extraOrder + 1}`}>
                          <Flex gap={6} align="center">
                            <InputNumber
                              className={styles.numberInput}
                              min={0}
                              value={extra.weight}
                              onChange={(value) => {
                                if (value !== null) {
                                  const next = [...draftFilters.extraBaggageEntries];
                                  next[extra.globalIndex] = {
                                    ...next[extra.globalIndex],
                                    weight: value,
                                  };
                                  updateDraftFilter('extraBaggageEntries', next);
                                }
                              }}
                            />
                            <Typography.Text className={styles.unitLabel}>кг</Typography.Text>
                          </Flex>
                        </FieldRow>
                      ))}
                    </Fragment>
                  );
                })}

                {addingBaggageFor ? (
                  <Select
                    autoFocus
                    className={styles.passengerSelect}
                    placeholder="Выберите пассажира"
                    open={passengerSelectOpen}
                    onDropdownVisibleChange={setPassengerSelectOpen}
                    options={passengerEntries.map((e, i) => ({ label: e.label, value: i }))}
                    onSelect={(passengerIndex: number) => {
                      addBaggageEntry(passengerIndex);
                      setAddingBaggageFor(false);
                      setPassengerSelectOpen(false);
                    }}
                    onBlur={() => {
                      setAddingBaggageFor(false);
                      setPassengerSelectOpen(false);
                    }}
                    suffixIcon={
                      <DownOutlined
                        className={
                          passengerSelectOpen
                            ? styles.passengerSelectArrowOpen
                            : styles.passengerSelectArrow
                        }
                      />
                    }
                  />
                ) : (
                  <Flex justify="space-between" className={styles.fullWidth}>
                    <Button
                      size="small"
                      className={styles.actionButton}
                      onClick={() => setAddingBaggageFor(true)}
                    >
                      Добавить ещё багаж
                    </Button>
                    {draftFilters.extraBaggageEntries.length > 0 && (
                      <Button
                        size="small"
                        className={styles.actionButton}
                        onClick={() =>
                          removeBaggageEntry(draftFilters.extraBaggageEntries.length - 1)
                        }
                      >
                        Удалить багаж
                      </Button>
                    )}
                  </Flex>
                )}
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
