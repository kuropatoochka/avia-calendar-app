import type { InputRef } from 'antd';
import type { Dayjs } from 'dayjs';
import { ConfigProvider, DatePicker, Input, Popover, Tooltip } from 'antd';
import { useState, useCallback, useRef, useEffect } from 'react';
import AirportService from '@/shared/api/AirportService';
import ArrowDown from '@/shared/assets/ArrowDown.svg?react';
import Person from '@/shared/assets/Person.svg?react';
import Search from '@/shared/assets/Search.svg?react';
import Swap from '@/shared/assets/Swap.svg?react';
import type { AirportDto, Passengers } from '@/shared/types/api';
import styles from './styles.module.css';

type TripType = 'oneWay' | 'roundTrip';

interface AirportOption {
  value: string; // city name
  label: string; // "City — Airport"
  airportId: string;
}

interface PassengersState {
  adults: number;
  children: number;
  toddler: number;
  animals: number;
}

type ServiceClass = 'economy' | 'business' | 'first';

const SERVICE_CLASS_LABELS: Record<ServiceClass, string> = {
  economy: 'Эконом',
  business: 'Бизнес',
  first: 'Первый',
};

const TRIP_TYPE_LABELS: Record<TripType, string> = {
  oneWay: 'В одну сторону',
  roundTrip: 'Туда-обратно',
};

const getPassengerLabel = (p: PassengersState): string => {
  const total = p.adults + p.children + p.toddler;
  if (total === 1) return '1 пассажир';
  if (total >= 2 && total <= 4) return `${total} пассажира`;
  return `${total} пассажиров`;
};

