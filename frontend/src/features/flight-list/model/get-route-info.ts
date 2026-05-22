import dayjs from 'dayjs';
import type { TicketItemDto } from '@/shared/types';
import { durationFormatter, timeFormatter } from '@/shared/utils';

const getDateTime = (date: string, time: string) => {
  return dayjs(`${date} ${time}`);
};

export const getRouteDuration = (segments: TicketItemDto[]) => {
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  if (!firstSegment || !lastSegment) {
    return 0;
  }

  const departure = getDateTime(firstSegment.departure_date, firstSegment.departure_time);
  const arrival = getDateTime(lastSegment.arrival_date, lastSegment.arrival_time);

  if (!departure.isValid() || !arrival.isValid()) {
    return segments.reduce((sum, segment) => sum + segment.duration, 0);
  }

  const duration = arrival.diff(departure, 'minute');

  return duration > 0 ? duration : segments.reduce((sum, segment) => sum + segment.duration, 0);
};

export const getTransferItems = (segments: TicketItemDto[]) => {
  return segments
    .slice(0, -1)
    .map((segment, index) => {
      const nextSegment = segments[index + 1];

      if (!nextSegment) {
        return null;
      }

      const arrival = getDateTime(segment.arrival_date, segment.arrival_time);
      const departure = getDateTime(nextSegment.departure_date, nextSegment.departure_time);
      const duration = departure.diff(arrival, 'minute');

      return {
        city: segment.city_to,
        airport: segment.airport_to,
        arrivalTime: timeFormatter(segment.arrival_time),
        departureTime: timeFormatter(nextSegment.departure_time),
        duration: duration > 0 ? duration : 0,
      };
    })
    .filter((transfer): transfer is NonNullable<typeof transfer> => transfer !== null);
};

export const getTransferTooltip = (segments: TicketItemDto[], index: number) => {
  const transfer = getTransferItems(segments)[index];

  if (!transfer) {
    return undefined;
  }

  return `Пересадка: ${transfer.city}, ${transfer.airport} · ${durationFormatter(
    transfer.duration,
  )} · ${transfer.arrivalTime}–${transfer.departureTime}`;
};
