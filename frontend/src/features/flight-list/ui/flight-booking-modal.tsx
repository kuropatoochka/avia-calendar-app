import type { FlightCardViewModel } from '../model/types';
import { Button, Flex, Modal, Typography } from 'antd';
import styles from './flight-list.module.css';

type Props = {
  flight: FlightCardViewModel | null;
  open: boolean;
  onClose: () => void;
};

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const formatTime = (time: string) => {
  return time.slice(0, 5);
};

const formatDuration = (durationMinutes: number) => {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} мин`;
  }

  if (minutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${minutes} мин`;
};

const formatStops = (stopsCount: number) => {
  if (stopsCount === 0) {
    return 'Прямой рейс';
  }

  if (stopsCount === 1) {
    return '1 пересадка';
  }

  return `${stopsCount} пересадки`;
};

export const FlightBookingModal = ({ flight, open, onClose }: Props) => {
  if (!flight) {
    return null;
  }

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={720} title="Детали предложения">
      <Flex vertical gap={24}>
        <Flex justify="space-between" align="flex-start" gap={16}>
          <div>
            <Typography.Title level={4} className={styles.modalTitle}>
              {flight.cityFrom} — {flight.cityTo}
            </Typography.Title>

            <Typography.Text type="secondary">{formatStops(flight.stopsCount)}</Typography.Text>
          </div>

          <div className={styles.modalPriceBlock}>
            <Typography.Text className={styles.modalPrice}>
              {priceFormatter.format(flight.price)}
            </Typography.Text>
            <Typography.Text type="secondary">за всех пассажиров</Typography.Text>
          </div>
        </Flex>

        <Flex vertical gap={12}>
          {flight.segments.map((segment, index) => (
            <div
              key={`${segment.flight_number}-${segment.departure_date}-${segment.departure_time}`}
              className={styles.segmentCard}
            >
              <Flex justify="space-between" gap={16}>
                <div>
                  <Typography.Text strong>
                    Сегмент {index + 1}: {segment.city_from} — {segment.city_to}
                  </Typography.Text>

                  <div className={styles.segmentSub}>
                    {segment.airport_from} → {segment.airport_to}
                  </div>
                </div>

                <Typography.Text type="secondary">
                  {formatDuration(segment.duration)}
                </Typography.Text>
              </Flex>

              <Flex justify="space-between" gap={16} className={styles.segmentTimes}>
                <div>
                  <Typography.Text className={styles.segmentTime}>
                    {formatTime(segment.departure_time)}
                  </Typography.Text>
                  <div className={styles.segmentSub}>{segment.departure_date}</div>
                </div>

                <div className={styles.segmentArrow}>→</div>

                <div className={styles.segmentTimeRight}>
                  <Typography.Text className={styles.segmentTime}>
                    {formatTime(segment.arrival_time)}
                  </Typography.Text>
                  <div className={styles.segmentSub}>{segment.arrival_date}</div>
                </div>
              </Flex>

              <Flex justify="space-between" gap={16}>
                <Typography.Text type="secondary">{segment.company_name}</Typography.Text>
                <Typography.Text type="secondary">
                  {segment.plane_type} · {segment.plane_number}
                </Typography.Text>
              </Flex>
            </div>
          ))}
        </Flex>

        <Flex justify="flex-end" gap={12}>
          <Button onClick={onClose}>Закрыть</Button>
          <Button type="primary" onClick={onClose}>
            Забронировать
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
