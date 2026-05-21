import type { FlightCardViewModel } from '../model/types';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Avatar, Col, Divider, Flex, Modal, Popover, Row, Tooltip, Typography } from 'antd';
import { ArrowRight } from '@/shared/assets';
import { cn, durationFormatter, formatDate, stopsFormatter, timeFormatter } from '@/shared/utils';
import { getAirlineLogo } from '../model/get-company-info';
import styles from './flight-booking-modal.module.css';
import { RouteDetail } from './route-detail';

type Props = {
  flight: FlightCardViewModel;
  open: boolean;
  onClose: () => void;
};

export const FlightBookingModal = ({ flight, open, onClose }: Props) => {
  const { cityFrom, cityTo, companyNames, stopsCount, duration } = flight || {};

  if (!flight) {
    return null;
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      title="Детали рейса"
      centered
      className={styles.flightModal}
    >
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

        <Divider />

        <Row gutter={[48, 24]}>
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

          {/* TODO: вернуть после добавления пассажиров в модель предложения */}
          {/* <Flex vertical className={styles.block}>
    <Flex align="center" gap={6}>
      <Typography.Text className={styles.modalLabel}>Пассажиры</Typography.Text>

      <Popover
        content={<PassengerDetail />}
        trigger="hover"
        placement="right"
        overlayStyle={{ maxWidth: 260 }}
      >
        <InfoCircleOutlined className={styles.modalInfoIcon} />
      </Popover>
    </Flex>

    <Typography.Text className={styles.modalValue}>
      {formatPassengers(passengersCount)}
    </Typography.Text>
  </Flex> */}

          {/* TODO: вернуть после добавления класса обслуживания в модель предложения */}
          {/* <Flex vertical className={styles.block}>
    <Flex align="center" gap={6}>
      <Typography.Text className={styles.modalLabel}>Класс</Typography.Text>

      <Popover
        content={<ClassDetail />}
        trigger="hover"
        placement="right"
        overlayStyle={{ maxWidth: 260 }}
      >
        <InfoCircleOutlined className={styles.modalInfoIcon} />
      </Popover>
    </Flex>

    <Typography.Text className={styles.modalValue}>
      Эконом
    </Typography.Text>
  </Flex> */}

          {/* TODO: вернуть после добавления багажа в модель предложения */}
          {/* <Flex vertical className={styles.block}>
    <Flex align="center" gap={6}>
      <Typography.Text className={styles.modalLabel}>Багаж</Typography.Text>

      <Popover
        content={<BaggageDetail />}
        trigger="hover"
        placement="right"
        overlayStyle={{ maxWidth: 300 }}
      >
        <InfoCircleOutlined className={styles.modalInfoIcon} />
      </Popover>
    </Flex>

    <Typography.Text className={styles.modalValue}>
      Ручная кладь · 10 кг
    </Typography.Text>
  </Flex> */}
        </Row>
      </Flex>
      {/* 

      <div className={styles.modalGrid}>...</div>

      <div className={styles.modalDivider} />

      <div className={styles.modalSegments}>...</div>

      <div className={styles.modalDivider} />

      <div className={styles.modalPriceRow}>...</div>

      <div className={styles.modalBtnRow}>...</div> */}
    </Modal>
  );
};
