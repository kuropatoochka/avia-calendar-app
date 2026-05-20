import type { FlightFiltersState } from '../model/types';
import type { CollapseProps } from 'antd';
import { Button, Collapse, Flex, Tooltip, Typography } from 'antd';
import { ArrowDown, ArrowRotateLeft } from '@/shared/assets';
import { cn } from '@/shared/utils';
import { DEFAULT_FLIGHT_FILTERS } from '../model/defaults';
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

type FlightFiltersProps = {
  onApply?: (filters: FlightFiltersState) => void;
  passengers?: PassengerCounts;
  companyOptions?: CompanyOption[];
};

export const FlightFilters = ({ onApply, passengers, companyOptions = [] }: FlightFiltersProps) => {
  const {
    draftFilters,
    updateDraftFilter,
    addBaggageEntry,
    removeBaggageEntry,
    updateAnimalCount,
    resetFilters,
  } = useFlightFilters();

  const handleApplyFilters = () => {
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

        <Tooltip title="Сброс фильтров">
          <Button
            icon={<ArrowRotateLeft className={styles.resetIcon} />}
            className={styles.resetBtn}
            onClick={handleResetFilters}
          />
        </Tooltip>
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

        <Flex justify="flex-end">
          <Button type="primary" className={styles.applyButton} onClick={handleApplyFilters}>
            Применить фильтры
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
