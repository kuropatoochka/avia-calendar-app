import { Checkbox, InputNumber, Select, Slider, Typography } from 'antd';
import type { BaggageType, DepartureTime, PetTransport } from '../lib/types';
import { useFlightFilters } from '../lib/useFlightFilters';
import styles from './styles.module.css';

const DEPARTURE_TIMES: { value: DepartureTime; label: string }[] = [
  { value: 'morning', label: 'Утро' },
  { value: 'afternoon', label: 'День' },
  { value: 'evening', label: 'Вечер' },
  { value: 'night', label: 'Ночь' },
];

const AIRLINES = [
  { value: 'aeroflot', label: 'Аэрофлот' },
  { value: 's7', label: 'S7 Airlines' },
  { value: 'pobeda', label: 'Победа' },
  { value: 'ural', label: 'Уральские авиалинии' },
  { value: 'rossiya', label: 'Россия' },
];

export const FlightFilters = () => {
  const { filters, updateFilter, resetFilters } = useFlightFilters();

  const toggleDepartureTime = (value: DepartureTime, checked: boolean) => {
    const next = checked
      ? [...filters.departureTimes, value]
      : filters.departureTimes.filter((t) => t !== value);
    updateFilter('departureTimes', next);
  };

  const toggleBaggageType = (value: BaggageType, checked: boolean) => {
    const next: BaggageType[] = checked
      ? [...filters.baggageTypes, value]
      : filters.baggageTypes.filter((t) => t !== value);
    updateFilter('baggageTypes', next);
  };

  const togglePetTransport = (value: PetTransport, checked: boolean) => {
    const next: PetTransport[] = checked
      ? [...filters.petTransport, value]
      : filters.petTransport.filter((t) => t !== value);
    updateFilter('petTransport', next);
  };

  return (
    <div>
      <div className={styles.header}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Дополнительные фильтры
        </Typography.Title>
        <Typography.Link onClick={resetFilters}>Сбросить</Typography.Link>
      </div>

      <div className={styles.panel}>
        {/* ПЕРЕЛЁТ */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Перелёт</div>

          <div className={styles.row}>
            <span className={styles.label}>Количество доступных пересадок, (шт):</span>
            <InputNumber
              className={styles.numberInput}
              min={0}
              value={filters.maxStops}
              onChange={(v) => v !== null && updateFilter('maxStops', v)}
            />
          </div>

          <div className={styles.label}>Длительность пересадки, (часы):</div>
          <div className={styles.sliderLabels}>
            <span>{filters.stopDurationRange[0]}</span>
            <span>{filters.stopDurationRange[1]}</span>
          </div>
          <Slider
            range
            min={1}
            max={72}
            value={filters.stopDurationRange}
            onChange={(v) => updateFilter('stopDurationRange', v as [number, number])}
            tooltip={{ formatter: (v) => `${v} ч` }}
          />

          <div className={styles.row}>
            <span className={styles.label}>Максимальное время перелета, (часы):</span>
            <InputNumber
              className={styles.numberInput}
              min={1}
              value={filters.maxFlightDuration}
              onChange={(v) => v !== null && updateFilter('maxFlightDuration', v)}
            />
          </div>

          <div className={styles.label}>Удобное время вылета:</div>
          <div className={styles.checkboxGrid}>
            {DEPARTURE_TIMES.map(({ value, label }) => (
              <Checkbox
                key={value}
                checked={filters.departureTimes.includes(value)}
                onChange={(e) => toggleDepartureTime(value, e.target.checked)}
              >
                {label}
              </Checkbox>
            ))}
          </div>
        </div>

        {/* СТОИМОСТЬ */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Стоимость</div>

          <div className={styles.checkboxRow}>
            <Checkbox
              checked={filters.pricePerPassenger}
              onChange={(e) => updateFilter('pricePerPassenger', e.target.checked)}
            >
              Цена за пассажира
            </Checkbox>
            <Checkbox
              checked={!filters.pricePerPassenger}
              onChange={(e) => updateFilter('pricePerPassenger', !e.target.checked)}
            >
              Цена за всех
            </Checkbox>
          </div>

          <div className={styles.label}>Диапазон цены, (руб.):</div>
          <div className={styles.sliderLabels}>
            <span>{filters.priceRange[0].toLocaleString('ru-RU')}</span>
            <span>{filters.priceRange[1].toLocaleString('ru-RU')}</span>
          </div>
          <Slider
            range
            min={100}
            max={1_000_000}
            step={100}
            value={filters.priceRange}
            onChange={(v) => updateFilter('priceRange', v as [number, number])}
            tooltip={{ formatter: (v) => `${v?.toLocaleString('ru-RU')} ₽` }}
          />
        </div>

        {/* УСЛОВИЯ */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Условия</div>

          <div className={styles.label}>Тип багажа:</div>
          <div className={styles.checkboxRow}>
            <Checkbox
              checked={filters.baggageTypes.includes('hand')}
              onChange={(e) => toggleBaggageType('hand', e.target.checked)}
            >
              Ручная кладь
            </Checkbox>
            <Checkbox
              checked={filters.baggageTypes.includes('checked')}
              onChange={(e) => toggleBaggageType('checked', e.target.checked)}
            >
              Багаж
            </Checkbox>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Багаж, (в килограммах)</span>
            <InputNumber
              className={styles.numberInput}
              min={0}
              value={filters.maxBaggageWeight}
              onChange={(v) => v !== null && updateFilter('maxBaggageWeight', v)}
            />
          </div>

          <div className={styles.label}>Авиакомпания</div>
          <Select
            className={styles.select}
            placeholder="Выберите авиакомпанию"
            value={filters.airline || undefined}
            onChange={(v) => updateFilter('airline', v ?? '')}
            options={AIRLINES}
            allowClear
          />

          <div className={styles.label} style={{ marginTop: 12 }}>
            Перевозка животных:
          </div>
          <div className={styles.checkboxRow}>
            <Checkbox
              checked={filters.petTransport.includes('cabin')}
              onChange={(e) => togglePetTransport('cabin', e.target.checked)}
            >
              В салоне
            </Checkbox>
            <Checkbox
              checked={filters.petTransport.includes('baggage')}
              onChange={(e) => togglePetTransport('baggage', e.target.checked)}
            >
              Как багаж
            </Checkbox>
          </div>
        </div>
      </div>
    </div>
  );
};
