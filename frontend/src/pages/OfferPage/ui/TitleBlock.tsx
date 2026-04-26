import { Typography } from 'antd';
import { Input } from '@/shared/ui';
import styles from './styles.module.css';

export const TitleBlock = () => {
  return (
    <>
      <Typography.Title>Куда летим?</Typography.Title>
      <Typography.Paragraph className={styles.subtitle}>
        Да хоть куда, лишь бы подешевле...
      </Typography.Paragraph>
      <Input />
    </>
  );
};
