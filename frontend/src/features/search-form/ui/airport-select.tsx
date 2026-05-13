import type { AirportOption } from '../model/types';
import { Flex, Select, Spin, Typography } from 'antd';
import { useState } from 'react';
import { ArrowDown } from '@/shared/assets';
import type { AirportDto } from '@/shared/types';
import { cn } from '@/shared/utils';
import { fetchAirportOptions } from '../model/fetch-airport-options';
import styles from './search-form.module.css';

interface Props {
  label: string;
  placeholder: string;
  initialOption: AirportDto;
  initialOptions?: AirportDto[];
  value?: string;
  onChange?: (value: string) => void;
}

const mapSelectOption = (option: AirportDto): AirportOption => ({
  value: option.id,
  label: option.airport,
  option: {
    city: option.city,
    airport: option.airport,
    code: option.id,
  },
});

const mergeOptions = (options: AirportOption[]) => {
  const optionMap = new Map<string, AirportOption>();

  options.forEach((option) => {
    optionMap.set(option.value, option);
  });

  return Array.from(optionMap.values());
};

export const AirportSelect = ({
  label,
  placeholder,
  initialOption,
  initialOptions = [initialOption],
  value,
  onChange,
}: Props) => {
  const initialSelectOptions = initialOptions.map(mapSelectOption);

  const [options, setOptions] = useState<AirportOption[]>(initialSelectOptions);
  const [isInitialOptionsLoaded, setIsInitialOptionsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selectedValue = value ?? initialOption.id;

  const getOptions = async (search?: string) => {
    setLoading(true);

    try {
      const data = await fetchAirportOptions(search);
      const fetchedOptions = data.map(mapSelectOption);
      const selectedOption = options.find((option) => option.value === selectedValue);

      setOptions(
        mergeOptions([
          ...initialSelectOptions,
          ...(selectedOption ? [selectedOption] : []),
          ...fetchedOptions,
        ]),
      );

      if (!search) {
        setIsInitialOptionsLoaded(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex className={styles.field} vertical justify="space-around">
      <Typography.Paragraph className={styles.label}>{label}</Typography.Paragraph>

      <Select<string, AirportOption>
        value={selectedValue}
        options={options}
        placeholder={placeholder}
        variant="borderless"
        suffixIcon={
          <ArrowDown
            className={cn(styles.arrow, {
              [styles.arrowOpen]: isOpen,
            })}
          />
        }
        popupMatchSelectWidth={200}
        loading={loading}
        notFoundContent={loading ? <Spin size="small" /> : 'Ничего не найдено'}
        showSearch={{
          optionFilterProp: 'label',
          filterOption: false,
          onSearch: (search) => {
            void getOptions(search);
          },
        }}
        onOpenChange={(open) => {
          setIsOpen(open);

          if (open && !isInitialOptionsLoaded) {
            void getOptions();
          }
        }}
        onChange={(nextValue) => {
          onChange?.(nextValue);
        }}
        optionRender={(option) => {
          const airport = option.data.option;

          return (
            <Flex vertical gap={4}>
              <Flex gap={6} align="baseline">
                <Typography.Text>{airport.airport}</Typography.Text>
                <Typography.Text className={styles.airport_select__code}>
                  {airport.code}
                </Typography.Text>
              </Flex>

              <Typography.Text type="secondary">{airport.city}</Typography.Text>
            </Flex>
          );
        }}
      />
    </Flex>
  );
};
