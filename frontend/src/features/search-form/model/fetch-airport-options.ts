import { AirportService } from '@/shared/api';
import type { AirportsDto } from '@/shared/types';

export const fetchAirportOptions = async (name?: string) => {
  try {
    const response = await AirportService.getAirports({
      search: name?.trim() || undefined,
      offset: 0,
      limit: 20,
    });

    if (!response.ok) {
      return [];
    }

    const data: AirportsDto = await response.json();

    return data.items;
  } catch {
    return [];
  }
};
