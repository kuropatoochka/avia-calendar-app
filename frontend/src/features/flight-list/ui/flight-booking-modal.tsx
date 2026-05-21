import type { FlightCardViewModel } from '../model/types';
import { Avatar, Divider, Flex, Modal, Tooltip, Typography } from 'antd';
import { cn, durationFormatter, stopsFormatter } from '@/shared/utils';
import { getAirlineLogo } from '../model/get-company-info';
import styles from './flight-booking-modal.module.css';

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
              {cityFrom} → {cityTo}
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
