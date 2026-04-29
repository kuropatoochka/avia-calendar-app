import { Button, Typography } from 'antd';
import {
  Goal,
  trackExperimentEvent,
  useLaunchExperiment
} from '@/features/launch-experiment';
import { cn } from '@/shared/utils';
import styles from './styles.module.css';

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
    <>
      <Typography.Title>Куда летим?</Typography.Title>
      <Typography.Paragraph className={styles.subtitle}>
        Да хоть куда, лишь бы подешевле...
      </Typography.Paragraph>
      <Button
        onClick={handleTestButtonClick}
        className={cn(styles.testButton, variant === 'B' ? styles.testButtonB : styles.testButtonA)}
      >
        Тестовая кнопка, версия {variant}
      </Button>
    </>
  );
};
