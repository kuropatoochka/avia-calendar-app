import type {
  FlightBookingDetails,
  FlightBookingPayload,
  FlightCardViewModel,
} from '../model/types';
import type { UIEvent } from 'react';
import { Button, Flex, Spin, Typography } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { Eyes } from '@/shared/assets';
import type { TicketItemDto } from '@/shared/types';
import { mapTicketGroupToCard } from '../model/map-ticket-group-to-card';
import { FlightBookingModal } from './flight-booking-modal';
import { FlightCard } from './flight-card';
import styles from './flight-list.module.css';

type Props = {
  flights: TicketItemDto[][];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  isIdle: boolean;
  bookingDetails: FlightBookingDetails | null;
  onBook: (flight: FlightBookingPayload) => Promise<boolean>;
  isBookingLoading?: boolean;
  bookingError?: string | null;
  onBookingClose?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onScrollToPriceDynamics?: () => void;
};

type ContentProps = {
  isIdle: boolean;
  isLoading: boolean;
  error: string | null;
  cards: FlightCardViewModel[];
  bookingDetails: FlightBookingDetails | null;
  onSelectFlight: (flight: FlightCardViewModel) => void;
};

const isFlightCardViewModel = (value: FlightCardViewModel | null): value is FlightCardViewModel => {
  return value !== null;
};

const Content = ({
  isIdle,
  isLoading,
  error,
  cards,
  onSelectFlight,
  bookingDetails,
}: ContentProps) => {
  if (isIdle) {
    return (
      <Typography.Text type="secondary">
        Выберите дату на графике цен, чтобы увидеть рейсы
      </Typography.Text>
    );
  }

  if (isLoading) {
    return <Spin spinning={isLoading} description="Загружаем предложения..." />;
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
      {cards.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          bookingDetails={bookingDetails}
          onClick={() => onSelectFlight(flight)}
        />
      ))}
    </>
  );
};

export const FlightList = ({
  flights,
  isLoading,
  isLoadingMore,
  error,
  isIdle,
  bookingDetails,
  onBook,
  isBookingLoading,
  bookingError,
  onBookingClose,
  onLoadMore,
  hasMore = false,
  onScrollToPriceDynamics,
}: Props) => {
  const [selectedFlight, setSelectedFlight] = useState<FlightCardViewModel | null>(null);

  const cards = useMemo(
    () => flights.map(mapTicketGroupToCard).filter(isFlightCardViewModel),
    [flights],
  );
  const canLoadMore =
    Boolean(onLoadMore) && hasMore && !isLoadingMore && !isLoading && !isIdle && !error;

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (!canLoadMore || !onLoadMore) {
        return;
      }

      const target = event.currentTarget;
      const threshold = 200;
      const remaining = target.scrollHeight - target.scrollTop - target.clientHeight;

      if (remaining <= threshold) {
        onLoadMore();
      }
    },
    [canLoadMore, onLoadMore],
  );

  return (
    <Flex vertical gap={16} className={styles.resultsBlock}>
      <Flex justify="space-between" align="center" className={styles.header}>
        <Typography.Title level={2}>Доступные предложения</Typography.Title>
        {!isIdle && (
          <Button type="link" onClick={onScrollToPriceDynamics}>
            К графику
          </Button>
        )}
      </Flex>

      <div className={styles.listContainer}>
        <div className={styles.listScroll} onScroll={handleScroll}>
          <Flex vertical justify="center" align="center" gap={12} className={styles.placeholder}>
            <Content
              isIdle={isIdle}
              isLoading={isLoading}
              error={error}
              cards={cards}
              onSelectFlight={setSelectedFlight}
              bookingDetails={bookingDetails}
            />
          </Flex>

          {isLoadingMore && (
            <div className={styles.loadMore}>
              <Spin size="small" />
            </div>
          )}
        </div>
      </div>

      {selectedFlight && bookingDetails && (
        <FlightBookingModal
          open
          flight={selectedFlight}
          bookingDetails={bookingDetails}
          onBook={onBook}
          isBookingLoading={isBookingLoading}
          bookingError={bookingError}
          onClose={() => {
            setSelectedFlight(null);
            onBookingClose?.();
          }}
        />
      )}
    </Flex>
  );
};
