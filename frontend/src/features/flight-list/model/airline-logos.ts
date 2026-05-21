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
