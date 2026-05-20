import type { FlightCardViewModel } from '../model/types';
import { Button, Flex, Spin, Typography } from 'antd';
import { useMemo, useState } from 'react';
import type { TicketItemDto } from '@/shared/types';
import { mapTicketGroupToCard } from '../model/map-ticket-group-to-card';
import { FlightBookingModal } from './flight-booking-modal';
import { FlightCard } from './flight-card';
import styles from './flight-list.module.css';

type Props = {
  flights: TicketItemDto[][];
  isLoading: boolean;
  error: string | null;
  isIdle: boolean;
};

const PREVIEW_COUNT = 3;

const isFlightCardViewModel = (value: FlightCardViewModel | null): value is FlightCardViewModel => {
  return value !== null;
};

export const FlightList = ({ flights, isLoading, error, isIdle }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightCardViewModel | null>(null);

  const cards = useMemo(
    () => flights.map(mapTicketGroupToCard).filter(isFlightCardViewModel),
    [flights],
  );

  const visibleCards = expanded ? cards : cards.slice(0, PREVIEW_COUNT);
  const canExpand = cards.length > PREVIEW_COUNT;

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
        <Spin spinning={isLoading} tip="Загружаем предложения..." />
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

  if (cards.length === 0) {
    return (
      <Flex justify="center" align="center" className={styles.placeholder}>
        <Typography.Text type="secondary">Рейсов по заданным фильтрам не найдено</Typography.Text>
      </Flex>
    );
  }

  return (
    <>
      <Flex vertical gap={16} className={styles.resultsBlock}>
        <Flex justify="space-between" align="center" gap={16} className={styles.header}>
          <div>
            <Typography.Title level={3} className={styles.title}>
              Доступные предложения
            </Typography.Title>

            <Typography.Text type="secondary" className={styles.foundCount}>
              Найдено {cards.length} предложений
            </Typography.Text>
          </div>

          {canExpand && (
            <Button
              type="link"
              className={styles.viewAllButton}
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? 'Свернуть' : 'Посмотреть все'}
            </Button>
          )}
        </Flex>

        <Flex vertical gap={12}>
          {visibleCards.map((flight) => (
            <FlightCard key={flight.id} flight={flight} onClick={() => setSelectedFlight(flight)} />
          ))}
        </Flex>
      </Flex>

      <FlightBookingModal
        open={selectedFlight !== null}
        flight={selectedFlight}
        onClose={() => setSelectedFlight(null)}
      />
    </>
  );
};
