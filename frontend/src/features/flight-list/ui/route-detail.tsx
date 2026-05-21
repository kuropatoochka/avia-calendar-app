import type { FlightCardViewModel } from '../model/types';
import { Avatar, Flex, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import type { TicketItemDto } from '@/shared/types';
import { durationFormatter, timeFormatter } from '@/shared/utils';
import { getAirlineLogo, getCompanyShortName } from '../model/get-company-info';
import styles from './route-detail.module.css';

const getRouteSegments = (flight: FlightCardViewModel) => {
  return flight.segments.map((segment) => ({
    id: `${segment.flight_number}-${segment.departure_date}-${segment.departure_time}`,
    companyName: segment.company_name,
    flightNumber: segment.flight_number,
    fromCity: segment.city_from,
    toCity: segment.city_to,
    fromAirport: segment.airport_from,
    toAirport: segment.airport_to,
    departureDate: segment.departure_date,
    arrivalDate: segment.arrival_date,
    departureTime: segment.departure_time,
    arrivalTime: segment.arrival_time,
    duration: segment.duration,
    plane: `${segment.plane_type} · ${segment.plane_number}`,
  }));
};

const getTransferDuration = (current: TicketItemDto, next?: TicketItemDto) => {
  if (!next) {
    return null;
  }

  const arrival = dayjs(`${current.arrival_date} ${current.arrival_time}`);
  const departure = dayjs(`${next.departure_date} ${next.departure_time}`);

  if (!arrival.isValid() || !departure.isValid()) {
    return null;
  }

  const minutes = departure.diff(arrival, 'minute');

  return minutes > 0 ? minutes : null;
};

type Props = {
  flight: FlightCardViewModel;
};

export const RouteDetail = ({ flight }: Props) => {
  const segments = getRouteSegments(flight);

  return (
    <Space orientation="vertical" size={16} className={styles.routeDetail}>
      <div>
        <Typography.Text strong>
          {flight.cityFrom} → {flight.cityTo}
        </Typography.Text>

        <div>
          <Typography.Text type="secondary">
            {durationFormatter(flight.duration)} в пути
          </Typography.Text>
        </div>
      </div>

      {segments.map((segment, index) => {
        const {
          id,
          arrivalTime,
          companyName,
          flightNumber,
          duration,
          departureTime,
          fromAirport,
          fromCity,
          toAirport,
          toCity,
        } = segment;

        const transferDuration = getTransferDuration(
          flight.segments[index],
          flight.segments[index + 1],
        );

        return (
          <Space key={id} orientation="vertical" size={10} className={styles.routeSegment}>
            <Flex justify="space-between" align="center" gap={16}>
              <Flex align="center" gap={10}>
                <Avatar src={getAirlineLogo(companyName)}>
                  {!getAirlineLogo(companyName) && getCompanyShortName(companyName)}
                </Avatar>

                <div>
                  <Typography.Text strong>{companyName}</Typography.Text>

                  <div>
                    <Typography.Text type="secondary">
                      {durationFormatter(duration)} в полёте
                    </Typography.Text>
                  </div>
                </div>
              </Flex>

              <Typography.Text type="secondary">{flightNumber}</Typography.Text>
            </Flex>

            <div className={styles.routePoints}>
              <div className={styles.routePoint}>
                <span className={styles.routeDot} />

                <Typography.Text strong className={styles.routeTime}>
                  {timeFormatter(departureTime)}
                </Typography.Text>

                <div>
                  <Typography.Text strong>{fromCity}</Typography.Text>
                  <div>
                    <Typography.Text type="secondary">{fromAirport}</Typography.Text>
                  </div>
                </div>
              </div>

              <div className={styles.routeLine} />

              <div className={styles.routePoint}>
                <span className={styles.routeDot} />

                <Typography.Text strong className={styles.routeTime}>
                  {timeFormatter(arrivalTime)}
                </Typography.Text>

                <div>
                  <Typography.Text strong>{toCity}</Typography.Text>
                  <div>
                    <Typography.Text type="secondary">{toAirport}</Typography.Text>
                  </div>
                </div>
              </div>
            </div>

            <Typography.Text type="secondary">{segment.plane}</Typography.Text>

            {index < segments.length - 1 && (
              <Tag className={styles.routeTransfer}>
                Пересадка в {segment.toCity}
                {transferDuration ? ` · ${durationFormatter(transferDuration)}` : ''}
              </Tag>
            )}
          </Space>
        );
      })}
    </Space>
  );
};
