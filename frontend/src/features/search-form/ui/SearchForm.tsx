import { useState } from 'react';
import { Search, Swap } from '@/shared/assets';
import { useSearchForm } from '../hooks/useSearchForm';
import { CitySelect } from './CitySelect';
import { DateRangeSelect } from './DateRangeSelect';
import { PassengerSelect } from './PassengerSelect';
import styles from './styles.module.css';
import { TripTypeSelect } from './TripTypeSelect';

export const SearchForm = () => {
  const {
    tripType,
    setTripType,
    passengers,
    setPassengers,
    serviceClasses,
    toggleServiceClass,
    originValue,
    originId,
    setOriginValue,
    setOriginId,
    destValue,
    destId,
    setDestValue,
    setDestId,
    dateRange,
    setDateRange,
    errors,
    setErrors,
    handleSwap,
    handleSearch,
    fetchAirportOptions,
  } = useSearchForm();

  const [tripTypeOpen, setTripTypeOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [passengersOpen, setPassengersOpen] = useState(false);

  return (
    <div className={styles.searchForm}>
      <div className={styles.formRow}>
        <div className={styles.cityGroup}>
          <CitySelect
            label="Откуда"
            placeholder="Город вылета"
            cityName={originValue}
            cityId={originId}
            hasError={errors.origin}
            fetchOptions={fetchAirportOptions}
            onSelect={(option) => {
              setOriginValue(option.value);
              setOriginId(option.airportId);
              setErrors((prev) => ({ ...prev, origin: false }));
            }}
          />

          <button
            type="button"
            className={styles.swapBtn}
            onClick={handleSwap}
            aria-label="Поменять города"
          >
            <span className={styles.swapIcon} aria-hidden="true">
              <Swap />
            </span>
          </button>

          <CitySelect
            label="Куда"
            placeholder="Город назначения"
            cityName={destValue}
            cityId={destId}
            hasError={errors.dest}
            fetchOptions={fetchAirportOptions}
            onSelect={(option) => {
              setDestValue(option.value);
              setDestId(option.airportId);
              setErrors((prev) => ({ ...prev, dest: false }));
            }}
          />
        </div>

        <TripTypeSelect
          value={tripType}
          open={tripTypeOpen}
          onOpenChange={setTripTypeOpen}
          onChange={setTripType}
        />

        <DateRangeSelect
          value={dateRange}
          open={datePickerOpen}
          hasError={errors.dates}
          onOpenChange={setDatePickerOpen}
          onChange={(value) => {
            setDateRange(value);
            setErrors((prev) => ({ ...prev, dates: false }));
          }}
        />

        <PassengerSelect
          open={passengersOpen}
          onOpenChange={setPassengersOpen}
          passengers={passengers}
          setPassengers={setPassengers}
          serviceClasses={serviceClasses}
          toggleServiceClass={toggleServiceClass}
        />

        <button
          type="button"
          className={styles.searchBtn}
          onClick={handleSearch}
          aria-label="Найти"
        >
          <span className={styles.searchIcon} aria-hidden="true">
            <Search />
          </span>
        </button>
      </div>
    </div>
  );
};
