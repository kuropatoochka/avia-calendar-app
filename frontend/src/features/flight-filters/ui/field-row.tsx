import type { ReactNode } from 'react';
import { Flex, Typography } from 'antd';
import styles from './flight-filters.module.css';

type FieldRowProps = {
  label: ReactNode;
  children: ReactNode;
};

export const FieldRow = ({ label, children }: FieldRowProps) => (
  <Flex justify="space-between" align="center" gap={12}>
    <Typography.Text className={styles.label}>{label}</Typography.Text>
    {children}
  </Flex>
);
