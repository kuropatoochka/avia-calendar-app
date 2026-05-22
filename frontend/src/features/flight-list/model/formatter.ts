import type { FlightBookingDetails } from './types';
import { SERVICE_CLASS_LABELS } from '@/shared/consts';
import type { ServiceClass } from '@/shared/types';

export const formatPassengersLabel = (passengers: FlightBookingDetails['passengers']) => {
  const total = passengers.adults + passengers.children + passengers.toddler;

  return `${total} пассажир${total === 1 ? '' : 'а'}`;
};

export const formatBaggageLabel = (baggage: FlightBookingDetails['baggage']) => {
  if (!baggage.enabled) {
    return 'Ручная кладь';
  }

  const weights = Array.from(new Set(baggage.weights)).filter(Boolean);

  if (weights.length === 1) {
    return `Багаж · ${weights[0]} кг`;
  }

  return 'Багаж';
};

export const formatServiceClass = (serviceClass: ServiceClass) => {
  return SERVICE_CLASS_LABELS[serviceClass];
};
