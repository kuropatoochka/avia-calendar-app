import type {
  FlightBookingDetails,
  FlightBookingPayload,
  FlightCardViewModel,
} from '../model/types';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, Divider, Flex, Modal, Popover, Row, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { ArrowRight } from '@/shared/assets';
import {
  cn,
  durationFormatter,
  formatDate,
  priceFormatter,
  stopsFormatter,
  timeFormatter,
} from '@/shared/utils';
import { formatPassengersLabel, formatServiceClass } from '../model/formatter';
import { getBaggageOptions } from '../model/get-baggage-info';
import { getAirlineLogo } from '../model/get-company-info';
import { BaggageDetail } from './baggage-detail';
import styles from './flight-booking-modal.module.css';
import { RouteDetail } from './route-detail';

type Props = {
  flight: FlightCardViewModel;
  bookingDetails: FlightBookingDetails;
  open: boolean;
  onClose: () => void;
  onBook: (payload: FlightBookingPayload) => void;
};

export const FlightBookingModal = ({ flight, bookingDetails, open, onBook, onClose }: Props) => {
  const { cityFrom, cityTo, companyNames, stopsCount, duration } = flight;

  const baggageOptions = useMemo(
    () =>
      getBaggageOptions({
        prices: flight.prices,
        initialBaggageEnabled: bookingDetails.baggage.enabled,
      }),
    [flight.prices, bookingDetails.baggage.enabled],
  );

  const [selectedBaggageOption, setSelectedBaggageOption] = useState(() =>
    bookingDetails.baggage.enabled ? baggageOptions.withBaggage : baggageOptions.withoutBaggage,
  );

  const alternativeBaggageOption = selectedBaggageOption.enabled
    ? baggageOptions.withoutBaggage
    : baggageOptions.withBaggage;

  const handleBook = () => {
    onBook({
      flight,
      baggage: selectedBaggageOption,
      price: selectedBaggageOption.price,
    });
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={520} title="Детали рейса" centered>
      <Flex vertical gap={8}>
        <Flex justify="space-between" align="center">
          <Flex className={styles.block}>
            <Typography.Title level={3}>
              {cityFrom}
              <ArrowRight style={{ margin: '0 8px' }} />
              {cityTo}
            </Typography.Title>
            <Avatar.Group>
              {companyNames.map((company) => (
                <Tooltip key={company} title={company}>
                  <Avatar src={getAirlineLogo(company)} icon={null}></Avatar>
                </Tooltip>
              ))}
            </Avatar.Group>
          </Flex>
          <Flex align="center" className={styles.block}>
            <span
              className={cn(
                styles.stopsBadge,
                stopsCount === 0 ? styles.stopsDirect : styles.stopsTransfer,
              )}
            >
              {stopsFormatter(stopsCount)}
            </span>
            <Typography.Text type="secondary" className={styles.duration}>
              {durationFormatter(duration)} в пути
            </Typography.Text>
          </Flex>
        </Flex>

        <Divider className={styles.divider} />

        <Row gutter={[48, 16]}>
          <Col xs={24} sm={12}>
            <Flex className={styles.block}>
              <Typography.Text className={styles.modalLabel}>Дата</Typography.Text>
              <Typography.Text className={styles.modalValue}>
                {formatDate(flight.departureDate)}
              </Typography.Text>
            </Flex>
          </Col>

          <Col xs={24} sm={12}>
            <Flex className={styles.block}>
              <Typography.Text className={styles.modalLabel}>Время</Typography.Text>
              <Typography.Text className={styles.modalValue}>
                {timeFormatter(flight.departureTime)} – {timeFormatter(flight.arrivalTime)}
              </Typography.Text>
            </Flex>
          </Col>

          <Col xs={24} sm={12}>
            <Flex className={styles.block}>
              <Flex align="center" gap={6}>
                <Typography.Text className={styles.modalLabel}>Маршрут</Typography.Text>
                <Popover
                  content={<RouteDetail flight={flight} />}
                  trigger="hover"
                  placement="right"
                >
                  <InfoCircleOutlined style={{ color: 'var(--color-accent)' }} />
                </Popover>
              </Flex>
              <Typography.Text className={styles.modalValue}>
                {flight.cityFrom}
                <ArrowRight style={{ margin: '0 8px' }} />
                {flight.cityTo}
              </Typography.Text>
            </Flex>
          </Col>
          <Col xs={24} sm={12}>
            <Flex className={styles.block}>
              <Typography.Text className={styles.modalLabel}>Пассажиры</Typography.Text>
              <Typography.Text className={styles.modalValue}>
                {formatPassengersLabel(bookingDetails.passengers)}
              </Typography.Text>
            </Flex>
          </Col>

          <Col xs={24} sm={12}>
            <Flex className={styles.block}>
              <Typography.Text className={styles.modalLabel}>Класс</Typography.Text>
              <Typography.Text className={styles.modalValue}>
                {formatServiceClass(bookingDetails.serviceClass)}
              </Typography.Text>
            </Flex>
          </Col>

          <Col xs={24} sm={12}>
            <Flex vertical className={styles.block}>
              <Flex align="center" gap={6}>
                <Typography.Text className={styles.modalLabel}>Багаж</Typography.Text>
                <Popover
                  content={
                    <BaggageDetail
                      selectedOption={selectedBaggageOption}
                      alternativeOption={alternativeBaggageOption}
                      onChange={setSelectedBaggageOption}
                    />
                  }
                  trigger="hover"
                  placement="right"
                >
                  <InfoCircleOutlined style={{ color: 'var(--color-accent)' }} />
                </Popover>
              </Flex>
              <Typography.Text className={styles.modalValue}>
                {selectedBaggageOption.label}
              </Typography.Text>
            </Flex>
          </Col>
        </Row>

        <Divider className={styles.divider} />

        <Flex className={styles.block}>
          <Typography.Text type="secondary" className={styles.modalLabel}>
            Цена предложения
          </Typography.Text>
          <Typography.Title level={2}>
            {priceFormatter.format(selectedBaggageOption.price)}
          </Typography.Title>
          <Button type="primary" size="large" onClick={handleBook}>
            Забронировать
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
