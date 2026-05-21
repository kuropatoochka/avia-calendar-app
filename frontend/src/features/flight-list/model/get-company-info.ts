import { aeroflotLogo, pobedaLogo, rossiyaLogo, s7Logo, uralLogo } from '@/shared/assets/airlines';

const AIRLINE_LOGOS: Record<string, string> = {
  Аэрофлот: aeroflotLogo,
  'S7 Airlines': s7Logo,
  'Уральские авиалинии': uralLogo,
  Победа: pobedaLogo,
  Россия: rossiyaLogo,
};

export const getAirlineLogo = (companyName: string): string | undefined => {
  return AIRLINE_LOGOS[companyName];
};

export const getCompanyShortName = (company: string) => {
  return company
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};
