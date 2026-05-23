import { UserOutlined } from '@ant-design/icons';
import { Avatar, Badge } from 'antd';
import { useState } from 'react';
import { useBookedFlights } from '../model/use-booked-flights';
import { BookingsDrawer } from './bookings-drawer';

export const BookingAvatar = () => {
  const [open, setOpen] = useState(false);
  const { bookedFlights, bookedFlightsCount } = useBookedFlights();

  return (
    <>
      <Badge count={bookedFlightsCount}>
        <Avatar
          shape="square"
          icon={<UserOutlined />}
          onClick={() => setOpen(true)}
          style={{ cursor: 'pointer', backgroundColor: 'var(--color-primary)' }}
        />
      </Badge>

      <BookingsDrawer open={open} bookedFlights={bookedFlights} onClose={() => setOpen(false)} />
    </>
  );
};
