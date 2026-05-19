import { Flex, Spin, Typography } from 'antd';
import type { FlightDto } from '@/shared/types';
import { FlightCard } from './flight-card';
import styles from './flight-list.module.css';

type Props = {
  flights: FlightDto[];
  isLoading: boolean;
  error: string | null;
  isIdle: boolean;
};

export const FlightList = ({ flights, isLoading, error, isIdle }: Props) => {
  if (isIdle) {
    return (
      <Flex justify="center" align="center" className={styles.placeholder}>
        <Typography.Text type="secondary">
          Выберите дату на графике цен, чтобы увидеть рейсы
        </Typography.Text>
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" className={styles.placeholder}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" className={styles.placeholder}>
        <Typography.Text type="danger">{error}</Typography.Text>
      </Flex>
    );
  }

  if (flights.length === 0) {
    return (
      <Flex justify="center" align="center" className={styles.placeholder}>
        <Typography.Text type="secondary">Рейсов по заданным фильтрам не найдено</Typography.Text>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={12}>
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </Flex>
  );
};
