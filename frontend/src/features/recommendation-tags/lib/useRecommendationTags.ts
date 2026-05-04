import { createContext, useContext } from 'react';
import type { TagId } from '../consts/tags';

type RecommendationTagsContextType = {
  selectedTagIds: Set<TagId>;
  toggleTag: (id: TagId) => void;
  isTagSelected: (id: TagId) => boolean;
};

export const RecommendationTagsContext = createContext<RecommendationTagsContextType | null>(null);

export const useRecommendationTags = () => {
  const context = useContext(RecommendationTagsContext);
  if (!context) {
    throw new Error('Контекст фильтрации по тегам не установлен');
  }
  return context;
};
