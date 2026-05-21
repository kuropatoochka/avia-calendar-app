import type { LayoverNote } from '../lib/types';
import type { FlightDto } from '@/shared/types';
import { AirlineCircle } from '@/shared/ui';
import { formatDuration } from '@/shared/utils';
import { buildSegments, getLayoverNotes } from '../lib/flightUtils';
import styles from './styles.module.css';

const NOTE_PREFIXES: Record<LayoverNote['kind'], string> = {
  danger: '⚠',
  warning: '·',
  info: '·',
};

type Props = { flight: FlightDto };

export const FlightRouteDetail = ({ flight }: Props) => {
  const segments = buildSegments(flight);
  const hasStops = (flight.stops?.length ?? 0) > 0;

  return (
    <div className={styles.routeDetail}>
      <p className={styles.routeDetailTitle}>
        {flight.originCity} — {flight.destinationCity}
      </p>
      <p className={styles.routeDetailSub}>{formatDuration(flight.duration)} в пути</p>

      {segments.map((segment, i) => (
        <div key={i}>
          <div className={styles.routeDetailLeg}>
            <div className={styles.routeDetailLegInfo}>
              <AirlineCircle airline={segment.airline} size={34} />
              <div>
                <p className={styles.routeDetailAirlineName}>{segment.airline}</p>
                <p className={styles.routeDetailLegTime}>
                  {formatDuration(segment.duration)} в полёте
                </p>
              </div>
            </div>

            <div className={styles.routeDetailPoints}>
              <div className={styles.routeDetailPoint}>
                <div className={styles.routeDetailDotCol}>
                  <div className={styles.routeDetailDot} />
                  <div className={styles.routeDetailLine} />
                </div>
                <span className={styles.routeDetailTime}>{segment.dep}</span>
                <div>
                  <p className={styles.routeDetailCity}>{segment.from}</p>
                  <p className={styles.routeDetailAirport}>
                    {segment.fromAirport}, {segment.fromCode}
                  </p>
                </div>
              </div>

              <div className={styles.routeDetailPoint}>
                <div className={styles.routeDetailDotCol}>
                  <div className={styles.routeDetailDot} />
                </div>
                <span className={styles.routeDetailTime}>{segment.arr}</span>
                <div>
                  <p className={styles.routeDetailCity}>{segment.to}</p>
                  <p className={styles.routeDetailAirport}>
                    {segment.toAirport}, {segment.toCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {hasStops &&
            i < segments.length - 1 &&
            (() => {
              const stop = flight.stops![i];
              const notes = getLayoverNotes(stop, segment.arr, segment.airline);
              return (
                <div className={styles.routeDetailTransfer}>
                  <span className={styles.routeDetailTransferBadge}>
                    Пересадка в {stop.city} · {formatDuration(stop.durationMinutes)}
                  </span>
                  {notes.map((note, ni) => (
                    <span
                      key={ni}
                      className={`${styles.routeDetailNote} ${styles[`routeDetailNote_${note.kind}`]}`}
                    >
                      {NOTE_PREFIXES[note.kind]} {note.text}
                    </span>
                  ))}
                </div>
              );
            })()}
        </div>
      ))}
    </div>
  );
};
