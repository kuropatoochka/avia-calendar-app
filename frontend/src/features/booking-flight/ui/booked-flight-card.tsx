import type { BookedFlight } from '../model/types';
import { Flex, Typography } from 'antd';
import { priceFormatter } from '@/shared/utils';
import styles from './bookings-drawer.module.css';

type Props = {
  flight: BookedFlight;
};

export const BookedFlightCard = ({ flight }: Props) => {
  return (
    <div className={styles.card}>
      <Typography.Text strong className={styles.route}>
        {flight.cityFrom} → {flight.cityTo}
      </Typography.Text>
      <Typography.Text type="secondary" className={styles.time}>
        {flight.departureDate} {flight.departureTime} — {flight.arrivalDate} {flight.arrivalTime}
      </Typography.Text>
      <Flex className={styles.meta} justify="space-between" align="center">
        <Typography.Text>{priceFormatter.format(flight.price)}</Typography.Text>
        <Typography.Text type="secondary">{flight.serviceClass}</Typography.Text>
      </Flex>
    </div>
  );
};
