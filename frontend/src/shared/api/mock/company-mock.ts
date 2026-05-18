import type { CompanyDto } from '@/shared/types';

/** Must match backend seed COMPANIES (id 1–5). */
export const companyMock: CompanyDto[] = [
  { id: 1, name: 'Аэрофлот' },
  { id: 2, name: 'S7 Airlines' },
  { id: 3, name: 'Уральские авиалинии' },
  { id: 4, name: 'Победа' },
  { id: 5, name: 'Россия' },
];
