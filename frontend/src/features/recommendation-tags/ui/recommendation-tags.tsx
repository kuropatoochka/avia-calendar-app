import type { TagId } from '../consts/tags';
import { cn } from '@/shared/utils';
import { RECOMMENDATION_TAGS } from '../consts/tags';
import { useRecommendationTags } from '../lib/use-recommendation-tags';
import styles from './styles.module.css';

type RecommendationTagsProps = {
  onTagToggle?: (tagId: TagId, selected: boolean) => void;
};

export const RecommendationTags = ({ onTagToggle }: RecommendationTagsProps) => {
  const { toggleTag, isTagSelected } = useRecommendationTags();

  const handleTagClick = (tagId: TagId, selected: boolean) => {
    const nextSelected = !selected;

    toggleTag(tagId);
    onTagToggle?.(tagId, nextSelected);
  };

  return (
    <div className={styles.tags} role="group" aria-label="Быстрые фильтры">
      {RECOMMENDATION_TAGS.map((tag) => {
        const selected = isTagSelected(tag.id);

        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => {
              handleTagClick(tag.id, selected);
            }}
            className={cn(styles.tag, selected && styles.tagSelected)}
            aria-pressed={selected}
          >
            {tag.icon}
            {tag.label}
          </button>
        );
      })}
    </div>
  );
};
