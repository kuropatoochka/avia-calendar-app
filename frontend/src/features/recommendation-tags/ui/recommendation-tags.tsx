import type { TagId } from '../consts/tags';
import { Flex } from 'antd';
import { cn, reachGoal } from '@/shared/utils';
import { RECOMMENDATION_TAGS } from '../consts/tags';
import { RECOMMENDATION_TAGS_METRIKA_GOALS } from '../lib/metrika-goals';
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
        const nextSelected = !selected;

        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => {
              toggleTag(tag.id);
              onTagToggle?.(tag.id, nextSelected);

              reachGoal(RECOMMENDATION_TAGS_METRIKA_GOALS.tagClick, {
                tag_id: tag.id,
                tag_label: tag.label,
                tag_type: tag.type,
                selected: nextSelected,
              });
            }}
            className={cn(styles.tag, selected && styles.tagSelected)}
            aria-pressed={selected}
          >
            {tag.icon}
            {tag.label}
          </button>
        );
      })}
    </Flex>
  );
};
