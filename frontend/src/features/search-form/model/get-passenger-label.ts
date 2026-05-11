import type { PassengersState } from './types';

export const getPassengerLabel = (p: PassengersState): string => {
  const total = p.adults + p.children + p.toddler;
  if (total === 1) return '1 пассажир';
  if (total >= 2 && total <= 4) return `${total} пассажира`;
  return `${total} пассажиров`;
};
