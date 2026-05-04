import { useState, type ReactNode } from 'react';
import type { TagId } from '../consts/tags';
import { RecommendationTagsContext } from '../lib/useRecommendationTags';

interface Props {
  children?: ReactNode;
}

export const RecommendationTagsProvider = ({ children }: Props) => {
  const [selectedTagIds, setSelectedTagIds] = useState<Set<TagId>>(new Set());

  const toggleTag = (id: TagId) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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
