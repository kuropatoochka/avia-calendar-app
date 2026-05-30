import type { SelectOption } from './types';
import { useCallback, useRef, useState } from 'react';
import type { AirportDto } from '@/shared/types';
import { useAirportsQuery } from './use-airports-query';

const getOption = (option: AirportDto): SelectOption => ({
  value: option.id,
  label: option.name,
  option: {
    id: option.id,
    airport: option.name,
    cityId: option.city.id,
    city: option.city.name,
  },
});

const mergeOptions = (options: SelectOption[]) => {
  const optionMap = new Map<number, SelectOption>();

  options.forEach((option) => {
    optionMap.set(option.value, option);
  });

  return Array.from(optionMap.values());
};

export const useAirportSelectOptions = (initialAirports: AirportDto[]) => {
  const { fetchAirports, isAirportsLoading } = useAirportsQuery();

  const [state, setState] = useState(() => ({
    cachedOptions: initialAirports.map(getOption),
    visibleOptions: initialAirports.map(getOption),
  }));

  const currentSearchRef = useRef<string | undefined>(undefined);

  const loadOptions = useCallback(
    async (search?: string) => {
      currentSearchRef.current = search;
      const data = await fetchAirports(search);
      const fetchedOptions = data ? data.map(getOption) : [];

      setState((prev) => {
        const cachedOptions = mergeOptions([...prev.cachedOptions, ...fetchedOptions]);

        if (currentSearchRef.current !== search) {
          return { ...prev, cachedOptions };
        }

        return {
          cachedOptions,
          visibleOptions: search ? fetchedOptions : cachedOptions,
        };
      });
    },
    [fetchAirports],
  );

  const handleSearch = useCallback(
    (search: string) => {
      const normalizedSearch = search.trim();

      if (!normalizedSearch) {
        currentSearchRef.current = undefined;
        setState((prev) => ({
          ...prev,
          visibleOptions: prev.cachedOptions,
        }));

        return;
      }

      loadOptions(normalizedSearch);
    },
    [loadOptions],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        loadOptions();
        return;
      }

      currentSearchRef.current = undefined;
      setState((prev) => ({
        ...prev,
        visibleOptions: prev.cachedOptions,
      }));
    },
    [loadOptions],
  );

  return {
    defaultAirportOptions: state.cachedOptions,
    airportOptions: state.visibleOptions,
    isAirportOptionsLoading: isAirportsLoading,
    onAirportOptionsSearch: handleSearch,
    onAirportOptionsOpenChange: handleOpenChange,
  };
};
