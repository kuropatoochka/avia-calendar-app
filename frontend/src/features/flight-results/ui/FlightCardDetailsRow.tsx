import { HeartOutlined, MoonOutlined, SunOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Plane } from '@/shared/assets';
import type { FlightDto } from '@/shared/types';
import { AirlineCircle } from '@/shared/ui';
import { formatFlightDate, formatPassengers } from '@/shared/utils';
import { CarryOnIcon, CheckedBaggageIcon } from './BaggageIcons';
import styles from './styles.module.css';

type Props = {
  flight: FlightDto;
  passengersCount: number;
  classLabel: string;
  effectiveBaggage: boolean;
  airlines: string[];
};

const getDepartureHour = (departureTime: string) => Number(departureTime.split(':')[0]);

export const FlightCardDetailsRow = ({
  flight,
  passengersCount,
  classLabel,
  effectiveBaggage,
  airlines,
}: Props) => {
  const hasCarrierChange = airlines.length > 1;
  const BaggageIcon = effectiveBaggage ? CheckedBaggageIcon : CarryOnIcon;
  const baggageTooltip = effectiveBaggage
    ? `Багаж · ${flight.baggageWeight} кг`
    : 'Ручная кладь · 10 кг';

  const hour = getDepartureHour(flight.departureTime);
  const isMorning = hour >= 6 && hour < 18;
  const isLate = hour >= 18 || hour < 6;
  const isFast = flight.duration < 180;

  return (
    <div className={styles.cardDetails}>
      <div className={styles.airlineCircleStack}>
        <AirlineCircle airline={flight.airline} size={40} />
        {hasCarrierChange && (
          <AirlineCircle airline={airlines[1]} size={40} className={styles.airlineLogoCircle2} />
        )}
      </div>

      <div className={styles.detailCol}>
        <span className={styles.detailMain}>{formatFlightDate(flight.date)}</span>
        <span className={styles.detailSub}>
          {flight.departureTime} – {flight.arrivalTime}
        </span>
      </div>

      <div className={styles.detailCol}>
        <span className={styles.detailMain}>{formatPassengers(passengersCount)}</span>
        <span className={styles.detailSub}>{classLabel}</span>
      </div>

      <div className={styles.routeCol}>
        <div className={styles.cardIconRow}>
          <Tooltip title={baggageTooltip}>
            <BaggageIcon className={styles.baggageIcon} />
          </Tooltip>
          {isMorning && (
            <Tooltip title="Утренний вылет">
              <SunOutlined className={styles.cardTagIcon} />
            </Tooltip>
          )}
          {isLate && (
            <Tooltip title="Поздний вылет">
              <MoonOutlined className={styles.cardTagIcon} />
            </Tooltip>
          )}
          {flight.petsAllowed && (
            <Tooltip title="С животным рядом">
              <HeartOutlined className={styles.cardTagIcon} />
            </Tooltip>
          )}
          {isFast && (
            <Tooltip title="Быстрый перелёт">
              <ThunderboltOutlined className={styles.cardTagIcon} />
            </Tooltip>
          )}
        </div>
        <div className={styles.route}>
          <span className={styles.routeCity}>{flight.originCity}</span>
          <Plane className={styles.routePlane} />
          <span className={styles.routeCity}>{flight.destinationCity}</span>
        </div>
      </div>
    </div>
  );
};
