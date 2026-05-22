import type { FlightBookingDetails, FlightCardViewModel } from '../model/types';
import { Avatar, Flex, Tooltip, Typography } from 'antd';
import { dateFormatter, priceFormatter } from '@/shared/utils';
import { formatServiceClass } from '../model/formatter';
import { getBaggageLabel } from '../model/get-baggage-info';
import { getAirlineLogo, getCompanyShortName } from '../model/get-company-info';
import { getPassengersLabel } from '../model/get-passanger-info';
import styles from './flight-list.module.css';
import { RouteScale } from './route-scale';

type Props = {
  flight: FlightCardViewModel;
  bookingDetails?: FlightBookingDetails | null;
  onClick?: () => void;
};

export const FlightCard = ({ flight, bookingDetails, onClick }: Props) => {
  const passengersLabel = getPassengersLabel(bookingDetails);
  const baggageLabel = getBaggageLabel(bookingDetails);
  const serviceClass = bookingDetails?.serviceClass
    ? formatServiceClass(bookingDetails.serviceClass)
    : undefined;

  const { departureDate, price } = flight;

  return (
    <Flex
      component="article"
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <Flex justify="space-between" align="flex-start" gap={24}>
        <Flex className={styles.block}>
          <Typography.Title className={styles.cardPrice}>
            {priceFormatter.format(price)}
          </Typography.Title>

          <RouteScale flight={flight} />
        </Flex>
      </Flex>

      <Flex className={styles.block}>
        <Avatar.Group>
          {flight.companyNames.map((company) => (
            <Tooltip key={company} title={company}>
              <Avatar src={getAirlineLogo(company)} className={styles.companyAvatar}>
                {!getAirlineLogo(company) && getCompanyShortName(company)}
              </Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>

        <Typography.Text strong>{dateFormatter.format(new Date(departureDate))}</Typography.Text>

        {passengersLabel && <Typography.Text strong>{passengersLabel}</Typography.Text>}

        {passengersLabel && <Typography.Text type="secondary">{serviceClass}</Typography.Text>}

        {baggageLabel && <Typography.Text strong>{baggageLabel}</Typography.Text>}
      </Flex>
    </Flex>
  );
};
