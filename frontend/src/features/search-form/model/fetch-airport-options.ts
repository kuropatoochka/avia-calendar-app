import { AirportService } from '@/shared/api';
import type { AirportDto } from '@/shared/types';

export const fetchAirportOptions = async (name?: string) => {
  try {
    const response = await AirportService.getAirports(name?.trim() || undefined);

    if (!response.ok) {
      return [];
    }

    const data: AirportDto[] = await response.json();
    console.log(data);

    return data;
  } catch {
    return [];
  }
};
