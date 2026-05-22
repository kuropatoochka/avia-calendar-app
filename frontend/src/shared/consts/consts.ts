import type { ServiceClass } from '../types';

export const PATHS = {
  base: '/',
  offer: '/offer',
  search: '/search',
};

export const PAGES = [
  {
    path: PATHS.offer,
    title: 'Выгодные предложения',
  },
  {
    path: PATHS.search,
    title: 'Не знаю, куда лететь',
  },
] as const;

export const SERVICE_CLASS_LABELS: Record<ServiceClass, string> = {
  BUDGET: 'Эконом',
  COMFORT: 'Комфорт',
  BUSINESS: 'Бизнес',
  FIRST_CLASS: 'Первый класс',
};
