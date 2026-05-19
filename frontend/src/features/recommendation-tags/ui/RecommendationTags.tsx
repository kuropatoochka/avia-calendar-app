import { Flex } from 'antd';
import { cn } from '@/shared/utils';
import { RECOMMENDATION_TAGS } from '../consts/tags';
import { useRecommendationTags } from '../lib/useRecommendationTags';
import styles from './styles.module.css';

export const RecommendationTags = () => {
  const { toggleTag, isTagSelected } = useRecommendationTags();

  return (
    <Flex wrap gap={8} className={styles.tags} role="group" aria-label="Быстрые фильтры">
      {RECOMMENDATION_TAGS.map((tag) => {
        const selected = isTagSelected(tag.id);
        const Icon = tag.icon;
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={cn(styles.tag, selected && styles.tagSelected)}
            aria-pressed={selected}
          >
            <Icon className={styles.icon} aria-hidden="true" />
            {tag.label}
          </button>
        );
      })}
    </Flex>
  );
};
