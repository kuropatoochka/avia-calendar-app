import { Checkbox, Flex, InputNumber, Select, Slider, Typography } from 'antd';
import type { BaggageType, DepartureTime, PetTransport } from '../types/flightFilters';
import { AIRLINE_OPTIONS, DEPARTURE_TIME_LABELS, DEPARTURE_TIMES } from '../consts/labels';
import { useFlightFilters } from '../hooks/useFlightFilters';
import styles from './styles.module.css';

export const FlightFilters = () => {
  const { filters, updateFilter, resetFilters } = useFlightFilters();

  const toggleDepartureTime = (value: DepartureTime, checked: boolean) => {
    if (!checked && filters.departureTimes.length === 1) return;
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
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Дополнительные фильтры
        </Typography.Title>
        <Typography.Link onClick={resetFilters}>Сбросить</Typography.Link>
      </Flex>

      <div className={styles.panel}>
        {/* ПЕРЕЛЁТ */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Перелёт</div>

          <Flex justify="space-between" align="flex-start" gap={8} style={{ marginBottom: 12 }}>
            <span className={styles.label}>Количество доступных пересадок, (шт):</span>
            <InputNumber
              className={styles.numberInput}
              min={0}
              value={filters.maxStops}
              onChange={(v) => v !== null && updateFilter('maxStops', v)}
            />
          </Flex>

          <div className={styles.label}>Длительность пересадки, (часы):</div>
          <Flex justify="space-between" style={{ marginBottom: 2 }}>
            <span className={styles.sliderLabel}>{filters.stopDurationRange[0]}</span>
            <span className={styles.sliderLabel}>{filters.stopDurationRange[1]}</span>
          </Flex>
          <Slider
            range
            min={1}
            max={72}
            value={filters.stopDurationRange}
            onChange={(v) => updateFilter('stopDurationRange', v as [number, number])}
            tooltip={{ formatter: (v) => `${v} ч` }}
          />

          <Flex justify="space-between" align="flex-start" gap={8} style={{ marginBottom: 12 }}>
            <span className={styles.label}>Максимальное время перелета, (часы):</span>
            <InputNumber
              className={styles.numberInput}
              min={1}
              value={filters.maxFlightDuration}
              onChange={(v) => v !== null && updateFilter('maxFlightDuration', v)}
            />
          </Flex>

          <div className={styles.label}>Удобное время вылета:</div>
          <div className={styles.checkboxGrid}>
            {DEPARTURE_TIMES.map((value) => (
              <Checkbox
                key={value}
                checked={filters.departureTimes.includes(value)}
                onChange={(e) => toggleDepartureTime(value, e.target.checked)}
              >
                {DEPARTURE_TIME_LABELS[value]}
              </Checkbox>
            ))}
          </div>
        </div>

        {/* СТОИМОСТЬ */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Стоимость</div>

          <Flex gap={16} style={{ marginBottom: 12 }}>
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
          </Flex>

          <div className={styles.label}>Диапазон цены, (руб.):</div>
          <Flex justify="space-between" style={{ marginBottom: 2 }}>
            <span className={styles.sliderLabel}>
              {filters.priceRange[0].toLocaleString('ru-RU')}
            </span>
            <span className={styles.sliderLabel}>
              {filters.priceRange[1].toLocaleString('ru-RU')}
            </span>
          </Flex>
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
          <Flex gap={16} style={{ marginBottom: 12 }}>
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
          </Flex>

          <Flex justify="space-between" align="flex-start" gap={8} style={{ marginBottom: 12 }}>
            <span className={styles.label}>Багаж, (в килограммах)</span>
            <InputNumber
              className={styles.numberInput}
              min={0}
              value={filters.maxBaggageWeight}
              onChange={(v) => v !== null && updateFilter('maxBaggageWeight', v)}
            />
          </Flex>

          <div className={styles.label}>Авиакомпания</div>
          <Select
            className={styles.select}
            placeholder="Выберите авиакомпанию"
            value={filters.airline || undefined}
            onChange={(v) => updateFilter('airline', v ?? '')}
            options={AIRLINE_OPTIONS}
            allowClear
          />

          <div className={styles.label} style={{ marginTop: 12 }}>
            Перевозка животных:
          </div>
          <Flex gap={16}>
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
          </Flex>
        </div>
      </div>
    </div>
  );
};
