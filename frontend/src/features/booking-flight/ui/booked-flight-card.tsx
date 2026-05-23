import type { BookedFlight } from '../model/types';
import { Card, Flex, Tag, Typography } from 'antd';
import { SERVICE_CLASS_LABELS } from '@/shared/consts';
import { formatDate, priceFormatter, timeFormatter } from '@/shared/utils';
import styles from './bookings-drawer.module.css';

type Props = {
  flight: BookedFlight;
};

const getDepartureDateTime = (flight: BookedFlight) => {
  return new Date(`${flight.departureDate}T${flight.departureTime}`);
};

const formatPrice = (price: number) => priceFormatter.format(price);

const formatServiceClass = (serviceClass: BookedFlight['serviceClass']) => {
  return SERVICE_CLASS_LABELS[serviceClass];
};

const formatPassengers = (passengers: number) => {
  return `${passengers} пассажир${passengers === 1 ? '' : 'а'}`;
};

const getFlightStatusLabel = (flight: BookedFlight) => {
  const departureDate = getDepartureDateTime(flight);
  const departureTime = departureDate.getTime();

  if (Number.isNaN(departureTime)) {
    return { label: 'Выполнено', isCompleted: true };
  }

  const diffMs = departureTime - Date.now();

  if (diffMs <= 0) {
    return { label: 'Выполнено', isCompleted: true };
  }

  const totalMinutes = Math.floor(diffMs / 60000);

  if (totalMinutes < 60) {
    return { label: 'До вылета: меньше часа', isCompleted: false };
  }

  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    return { label: `До вылета: ${days} дн ${hours} ч`, isCompleted: false };
  }

  return {
    label: `До вылета: ${totalHours} ч${minutes ? ` ${minutes} мин` : ''}`,
    isCompleted: false,
  };
};

export const BookedFlightCard = ({ flight }: Props) => {
  const status = getFlightStatusLabel(flight);

  return (
    <Card size="small" className={styles.card}>
      <Flex vertical gap={8}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
          <Typography.Text strong className={styles.route}>
            {flight.cityFrom} → {flight.cityTo}
          </Typography.Text>
          <Tag color={status.isCompleted ? 'default' : 'blue'}>{status.label}</Tag>
        </Flex>

        <Typography.Text type="secondary" className={styles.time}>
          {formatDate(flight.departureDate)} {timeFormatter(flight.departureTime)} —{' '}
          {formatDate(flight.arrivalDate)} {timeFormatter(flight.arrivalTime)}
        </Typography.Text>

        <Flex justify="space-between" align="center" wrap="wrap" gap={8} className={styles.meta}>
          <Typography.Text strong>{formatPrice(flight.price)}</Typography.Text>
          <Flex align="center" gap={8} wrap="wrap">
            <Tag>{formatServiceClass(flight.serviceClass)}</Tag>
            <Typography.Text type="secondary">
              {formatPassengers(flight.passengers)}
            </Typography.Text>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
