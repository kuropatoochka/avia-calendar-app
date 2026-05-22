import type { FlightBookingDetails } from './types';

export const getPassengersLabel = (bookingDetails?: FlightBookingDetails | null) => {
  if (!bookingDetails) {
    return null;
  }

  const total =
    bookingDetails.passengers.adults +
    bookingDetails.passengers.children +
    bookingDetails.passengers.toddler;

  return `${total} пассажир${total === 1 ? '' : 'а'}`;
};
