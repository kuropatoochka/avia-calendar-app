import type { SearchFormError, SearchFormValues, SelectOption } from './types';

const SEARCH_FORM_ERRORS: Record<'sameAirport' | 'sameCity' | 'emptyDates', SearchFormError> = {
  sameAirport: {
    fields: ['originAirportId', 'destinationAirportId'],
    message: 'Маршрут получился слишком коротким. Выберите разные аэропорты',
  },
  sameCity: {
    fields: ['originAirportId', 'destinationAirportId'],
    message: 'Кажется, это один город. Давайте выберем направление подальше — там интереснее',
  },
  emptyDates: {
    fields: ['dateRange'],
    message: 'Без дат самолёты немного теряются. Выберите даты поездки, и мы покажем варианты',
  },
};

export const validateSearchFormValues = (
  values: SearchFormValues,
  airportOptions: SelectOption[],
): SearchFormError | null => {
  const { originAirportId, destinationAirportId, dateRange } = values;
  const [startDate, endDate] = dateRange ?? [];

  if (originAirportId === destinationAirportId) {
    return SEARCH_FORM_ERRORS.sameAirport;
  }

  const originOption = airportOptions.find((option) => option.value === originAirportId);
  const destinationOption = airportOptions.find((option) => option.value === destinationAirportId);

  if (
    originAirportId &&
    destinationAirportId &&
    originOption?.option.city === destinationOption?.option.city
  ) {
    return SEARCH_FORM_ERRORS.sameCity;
  }

  if (!startDate || !endDate) {
    return SEARCH_FORM_ERRORS.emptyDates;
  }

  return null;
};
