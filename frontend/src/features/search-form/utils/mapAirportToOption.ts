import type { AirportDto } from '@/shared/types';
import type { AirportOption } from '../types/searchForm';

export const mapAirportToOption = (a: AirportDto): AirportOption => ({
  value: a.city,
  label: `${a.city} — ${a.airport}`,
  airportId: a.id,
});
