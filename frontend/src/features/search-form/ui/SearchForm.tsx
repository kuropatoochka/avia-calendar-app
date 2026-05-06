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
            onSelect={(opt) => {
              setOriginValue(opt.value);
              setOriginId(opt.airportId);
              setErrors((e) => ({ ...e, origin: false }));
            }}
          />

          <button
            type="button"
            className={styles.swapBtn}
            onClick={handleSwap}
            aria-label="Поменять города"
          >
            <Swap className={styles.swapIcon} />
          </button>

          <CitySelect
            label="Куда"
            placeholder="Город назначения"
            cityName={destValue}
            cityId={destId}
            hasError={errors.dest}
            fetchOptions={fetchAirportOptions}
            onSelect={(opt) => {
              setDestValue(opt.value);
              setDestId(opt.airportId);
              setErrors((e) => ({ ...e, dest: false }));
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
          onChange={(val) => {
            setDateRange(val);
            setErrors((e) => ({ ...e, dates: false }));
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
          <Search className={styles.searchIcon} />
        </button>
      </div>
    </div>
  );
};
