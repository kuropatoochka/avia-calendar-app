import { Button } from 'antd';
import { Goal, trackExperimentEvent, useLaunchExperiment } from '@/features/launch-experiment';
import { cn } from '@/shared/utils';
import styles from './offer-page.module.css';

export const TitleBlock = () => {
  const variant = useLaunchExperiment();

  const handleTestButtonClick = () => {
    trackExperimentEvent({
      goal: Goal.TestButtonClick,
      experiment: 'launch_experiment',
      variant,
    });
  };

  return (
    <Button
      onClick={handleTestButtonClick}
      className={cn(styles.testButton, variant === 'B' ? styles.testButtonB : styles.testButtonA)}
    >
      Тестовая кнопка, версия {variant}
    </Button>
  );
};
