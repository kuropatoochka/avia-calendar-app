import type { ServiceClass } from '@/shared/types';

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
