import type { ServiceClass } from '../types/api';

export const CLASS_DELTAS: Record<ServiceClass, number> = {
  economy: 0,
  comfort: 3000,
  business: 8000,
  first: 15000,
};

export const CLASS_NAMES: Record<ServiceClass, string> = {
  economy: 'Эконом',
  comfort: 'Комфорт',
  business: 'Бизнес',
  first: 'Первый класс',
};

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