const PassengerCounter = ({
  label,
  subLabel,
  helpText,
  value,
  min,
  onChange,
}: {
  label: string;
  subLabel?: string;
  helpText?: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) => (
  <div className={styles.passengerRow}>
    <div className={styles.passengerLabelGroup}>
      <span className={styles.passengerLabel}>
        {label}
        {helpText && (
          <Tooltip title={helpText} placement="top">
            <span className={styles.helpIcon}>?</span>
          </Tooltip>
        )}
      </span>
      {subLabel && <span className={styles.passengerSubLabel}>{subLabel}</span>}
    </div>
    <div className={styles.passengerCounter}>
      <button
        type="button"
        className={styles.counterBtn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        −
      </button>
      <span className={styles.counterValue}>{value}</span>
      <button type="button" className={styles.counterBtn} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  </div>
);

// ── Custom city search dropdown ────────────────────────────────────────────
interface CityDropdownProps {
  open: boolean;
  options: AirportOption[];
  search: string;
  onSearch: (v: string) => void;
  onSelect: (opt: AirportOption) => void;
  onClose: () => void;
}

const CityDropdown = ({
  open,
  options,
  search,
  onSearch,
  onSelect,
  onClose,
}: CityDropdownProps) => {
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.cityDropdown} onMouseDown={(e) => e.stopPropagation()}>
      <Input
        ref={inputRef}
        value={search}
        placeholder="Поиск города..."
        className={styles.citySearchInput}
        onChange={(e) => onSearch(e.target.value)}
        allowClear
        onClear={() => onSearch('')}
      />
      <div className={styles.citySearchList}>
        {options.length > 0 ? (
          options.map((opt) => (
            <button
              key={opt.airportId}
              type="button"
              className={styles.citySearchOption}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(opt);
                onClose();
              }}
            >
              <span className={styles.citySearchOptionName}>{opt.value}</span>
              <span className={styles.citySearchOptionAirport}>{opt.label}</span>
            </button>
          ))
        ) : (
          <div className={styles.citySearchEmpty}>Ничего не найдено</div>
        )}
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
export const SearchForm = () => {
  const [tripType, setTripType] = useState<TripType>('oneWay');
  const [tripTypeOpen, setTripTypeOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [passengersOpen, setPassengersOpen] = useState(false);
  const [passengers, setPassengers] = useState<PassengersState>({
    adults: 1,
    children: 0,
    toddler: 0,
    animals: 0,
  });
  const [serviceClasses, setServiceClasses] = useState<ServiceClass[]>(['economy']);

  // City search state
  const [originOpen, setOriginOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [originOptions, setOriginOptions] = useState<AirportOption[]>([]);
  const [destOptions, setDestOptions] = useState<AirportOption[]>([]);

  // Selected cities
  const [originValue, setOriginValue] = useState('Санкт-Петербург');
  const [destValue, setDestValue] = useState('Москва');
  const [originId, setOriginId] = useState('led');
  const [destId, setDestId] = useState('svo');

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [errors, setErrors] = useState<{ origin?: boolean; dest?: boolean; dates?: boolean }>({});

  const originWrapperRef = useRef<HTMLDivElement>(null);
  const destWrapperRef = useRef<HTMLDivElement>(null);

  const fetchAirports = useCallback(async (name: string): Promise<AirportOption[]> => {
    try {
      const res = await AirportService.getAirports(name.trim() || undefined);
      const data: AirportDto[] = await res.json();
      return data.map((a) => ({
        value: a.city,
        label: `${a.city} — ${a.airport}`,
        airportId: a.id,
      }));
    } catch {
      return [];
    }
  }, []);

  // Outside-click handlers to close city dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        originOpen &&
        originWrapperRef.current &&
        !originWrapperRef.current.contains(e.target as Node)
      ) {
        setOriginOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [originOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        destOpen &&
        destWrapperRef.current &&
        !destWrapperRef.current.contains(e.target as Node)
      ) {
        setDestOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [destOpen]);

  // Arrow fix: position the arrow on the right side of the calendar panel.
  // Uses MutationObserver so it re-fires whenever Ant Design resets `left`
  // (e.g. on date selection), keeping the arrow perfectly stable.
  useEffect(() => {
    if (!datePickerOpen) return;

    let observer: MutationObserver | undefined;

    const applyFix = (arrow: HTMLElement) => {
      // Guard: skip if we're the one triggering the mutation
      if (arrow.style.right === '30px' && arrow.style.left === 'auto') return;
      arrow.style.left = 'auto';
      arrow.style.right = '30px';
      arrow.style.opacity = '1';
    };

    const id = setTimeout(() => {
      const arrow = document.querySelector<HTMLElement>('.avia-date-popup .ant-picker-range-arrow');
      if (!arrow) return;
      applyFix(arrow);
      observer = new MutationObserver(() => applyFix(arrow));
      observer.observe(arrow, { attributes: true, attributeFilter: ['style'] });
    }, 0);

    return () => {
      clearTimeout(id);
      observer?.disconnect();
    };
  }, [datePickerOpen]);

  const handleOriginClick = () => {
    if (!originOpen) {
      setOriginSearch('');
      fetchAirports('').then(setOriginOptions);
    }
    setOriginOpen((v) => !v);
  };

  const handleDestClick = () => {
    if (!destOpen) {
      setDestSearch('');
      fetchAirports('').then(setDestOptions);
    }
    setDestOpen((v) => !v);
  };

  const handleSwap = () => {
    setOriginValue(destValue);
    setDestValue(originValue);
    setOriginId(destId);
    setDestId(originId);
  };

  const handleTripTypeChange = (type: TripType) => {
    setTripType(type);
    setDateRange(null);
    setTripTypeOpen(false);
  };

  const getDateLabel = () => {
    if (dateRange) {
      return `${dateRange[0].format('DD.MM')} — ${dateRange[1].format('DD.MM')}`;
    }
    return 'Желаемые даты';
  };

  const handleSearch = () => {
    const newErrors = {
      origin: !originId,
      dest: !destId,
      dates: !dateRange,
    };
    setErrors(newErrors);
    if (newErrors.origin || newErrors.dest || newErrors.dates) return;

    const pax: Passengers = {
      adults: passengers.adults,
      ...(passengers.children > 0 && { children: passengers.children }),
      ...(passengers.toddler > 0 && { toddler: passengers.toddler }),
    };
    console.log('Search:', {
      origin: originId,
      destination: destId,
      dateFrom: dateRange![0].format('YYYY-MM-DD'),
      dateTo: dateRange![1].format('YYYY-MM-DD'),
      tripType,
      pax,
    });
  };

  const toggleServiceClass = (cls: ServiceClass) => {
    setServiceClasses((prev) => {
      if (prev.includes(cls) && prev.length === 1) return prev;
      return prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls];
    });
  };

  const passengersContent = (
    <div className={styles.passengersContent}>
      <PassengerCounter
        label="Взрослые"
        value={passengers.adults}
        min={1}
        onChange={(v) => setPassengers((p) => ({ ...p, adults: v }))}
      />
      <PassengerCounter
        label="Дети"
        subLabel="2–11 лет"
        value={passengers.children}
        min={0}
        onChange={(v) => setPassengers((p) => ({ ...p, children: v }))}
      />
      <PassengerCounter
        label="Младенцы"
        subLabel="до 2 лет"
        value={passengers.toddler}
        min={0}
        onChange={(v) => setPassengers((p) => ({ ...p, toddler: v }))}
      />
      <PassengerCounter
        label="Животные"
        helpText="животных до 10 кг можно перевозить в салоне"
        value={passengers.animals}
        min={0}
        onChange={(v) => setPassengers((p) => ({ ...p, animals: v }))}
      />
      <div className={styles.passengersDivider} />
      <div className={styles.serviceClassSection}>
        <span className={styles.serviceClassTitle}>Класс обслуживания</span>
        <div className={styles.serviceClassButtons}>
          {(Object.keys(SERVICE_CLASS_LABELS) as ServiceClass[]).map((cls) => (
            <button
              key={cls}
              type="button"
              className={`${styles.serviceClassBtn} ${serviceClasses.includes(cls) ? styles.serviceClassBtnActive : ''}`}
              onClick={() => toggleServiceClass(cls)}
            >
              {SERVICE_CLASS_LABELS[cls]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const tripTypeContent = (
    <div className={styles.tripTypeContent}>
      {(['oneWay', 'roundTrip'] as TripType[]).map((type) => (
        <button
          key={type}
          type="button"
          className={`${styles.tripTypeOption} ${tripType === type ? styles.tripTypeOptionActive : ''}`}
          onClick={() => handleTripTypeChange(type)}
        >
          {TRIP_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.searchForm}>
      <div className={styles.formRow}>
        {/* City group: From + Swap + To */}
        <div className={styles.cityGroup}>
          {/* Origin city */}
          <div ref={originWrapperRef} className={styles.cityCardWrapper}>
            <div
              className={`${styles.cityCard} ${errors.origin ? styles.cityCardError : ''}`}
              onClick={handleOriginClick}
            >
              <span className={styles.cityLabel}>Откуда</span>
              <span
                className={`${styles.cityValue} ${!originId ? styles.cityValuePlaceholder : ''}`}
              >
                {originId ? originValue : 'Город вылета'}
              </span>
            </div>
            <CityDropdown
              open={originOpen}
              options={originOptions}
              search={originSearch}
              onSearch={(v) => {
                setOriginSearch(v);
                fetchAirports(v).then(setOriginOptions);
              }}
              onSelect={(opt) => {
                setOriginValue(opt.value);
                setOriginId(opt.airportId);
                setErrors((e) => ({ ...e, origin: false }));
              }}
              onClose={() => setOriginOpen(false)}
            />
          </div>

          <button
            type="button"
            className={styles.swapBtn}
            onClick={handleSwap}
            aria-label="Поменять города"
          >
            <Swap className={styles.swapIcon} />
          </button>

          {/* Destination city */}
          <div ref={destWrapperRef} className={styles.cityCardWrapper}>
            <div
              className={`${styles.cityCard} ${errors.dest ? styles.cityCardError : ''}`}
              onClick={handleDestClick}
            >
              <span className={styles.cityLabel}>Куда</span>
              <span className={`${styles.cityValue} ${!destId ? styles.cityValuePlaceholder : ''}`}>
                {destId ? destValue : 'Город назначения'}
              </span>
            </div>
            <CityDropdown
              open={destOpen}
              options={destOptions}
              search={destSearch}
              onSearch={(v) => {
                setDestSearch(v);
                fetchAirports(v).then(setDestOptions);
              }}
              onSelect={(opt) => {
                setDestValue(opt.value);
                setDestId(opt.airportId);
                setErrors((e) => ({ ...e, dest: false }));
              }}
              onClose={() => setDestOpen(false)}
            />
          </div>
        </div>

        {/* Trip type */}
        <Popover
          content={tripTypeContent}
          trigger="click"
          open={tripTypeOpen}
          onOpenChange={setTripTypeOpen}
          placement="bottomLeft"
          motion={{ motionName: '' }}
        >
          <div className={styles.controlBtnOuter} role="button" tabIndex={0}>
            <div className={styles.controlBtn}>
              <span className={styles.controlBtnText}>{TRIP_TYPE_LABELS[tripType]}</span>
              <ArrowDown
                className={`${styles.arrowIcon} ${tripTypeOpen ? styles.arrowIconOpen : ''}`}
              />
            </div>
          </div>
        </Popover>

        {/* Date range picker */}
        <div
          className={styles.controlBtnOuter}
          role="button"
          tabIndex={0}
          onClick={() => setDatePickerOpen(true)}
        >
          {/* Inner visual card — animates on click, DatePicker is NOT inside here */}
          <div
            className={`${styles.controlBtn} ${errors.dates ? styles.controlBtnError : ''} ${!dateRange && !errors.dates ? styles.controlBtnEmpty : ''}`}
          >
            <span className={styles.controlBtnText}>{getDateLabel()}</span>
            <ArrowDown
              className={`${styles.arrowIcon} ${datePickerOpen ? styles.arrowIconOpen : ''}`}
            />
          </div>
          {/* DatePicker lives in the stable outer wrapper so the calendar never shifts */}
          <ConfigProvider theme={{ token: { colorPrimary: '#40a9ff' } }}>
            <DatePicker.RangePicker
              className={styles.hiddenPicker}
              popupClassName="avia-date-popup"
              open={datePickerOpen}
              onOpenChange={setDatePickerOpen}
              value={dateRange}
              placement="bottomRight"
              onChange={(vals) => {
                setDateRange(vals as [Dayjs, Dayjs] | null);
                setErrors((e) => ({ ...e, dates: false }));
              }}
            />
          </ConfigProvider>
        </div>

        {/* Passengers */}
        <Popover
          content={passengersContent}
          trigger="click"
          placement="bottomLeft"
          open={passengersOpen}
          onOpenChange={setPassengersOpen}
          motion={{ motionName: '' }}
        >
          <div
            className={`${styles.controlBtnOuter} ${styles.controlBtnOuterPassengers}`}
            role="button"
            tabIndex={0}
          >
            <div className={`${styles.controlBtn} ${styles.controlBtnPassengers}`}>
              <Person className={styles.personIcon} />
              <span className={styles.controlBtnText}>{getPassengerLabel(passengers)}</span>
              <ArrowDown
                className={`${styles.arrowIcon} ${passengersOpen ? styles.arrowIconOpen : ''}`}
              />
            </div>
          </div>
        </Popover>

        {/* Search button */}
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
