import type { AirportOption } from './types';
import type { AirportDto } from '@/shared/types';

export const mapAirportToOption = (a: AirportDto): AirportOption => ({
  value: a.city,
  label: `${a.city} — ${a.airport}`,
  airportId: a.id,
});
