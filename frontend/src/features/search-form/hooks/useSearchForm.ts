import type { Dayjs } from 'dayjs';
import { useState, useCallback } from 'react';
import { AirportService } from '@/shared/api';
import { DATA_SOURCE } from '@/shared/consts';
import { DEFAULT_PASSENGERS } from '../consts/defaults';
import type { AirportOption, PassengersState, ServiceClass, TripType } from '../types/searchForm';
import { mapAirportToOption } from '../utils/mapAirportToOption';

export const useSearchForm = () => {
  const [tripType, setTripType] = useState<TripType>('oneWay');
  const [passengers, setPassengers] = useState<PassengersState>(DEFAULT_PASSENGERS);
  const [serviceClasses, setServiceClasses] = useState<ServiceClass[]>(['economy']);
  const [originValue, setOriginValue] = useState('Санкт-Петербург');
  const [destValue, setDestValue] = useState('Москва');
  const [originId, setOriginId] = useState('led');
  const [destId, setDestId] = useState('svo');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [errors, setErrors] = useState<{ origin?: boolean; dest?: boolean; dates?: boolean }>({});

  const fetchAirportOptions = useCallback(async (name: string): Promise<AirportOption[]> => {
    if (DATA_SOURCE === 'mock') {
      const { airportsMock } = await import('@/shared/api/mock/airportHandler');
      const query = name.trim().toLowerCase();
      const filtered = query
        ? airportsMock.filter(
            (a) => a.city.toLowerCase().includes(query) || a.airport.toLowerCase().includes(query),
          )
        : airportsMock;
      return filtered.map(mapAirportToOption);
    }

    try {
      const res = await AirportService.getAirports(name.trim() || undefined);
      const data = await res.json();
      return data.map(mapAirportToOption);
    } catch {
      return [];
    }
  }, []);

  const handleSwap = () => {
    setOriginValue(destValue);
    setDestValue(originValue);
    setOriginId(destId);
    setDestId(originId);
  };

  const handleTripTypeChange = (type: TripType) => {
    setTripType(type);
    setDateRange(null);
  };

  const toggleServiceClass = (cls: ServiceClass) => {
    setServiceClasses((prev) => {
      if (prev.includes(cls) && prev.length === 1) return prev;
      return prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls];
    });
  };

  const handleSearch = () => {
    const newErrors = {
      origin: !originId,
      dest: !destId,
      dates: !dateRange,
    };
    setErrors(newErrors);
  };

  return {
    tripType,
    setTripType: handleTripTypeChange,
    passengers,
    setPassengers,
    serviceClasses,
    toggleServiceClass,
    originValue,
    setOriginValue,
    destValue,
    setDestValue,
    originId,
    setOriginId,
    destId,
    setDestId,
    dateRange,
    setDateRange,
    errors,
    setErrors,
    handleSwap,
    handleSearch,
    fetchAirportOptions,
  };
};
