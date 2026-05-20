import type { TagId } from '../consts/tags';
import { Flex } from 'antd';
import { cn } from '@/shared/utils';
import { RECOMMENDATION_TAGS } from '../consts/tags';
import { useRecommendationTags } from '../lib/use-recommendation-tags';
import styles from './styles.module.css';

type RecommendationTagsProps = {
  onTagToggle?: (tagId: TagId, selected: boolean) => void;
};

export const RecommendationTags = ({ onTagToggle }: RecommendationTagsProps) => {
  const { toggleTag, isTagSelected } = useRecommendationTags();

  return (
    <Flex wrap gap={8} className={styles.tags} role="group" aria-label="Быстрые фильтры">
      {RECOMMENDATION_TAGS.map((tag) => {
        const selected = isTagSelected(tag.id);
        const icon = tag.icon;

        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => {
              toggleTag(tag.id);
              onTagToggle?.(tag.id, !selected);
            }}
            className={cn(styles.tag, selected && styles.tagSelected)}
            aria-pressed={selected}
          >
            {icon}
            {tag.label}
          </button>
        );
      })}
    </Flex>
  );
};
