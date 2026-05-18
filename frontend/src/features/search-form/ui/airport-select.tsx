import type { SelectOption } from '../model/types';
import { Flex, Select, Typography } from 'antd';
import { useState } from 'react';
import { ArrowDown } from '@/shared/assets';
import { cn } from '@/shared/utils';
import styles from './search-form.module.css';

interface Props {
  label: string;
  placeholder: string;
  options: SelectOption[];
  isLoading: boolean;
  value?: number;
  onChange?: (value: number) => void;
  onSearch: (search: string) => void;
  onOpenChange: (open: boolean) => void;
  hasError?: boolean;
}

export const AirportSelect = ({
  label,
  placeholder,
  options,
  isLoading,
  value,
  onChange,
  onSearch,
  onOpenChange,
  hasError = false,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Flex
      className={cn(styles.field, styles.airportSelect, {
        [styles.fieldError]: hasError,
      })}
      vertical
      justify="space-around"
    >
      <Typography.Paragraph className={styles.airportSelectLabel}>{label}</Typography.Paragraph>

      <Select<number, SelectOption>
        value={value}
        options={options}
        placeholder={placeholder}
        variant="borderless"
        suffixIcon={<ArrowDown className={cn(styles.arrow, { [styles.arrowOpen]: open })} />}
        popupMatchSelectWidth={200}
        loading={isLoading}
        notFoundContent="Результаты не найдены"
        showSearch={{
          optionFilterProp: 'label',
          filterOption: false,
          onSearch,
        }}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          onOpenChange(nextOpen);
        }}
        onChange={(value) => {
          onChange?.(value);
        }}
        optionRender={(option) => {
          const { airport, city } = option.data.option;

          return (
            <Flex vertical gap={2}>
              <Typography.Text>{airport}</Typography.Text>
              <Typography.Text type="secondary">{city}</Typography.Text>
            </Flex>
          );
        }}
      />
    </Flex>
  );
};
