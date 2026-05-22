import type { FlightCardViewModel } from '../model/types';
import { Flex, Space, Tooltip, Typography } from 'antd';
import { timeFormatter } from '@/shared/utils';
import { getTransferTooltip } from '../model/get-route-info';
import styles from './flight-list.module.css';

type Props = {
  flight: FlightCardViewModel;
};

export const RouteScale = ({ flight }: Props) => {
  return (
    <Flex vertical gap={8} className={styles.routeScale}>
      <Flex justify="space-between" align="center" gap={16}>
        <Space>
          <Typography.Title level={3} className={styles.routeTime}>
            {timeFormatter(flight.departureTime)}
          </Typography.Title>
          <Typography.Text type="secondary">{flight.cityFrom}</Typography.Text>
        </Space>

        <Space>
          <Typography.Title level={3} className={styles.routeTime}>
            {timeFormatter(flight.arrivalTime)}
          </Typography.Title>
          <Typography.Text type="secondary">{flight.cityTo}</Typography.Text>
        </Space>
      </Flex>

      <div className={styles.scale}>
        <span className={styles.scaleDot} />
        {flight.segments.map((segment, index) => {
          const isLastSegment = index === flight.segments.length - 1;
          const transferTooltip = getTransferTooltip(flight.segments, index);

          return (
            <span
              key={`${segment.flight_number}-${segment.departure_date}-${segment.departure_time}`}
              className={styles.scalePart}
            >
              <span className={styles.scaleFlightLine} />

              {!isLastSegment && (
                <>
                  <Tooltip title={transferTooltip}>
                    <span className={styles.scaleTransferDot} />
                  </Tooltip>

                  <Tooltip title={transferTooltip}>
                    <span className={styles.scaleTransferLine} />
                  </Tooltip>
                </>
              )}
            </span>
          );
        })}
        <span className={styles.scaleDot} />
      </div>
    </Flex>
  );
};
