import { Plane } from '@/shared/assets';
import type { FlightDto } from '@/shared/types';
import { formatDuration } from '@/shared/utils';
import styles from './styles.module.css';

const getAllCodes = (flight: FlightDto) => [
  flight.origin.toUpperCase(),
  ...(flight.stops?.map((s) => s.code) ?? []),
  flight.destination.toUpperCase(),
];

const getAllCities = (flight: FlightDto) => [
  flight.originCity,
  ...(flight.stops?.map((s) => s.city) ?? []),
  flight.destinationCity,
];

export const StopsTooltip = ({ flight }: { flight: FlightDto }) => {
  const hasStops = (flight.stops?.length ?? 0) > 0;
  const allCodes = getAllCodes(flight);
  const allCities = getAllCities(flight);

  const legDurations: number[] = [];
  if (hasStops) {
    let flyingUsed = 0;
    flight.stops!.forEach((s) => {
      legDurations.push(s.legDurationMinutes);
      flyingUsed += s.legDurationMinutes;
    });
    const totalLayovers = flight.stops!.reduce((acc, s) => acc + s.durationMinutes, 0);
    legDurations.push(flight.duration - totalLayovers - flyingUsed);
  }

  return (
    <div className={styles.tooltipContent}>
      <p className={styles.tooltipDuration}>{formatDuration(flight.duration)} в пути</p>
      <div className={styles.tooltipCodesRow}>
        {allCodes.map((code, i) => (
          <span key={`code-${i}`} style={{ display: 'contents' }}>
            <span className={styles.tooltipCode}>{code}</span>
            {i < allCodes.length - 1 && (
              <div className={styles.tooltipSegment}>
                <div className={styles.tooltipSegmentLine} />
                <Plane className={styles.tooltipPlane} />
                <div className={styles.tooltipSegmentLine} />
                {hasStops && (
                  <span className={styles.tooltipLegDuration}>
                    {formatDuration(legDurations[i])}
                  </span>
                )}
              </div>
            )}
          </span>
        ))}
      </div>
      <div className={styles.tooltipCitiesRow}>
        {allCities.map((city, i) => (
          <span key={i} className={styles.tooltipCity}>
            {city}
          </span>
        ))}
      </div>
      {hasStops && (
        <div className={styles.tooltipStops}>
          {flight.stops!.map((stop) => (
            <p key={stop.code} className={styles.tooltipStopLine}>
              Пересадка: {stop.city}, {stop.airport} · {formatDuration(stop.durationMinutes)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
