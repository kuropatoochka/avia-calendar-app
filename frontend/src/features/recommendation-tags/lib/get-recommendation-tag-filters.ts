import type { TagId } from '../consts/tags';
import type { TicketFiltersRequest } from '@/shared/types';
import { RECOMMENDATION_TAGS } from '../consts/tags';

type RecommendationTagFilters = Pick<TicketFiltersRequest, 'has_sea' | 'has_warm' | 'has_nature'>;

export const getRecommendationTagFilters = (
  selectedTagIds: Set<TagId>,
): RecommendationTagFilters => {
  return RECOMMENDATION_TAGS.reduce<RecommendationTagFilters>((acc, tag) => {
    if (tag.type === 'destination' && selectedTagIds.has(tag.id)) {
      acc[tag.requestParam] = true;
    }

    return acc;
  }, {});
};
