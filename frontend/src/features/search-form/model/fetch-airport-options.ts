import { AirportService } from '@/shared/api';
import type { AirportDto } from '@/shared/types';

export const fetchAirportOptions = async (name?: string): Promise<AirportDto[]> => {
  try {
    const data = await AirportService.getAirports({
      search: name?.trim() || undefined,
      offset: 0,
      limit: 20,
    });
    return data.items;
  } catch {
    return [];
  }
};
