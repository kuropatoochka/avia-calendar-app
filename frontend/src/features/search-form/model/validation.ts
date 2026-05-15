import type { SearchFormValues } from './types';
import { airportMock } from '@/shared/api';
import { DEFAULT_DESTINATION_AIRPORT, DEFAULT_ORIGIN_AIRPORT } from './consts';

export type SearchFormErrorField = 'originAirport' | 'destinationAirport' | 'dateRange';

export type SearchFormError = {
  message: string;
  fields: SearchFormErrorField[];
};

const SEARCH_FORM_ERRORS: Record<'sameAirport' | 'sameCity' | 'emptyDates', SearchFormError> = {
  sameAirport: {
    fields: ['originAirport', 'destinationAirport'],
    message:
      'Маршрут получился слишком коротким: аэропорты совпадают. Выберите другой пункт назначения.',
  },
  sameCity: {
    fields: ['originAirport', 'destinationAirport'],
    message: 'Кажется, это один город. Давайте выберем направление подальше — там интереснее.',
  },
  emptyDates: {
    fields: ['dateRange'],
    message: 'Без дат самолёты немного теряются. Выберите даты поездки, и мы покажем варианты.',
  },
};

const airportCityById = new Map(
  [...airportMock, DEFAULT_ORIGIN_AIRPORT, DEFAULT_DESTINATION_AIRPORT].map((airport) => [
    airport.id,
    airport.city,
  ]),
);

export const validateSearchFormValues = (values: SearchFormValues): SearchFormError | null => {
  const [startDate, endDate] = values.dateRange ?? [];

  if (values.originAirport === values.destinationAirport) {
    return SEARCH_FORM_ERRORS.sameAirport;
  }

  const originCity = airportCityById.get(values.originAirport);
  const destinationCity = airportCityById.get(values.destinationAirport);

  if (originCity && destinationCity && originCity === destinationCity) {
    return SEARCH_FORM_ERRORS.sameCity;
  }

  if (!startDate || !endDate) {
    return SEARCH_FORM_ERRORS.emptyDates;
  }

  return null;
};
