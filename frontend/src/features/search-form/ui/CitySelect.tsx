import type { AirportOption } from '../types/searchForm';
import { Select } from 'antd';
import classNames from 'clsx';
import { useState, useRef } from 'react';
import styles from './styles.module.css';

interface CitySelectProps {
  label: string;
  placeholder: string;
  cityName: string;
  cityId: string;
  hasError?: boolean;
  fetchOptions: (search: string) => Promise<AirportOption[]>;
  onSelect: (opt: AirportOption) => void;
}


export const CitySelect = ({
  label,
  placeholder,
  cityName,
  cityId,
  hasError,
  fetchOptions,
  onSelect,
}: CitySelectProps) => {
  const [options, setOptions] = useState<AirportOption[]>([]);
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setOpen(true);
    fetchOptions('').then(setOptions);
  };

  return (
    <div
      ref={cardRef}
      className={classNames(styles.cityCard, {
        [styles.cityCardError]: hasError,
      })}
      onClick={handleOpen}
    >
      <span className={styles.cityLabel}>{label}</span>
      <Select
        labelInValue
        showSearch
        variant="borderless"
        suffixIcon={null}
        className={styles.citySelectInput}
        placeholder={placeholder}
        value={cityId ? { value: cityId, label: cityName } : undefined}
        open={open}
        onDropdownVisibleChange={setOpen}
        options={options.map((o) => ({
          value: o.airportId,
          label: o.value,
          city: o.value,
          airport: o.label.split(' — ')[1] ?? '',
          code: o.airportId.toUpperCase(),
        }))}
        filterOption={false}
        notFoundContent="Ничего не найдено"
        onSearch={(v) => fetchOptions(v).then(setOptions)}
        onChange={(opt) => {
          const airport = options.find((o) => o.airportId === opt.value);
          if (airport) onSelect(airport);
        }}
        getPopupContainer={() => cardRef.current ?? document.body}
        popupMatchSelectWidth={false}
        optionRender={(option) => (
          <div className={styles.airportOption}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span className={styles.airportCity}>{option.data.city as string}</span>
              <span className={styles.airportCode}>{option.data.code as string}</span>
            </div>
            <span className={styles.airportName}>{option.data.airport as string}</span>
          </div>
        )}
      />
    </div>
  );
};
