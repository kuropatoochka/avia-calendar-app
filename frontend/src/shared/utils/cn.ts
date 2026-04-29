import type { ClassValue } from 'clsx';
import clsx from 'clsx';

export const cn = (...classes: ClassValue[]) => {
  return clsx(classes);
};
