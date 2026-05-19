import { HeartOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import type { FlightDto } from '@/shared/types';
import styles from './flight-list.module.css';

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return m === 0 ? `${h}ч` : `${h}ч ${m}мин`;
};

const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₽`;

const getStopsLabel = (count: number) => {
  if (count === 0) return 'Прямой рейс';
  if (count === 1) return '1 пересадка';

  return `${count} пересадки`;
};

type Props = {
  flight: FlightDto;
};

export const FlightCard = ({ flight }: Props) => {
  return (
    <div className={styles.card}>
      <Flex justify="space-between" align="center" gap={16}>
        <Flex align="center" gap={12} className={styles.routeBlock}>
          <Typography.Text strong className={styles.time}>
            {flight.departureTime}
          </Typography.Text>

          <Flex vertical align="center" className={styles.routeInfo}>
            <Typography.Text type="secondary" className={styles.duration}>
              {formatDuration(flight.duration)}
            </Typography.Text>
            <div className={styles.routeLine} />
            <Typography.Text type="secondary" className={styles.stopsLabel}>
              {getStopsLabel(flight.stopsCount)}
            </Typography.Text>
          </Flex>

          <Typography.Text strong className={styles.time}>
            {flight.arrivalTime}
          </Typography.Text>
        </Flex>

        <Flex vertical gap={4} className={styles.airlineBlock}>
          <Typography.Text className={styles.airline}>{flight.airline}</Typography.Text>
          <Flex gap={8}>
            {flight.baggageIncluded && (
              <Flex align="center" gap={4}>
                <ShoppingOutlined className={styles.badgeIcon} />
                <Typography.Text className={styles.badgeText}>Багаж</Typography.Text>
              </Flex>
            )}
            {flight.petsAllowed && (
              <Flex align="center" gap={4}>
                <HeartOutlined className={styles.badgeIcon} />
                <Typography.Text className={styles.badgeText}>Питомцы</Typography.Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        <Typography.Text strong className={styles.price}>
          {formatPrice(flight.price)}
        </Typography.Text>
      </Flex>
    </div>
  );
};
