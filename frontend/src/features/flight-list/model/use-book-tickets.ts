import { useCallback, useState } from 'react';
import { FlightService } from '@/shared/api';
import type { TicketBookRequestItem, TicketBookResponse } from '@/shared/types';

export const useBookTickets = () => {
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<TicketBookResponse | null>(null);

  const bookTickets = useCallback(async (body: TicketBookRequestItem[]) => {
    setIsBookingLoading(true);
    setBookingError(null);

    try {
      const result = await FlightService.bookTickets(body);
      setBookingResult(result);

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось забронировать билет.';

      setBookingError(message);

      return null;
    } finally {
      setIsBookingLoading(false);
    }
  }, []);

  const resetBooking = useCallback(() => {
    setBookingError(null);
    setBookingResult(null);
  }, []);

  return {
    bookTickets,
    resetBooking,
    bookingResult,
    bookingError,
    isBookingLoading,
  };
};
