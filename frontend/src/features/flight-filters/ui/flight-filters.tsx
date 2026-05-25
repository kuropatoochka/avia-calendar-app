import type { FlightFiltersState } from '../model/types';
import type { CollapseProps } from 'antd';
import { Button, Collapse, Flex, Tooltip, Typography } from 'antd';
import { ArrowDown, ArrowRotateLeft } from '@/shared/assets';
import { cn } from '@/shared/utils';
import { DEFAULT_FLIGHT_FILTERS } from '../model/defaults';
import { getActiveFiltersCount } from '../model/get-active-filter-count';
import { useFlightFilters } from '../model/use-flight-filters';
import { ConditionsSection } from './conditions-section';
import styles from './flight-filters.module.css';
import { FlightSection } from './flight-section';
import { PriceSection } from './price-section';

type PassengerCounts = {
  adults: number;
  children: number;
  toddler: number;
};

type CompanyOption = {
  value: number;
  label: string;
};

type Props = {
  onApply?: (filters: FlightFiltersState) => void;
  passengers?: PassengerCounts;
  companyOptions?: CompanyOption[];
  filters?: FlightFiltersState | null;
};

export const FlightFilters = ({ onApply, passengers, companyOptions = [], filters }: Props) => {
  const {
    draftFilters,
    updateDraftFilter,
    addBaggageEntry,
    removeBaggageEntry,
    updateAnimalCount,
    resetFilters,
  } = useFlightFilters(filters);

  const activeFiltersCount = getActiveFiltersCount(draftFilters);
  const hasSelectedFilters = activeFiltersCount > 0;

  const handleApplyFilters = () => {
    if (!hasSelectedFilters) {
      return;
    }

    onApply?.(draftFilters);
  };
  const handleResetFilters = () => {
    resetFilters();
    onApply?.(DEFAULT_FLIGHT_FILTERS);
  };

  const filterSections: CollapseProps['items'] = [
    {
      key: 'flight',
      label: <Typography.Text className={styles.sectionTitle}>Перелёт</Typography.Text>,
      children: <FlightSection filters={draftFilters} updateFilter={updateDraftFilter} />,
    },
    {
      key: 'price',
      label: <Typography.Text className={styles.sectionTitle}>Стоимость</Typography.Text>,
      children: <PriceSection filters={draftFilters} updateFilter={updateDraftFilter} />,
    },
    {
      key: 'conditions',
      label: <Typography.Text className={styles.sectionTitle}>Условия</Typography.Text>,
      children: (
        <ConditionsSection
          filters={draftFilters}
          passengers={passengers}
          companyOptions={companyOptions}
          updateFilter={updateDraftFilter}
          addBaggageEntry={addBaggageEntry}
          removeBaggageEntry={removeBaggageEntry}
          updateAnimalCount={updateAnimalCount}
        />
      ),
    },
  ];

  return (
    <Flex vertical gap={12} className={styles.container}>
      <Flex justify="space-between" align="center">
        <Typography.Title level={3}>Дополнительные фильтры</Typography.Title>

        <Flex align="center" gap={8}>
          <Button
            type="primary"
            className={styles.applyButton}
            disabled={!hasSelectedFilters}
            onClick={handleApplyFilters}
          >
            Применить
          </Button>

          <Tooltip title="Сброс фильтров">
            <Button
              icon={<ArrowRotateLeft className={styles.resetIcon} />}
              className={styles.resetBtn}
              disabled={!hasSelectedFilters}
              onClick={handleResetFilters}
            />
          </Tooltip>
        </Flex>
      </Flex>

      <Flex vertical className={styles.panel}>
        <Collapse
          className={styles.collapse}
          bordered={false}
          expandIcon={({ isActive }) => (
            <ArrowDown className={cn(styles.collapseIcon, isActive && styles.collapseIconOpen)} />
          )}
          expandIconPlacement="end"
          defaultActiveKey={['flight', 'price', 'conditions']}
          items={filterSections}
        />
      </Flex>
    </Flex>
  );
};
