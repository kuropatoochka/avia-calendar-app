import {
  RecommendationTags,
  RecommendationTagsProvider,
} from '@/features/recommendation-tags';
import { TitleBlock } from './TitleBlock';

const OfferPage = () => {
  return (
    <RecommendationTagsProvider>
      <TitleBlock />
      <RecommendationTags />
    </RecommendationTagsProvider>
  );
};

export default OfferPage;
