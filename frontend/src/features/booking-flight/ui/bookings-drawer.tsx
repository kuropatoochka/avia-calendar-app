import type { BookedFlight } from '../model/types';
import { Drawer, Flex, Typography } from 'antd';
import { Eyes } from '@/shared/assets';
import { BookedFlightCard } from './booked-flight-card';
import styles from './bookings-drawer.module.css';

type Props = {
  open: boolean;
  bookedFlights: BookedFlight[];
  onClose: () => void;
};

export const BookingsDrawer = ({ open, bookedFlights, onClose }: Props) => {
  const hasBookings = bookedFlights.length > 0;

  return (
    <Drawer title="Мои бронирования" placement="right" open={open} onClose={onClose}>
      <Flex vertical align-items="center">
        {hasBookings ? (
          bookedFlights.map((flight) => <BookedFlightCard key={flight.id} flight={flight} />)
        ) : (
          <>
            <Eyes />
            <Typography.Text type="secondary" className={styles.empty}>
              Пока нет забронированных билетов
            </Typography.Text>
          </>
        )}
      </Flex>
    </Drawer>
  );
};
