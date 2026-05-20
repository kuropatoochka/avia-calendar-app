import type { DepartureTime, FlightFiltersState } from './types';
import type { TicketFiltersRequest } from '@/shared/types';

const MAX_PRICE_DEFAULT = 200_000;

const TIME_RANGES: Record<DepartureTime, [string, string]> = {
  night: ['00:00:00', '05:59:00'],
  morning: ['06:00:00', '11:59:00'],
  afternoon: ['12:00:00', '17:59:00'],
  evening: ['18:00:00', '23:59:00'],
};

const getDepartureTimeParams = (
  departureTime: DepartureTime | null,
): Pick<TicketFiltersRequest, 'departure_from_time' | 'departure_to_time'> => {
  if (!departureTime) {
    return {};
  }

  const [departureFromTime, departureToTime] = TIME_RANGES[departureTime];

  return {
    departure_from_time: departureFromTime,
    departure_to_time: departureToTime,
  };
};

const getBaggageSize = (filters: FlightFiltersState) => {
  const baggageWeight = filters.baggageEnabled
    ? filters.baggageWeights.reduce((sum, weight) => sum + weight, 0) +
      filters.extraBaggageEntries.reduce((sum, entry) => sum + entry.weight, 0)
    : 0;

  const animalsWeight = filters.petsEnabled
    ? filters.animalWeights.reduce((sum, weight) => sum + weight, 0)
    : 0;

  const totalWeight = baggageWeight + animalsWeight;

  return totalWeight > 0 ? totalWeight : undefined;
};

export const mapFiltersToTicketRequest = (filters: FlightFiltersState): TicketFiltersRequest => ({
  ...getDepartureTimeParams(filters.departureTime),
  company: filters.airlines.length > 0 ? filters.airlines.join(',') : undefined,
  price_to: filters.maxPrice < MAX_PRICE_DEFAULT ? filters.maxPrice : undefined,
  baggage_size: getBaggageSize(filters),
});
