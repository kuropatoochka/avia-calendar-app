import { useCallback, useState } from 'react';
import type { AirportDto } from '@/shared/types';
import { useAirportsQuery } from './use-airports-query';

type SelectOption = { value: string; label: string; option: AirportDto };

const getOption = (option: AirportDto): SelectOption => ({
  value: option.id,
  label: option.airport,
  option,
});

const mergeOptions = (options: SelectOption[]) => {
  const optionMap = new Map<string, SelectOption>();

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

  const loadOptions = useCallback(
    async (search?: string) => {
      const data = await fetchAirports(search);
      const fetchedOptions = data ? data.map(getOption) : [];

      setState((prev) => {
        const cachedOptions = mergeOptions([...prev.cachedOptions, ...fetchedOptions]);

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

      if (!open) {
        setState((prev) => ({
          ...prev,
          visibleOptions: prev.cachedOptions,
        }));
      }
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
