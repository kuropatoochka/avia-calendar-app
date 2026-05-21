import type { FlightFiltersState } from '../model/types';
import type { ReactNode } from 'react';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Checkbox, Flex, InputNumber, Select, Tooltip, Typography } from 'antd';
import { Fragment, useState } from 'react';
import { Cross, ExclamationMark, Search } from '@/shared/assets';
import { FieldRow } from './field-row';
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

type CompanyOption = {
  value: number;
  label: ReactNode;
};

type UpdateFilter = <K extends keyof FlightFiltersState>(
  key: K,
  value: FlightFiltersState[K],
) => void;

type ConditionsSectionProps = {
  filters: FlightFiltersState;
  passengers?: PassengerCounts;
  companyOptions?: CompanyOption[];
  updateFilter: UpdateFilter;
  addBaggageEntry: (passengerIndex: number) => void;
  removeBaggageEntry: (entryIndex: number) => void;
  updateAnimalCount: (count: number) => void;
};

const buildPassengerEntries = (passengers?: PassengerCounts): PassengerEntry[] => {
  const adults = passengers?.adults ?? 1;
  const children = passengers?.children ?? 0;
  const toddlers = passengers?.toddler ?? 0;
  const entries: PassengerEntry[] = [];

  for (let index = 0; index < adults; index += 1) {
    entries.push({
      label: adults > 1 ? `Пассажир ${index + 1}` : 'Пассажир',
      defaultWeight: 20,
    });
  }

  for (let index = 0; index < children; index += 1) {
    entries.push({
      label: children > 1 ? `Ребёнок ${index + 1}` : 'Ребёнок',
      defaultWeight: 0,
    });
  }

  for (let index = 0; index < toddlers; index += 1) {
    entries.push({
      label: toddlers > 1 ? `Младенец ${index + 1}` : 'Младенец',
      defaultWeight: 0,
    });
  }

  return entries;
};

