import type {
  FlightBookingDetails,
  FlightBookingPayload,
  FlightCardViewModel,
} from '../model/types';
import { Button, Flex, Spin, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { Eyes } from '@/shared/assets';
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
  bookingDetails: FlightBookingDetails | null;
  onBook: (flight: FlightBookingPayload) => void;
};

type ContentProps = {
  isIdle: boolean;
  isLoading: boolean;
  error: string | null;
  cards: FlightCardViewModel[];
  expanded: boolean;
  onSelectFlight: (flight: FlightCardViewModel) => void;
};

const PREVIEW_COUNT = 3;

const isFlightCardViewModel = (value: FlightCardViewModel | null): value is FlightCardViewModel => {
  return value !== null;
};

const Content = ({ isIdle, isLoading, error, cards, expanded, onSelectFlight }: ContentProps) => {
  const visibleCards = expanded ? cards : cards.slice(0, PREVIEW_COUNT);

  if (isIdle) {
    return (
      <Typography.Text type="secondary">
        Выберите дату на графике цен, чтобы увидеть рейсы
      </Typography.Text>
    );
  }

  if (isLoading) {
    return <Spin spinning={isLoading} tip="Загружаем предложения..." />;
  }

  if (error) {
    return <Typography.Text type="danger">{error}</Typography.Text>;
  }

  if (cards.length === 0) {
    return (
      <>
        <Eyes />
        <Typography.Text type="secondary">
          Упсс! Рейсов по заданным фильтрам не найдено
        </Typography.Text>
      </>
    );
  }

  return (
    <>
      {visibleCards.map((flight) => (
        <FlightCard key={flight.id} flight={flight} onClick={() => onSelectFlight(flight)} />
      ))}
    </>
  );
};

export const FlightList = ({
  flights,
  isLoading,
  error,
  isIdle,
  bookingDetails,
  onBook,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightCardViewModel | null>(null);

  const cards = useMemo(
    () => flights.map(mapTicketGroupToCard).filter(isFlightCardViewModel),
    [flights],
  );

  const canExpand = cards.length > PREVIEW_COUNT;

  return (
    <Flex vertical gap={16} className={styles.resultsBlock}>
      <Flex justify="space-between" align="center" gap={16} className={styles.header}>
        <Flex vertical gap={8}>
          <Typography.Title level={2} className={styles.title}>
            Доступные предложения
          </Typography.Title>
          <Typography.Text type="secondary" className={styles.foundCount}>
            Найдено {cards.length} предложений
          </Typography.Text>
        </Flex>
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

      <Flex vertical justify="center" align="center" className={styles.placeholder}>
        <Content
          isIdle={isIdle}
          isLoading={isLoading}
          error={error}
          cards={cards}
          expanded={expanded}
          onSelectFlight={setSelectedFlight}
        />
      </Flex>

      {selectedFlight && bookingDetails && (
        <FlightBookingModal
          open
          flight={selectedFlight}
          bookingDetails={bookingDetails}
          onBook={onBook}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </Flex>
  );
};
