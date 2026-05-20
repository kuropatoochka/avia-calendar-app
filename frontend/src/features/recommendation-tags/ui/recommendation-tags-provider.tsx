import type { TagId } from '../consts/tags';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { RECOMMENDATION_TAGS } from '../consts/tags';
import { RecommendationTagsContext } from '../lib/use-recommendation-tags';

interface Props {
  children?: ReactNode;
}

const getTag = (id: TagId) => RECOMMENDATION_TAGS.find((tag) => tag.id === id);

export const RecommendationTagsProvider = ({ children }: Props) => {
  const [selectedTagIds, setSelectedTagIds] = useState<Set<TagId>>(new Set());

  const toggleTag = (id: TagId) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      const tag = getTag(id);

      if (next.has(id)) {
        next.delete(id);
        return next;
      }

      if (tag?.type === 'departureTime') {
        RECOMMENDATION_TAGS.forEach((item) => {
          if (item.type === 'departureTime' && item.exclusiveGroup === tag.exclusiveGroup) {
            next.delete(item.id);
          }
        });
      }

      next.add(id);

      return next;
    });
  };

  const isTagSelected = (id: TagId) => selectedTagIds.has(id);

  return (
    <RecommendationTagsContext value={{ selectedTagIds, toggleTag, isTagSelected }}>
      {children}
    </RecommendationTagsContext>
  );
};