export const ConditionsSection = ({
  filters,
  passengers,
  companyOptions = [],
  updateFilter,
  addBaggageEntry,
  removeBaggageEntry,
  updateAnimalCount,
}: ConditionsSectionProps) => {
  const [addingBaggageFor, setAddingBaggageFor] = useState(false);
  const [passengerSelectOpen, setPassengerSelectOpen] = useState(false);

  const passengerEntries = buildPassengerEntries(passengers);
  const firstChildIndex = passengerEntries.findIndex((entry) => entry.defaultWeight === 0);

  return (
    <Flex vertical gap={16} className={styles.fullWidth}>
      <Flex vertical gap={8}>
        <Flex align="center" gap={6}>
          <Checkbox
            checked={filters.baggageEnabled}
            onChange={(event) => {
              const enabled = event.target.checked;

              updateFilter('baggageEnabled', enabled);

              if (enabled) {
                updateFilter(
                  'baggageWeights',
                  passengerEntries.map(
                    (entry, index) => filters.baggageWeights[index] ?? entry.defaultWeight,
                  ),
                );
              }
            }}
          >
            Багаж
          </Checkbox>

          {filters.baggageEnabled && firstChildIndex !== -1 && (
            <Tooltip title="при выборе «0» кг, багаж не учитывается">
              <ExclamationMark className={styles.infoIcon} />
            </Tooltip>
          )}
        </Flex>

        {filters.baggageEnabled && (
          <Flex vertical gap={8}>
            {passengerEntries.map((entry, passengerIndex) => {
              const weight = filters.baggageWeights[passengerIndex] ?? entry.defaultWeight;

              const passengerExtras = filters.extraBaggageEntries
                .map((extra, index) => ({ ...extra, globalIndex: index }))
                .filter((extra) => extra.passengerIndex === passengerIndex);

              return (
                <Fragment key={passengerIndex}>
                  <FieldRow label={entry.label}>
                    <Flex gap={6} align="center">
                      <InputNumber
                        className={styles.numberInput}
                        min={0}
                        value={weight}
                        onChange={(value) => {
                          if (typeof value === 'number') {
                            const next = Array.from(
                              {
                                length: Math.max(filters.baggageWeights.length, passengerIndex + 1),
                              },
                              (_, index) =>
                                filters.baggageWeights[index] ??
                                passengerEntries[index]?.defaultWeight ??
                                20,
                            );

                            next[passengerIndex] = value;
                            updateFilter('baggageWeights', next);
                          }
                        }}
                      />
                      <Typography.Text className={styles.unitLabel}>кг</Typography.Text>
                    </Flex>
                  </FieldRow>

                  {passengerExtras.map((extra, extraOrder) => (
                    <FieldRow key={extra.globalIndex} label={`Доп. багаж ${extraOrder + 1}`}>
                      <Flex gap={6} align="center">
                        <InputNumber
                          className={styles.numberInput}
                          min={0}
                          value={extra.weight}
                          onChange={(value) => {
                            if (typeof value === 'number') {
                              const next = [...filters.extraBaggageEntries];

                              next[extra.globalIndex] = {
                                ...next[extra.globalIndex],
                                weight: value,
                              };

                              updateFilter('extraBaggageEntries', next);
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
                onOpenChange={setPassengerSelectOpen}
                options={passengerEntries.map((entry, index) => ({
                  label: entry.label,
                  value: index,
                }))}
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
              <Flex justify="space-between">
                <Button
                  size="small"
                  className={styles.actionButton}
                  onClick={() => setAddingBaggageFor(true)}
                >
                  Добавить ещё багаж
                </Button>

                {filters.extraBaggageEntries.length > 0 && (
                  <Button
                    size="small"
                    className={styles.actionButton}
                    onClick={() => removeBaggageEntry(filters.extraBaggageEntries.length - 1)}
                  >
                    Удалить багаж
                  </Button>
                )}
              </Flex>
            )}
          </Flex>
        )}
      </Flex>

      <Flex vertical gap={8}>
        <Flex align="center" gap={6}>
          <Checkbox
            checked={filters.petsEnabled}
            onChange={(event) => {
              const enabled = event.target.checked;

              updateFilter('petsEnabled', enabled);

              if (enabled && filters.animalWeights.length === 0) {
                updateFilter('animalWeights', [10]);
              }
            }}
          >
            Перевозка животных как багаж
          </Checkbox>

          <Tooltip title="Животные добавляются к общему весу багажа">
            <QuestionCircleOutlined style={{ color: 'var(--color-accent)' }} />
          </Tooltip>
        </Flex>

        {filters.petsEnabled && (
          <Flex vertical gap={8} className={styles.fullWidth}>
            <FieldRow label="Количество животных">
              <Flex gap={6} align="center">
                <InputNumber
                  className={styles.numberInput}
                  min={1}
                  max={9}
                  value={filters.animalWeights.length}
                  onChange={(value) => {
                    if (typeof value === 'number') {
                      updateAnimalCount(value);
                    }
                  }}
                />
                <Typography.Text className={styles.unitLabel}>шт</Typography.Text>
              </Flex>
            </FieldRow>

            {filters.animalWeights.map((weight, index) => (
              <FieldRow key={index} label={`Животное ${index + 1}`}>
                <Flex gap={6} align="center">
                  <InputNumber
                    className={styles.numberInput}
                    min={0}
                    value={weight}
                    onChange={(value) => {
                      if (typeof value === 'number') {
                        const next = [...filters.animalWeights];

                        next[index] = value;
                        updateFilter('animalWeights', next);
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

      <Flex vertical gap={4} className={styles.fullWidth}>
        <Typography.Text className={styles.label}>Авиакомпания</Typography.Text>

        <Select
          mode="multiple"
          className={styles.select}
          placeholder="Выберите авиакомпанию"
          value={filters.airlines}
          onChange={(value: number[]) => updateFilter('airlines', value)}
          options={companyOptions}
          suffixIcon={
            filters.airlines.length > 0 ? (
              <span
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  updateFilter('airlines', []);
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
  );
};
