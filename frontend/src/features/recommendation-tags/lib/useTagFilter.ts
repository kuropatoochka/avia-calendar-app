import type { FlightDto } from '@/shared/types/api';
import { RECOMMENDATION_TAGS } from '../consts/tags';
import { useRecommendationTags } from './useRecommendationTags';

export const useTagFilter = () => {
  const { selectedTagIds } = useRecommendationTags();

  const filterFlights = (flights: FlightDto[]): FlightDto[] => {
    if (selectedTagIds.size === 0) return flights;

    const activeTags = RECOMMENDATION_TAGS.filter((t) => selectedTagIds.has(t.id));
    return flights.filter((flight) => activeTags.every((tag) => tag.filter(flight)));
  };

  return { filterFlights };
};
