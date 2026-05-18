import { Skeleton, Typography } from 'antd';
import { useState } from 'react';
import { useFlightFiltersContext } from '@/features/flight-filters';
import { CLASS_DELTAS } from '@/shared/consts';
import type { FlightDto, FlightsRequest, ServiceClass } from '@/shared/types';
import { applyFilters } from '../lib/flightUtils';
import { useFlightResults } from '../lib/useFlightResults';
import { FlightCard } from './FlightCard';
import { FlightModal } from './FlightModal';
import styles from './styles.module.css';

type Props = {
  searchParams: FlightsRequest;
};

export const FlightResultsBlock = ({ searchParams }: Props) => {
  // Reads filter state shared with <FlightFilters /> via FlightFiltersProvider
  const filters = useFlightFiltersContext();

  const { flights, loading, error } = useFlightResults(searchParams);
  const [selectedFlight, setSelectedFlight] = useState<FlightDto | null>(null);
  const [expanded, setExpanded] = useState(false);

  const [bookedCounts, setBookedCounts] = useState<Map<string, number>>(new Map());
  const [fareOverrides, setFareOverrides] = useState<Map<string, boolean>>(new Map());
  const [classSelections, setClassSelections] = useState<Map<string, ServiceClass>>(new Map());

  const getClass = (id: string): ServiceClass => classSelections.get(id) ?? 'economy';
  const bookedKey = (id: string, cls: ServiceClass) => `${id}-${cls}`;
  const getBookedCount = (id: string) => bookedCounts.get(bookedKey(id, getClass(id))) ?? 0;

  const toggleFareOverride = (id: string) =>
    setFareOverrides((prev) => {
      const next = new Map(prev);
      next.set(id, !prev.get(id));
      return next;
    });

  const setClassSelection = (id: string, cls: ServiceClass) =>
    setClassSelections((prev) => {
      const next = new Map(prev);
      next.set(id, cls);
      return next;
    });

  const toggleBooked = (id: string, cls: ServiceClass) =>
    setBookedCounts((prev) => {
      const next = new Map(prev);
      const key = bookedKey(id, cls);
      if (next.has(key)) next.delete(key);
      else next.set(key, 1);
      return next;
    });

  const addOne = (id: string, cls: ServiceClass) =>
    setBookedCounts((prev) => {
      const next = new Map(prev);
      const key = bookedKey(id, cls);
      next.set(key, (next.get(key) ?? 1) + 1);
      return next;
    });

  const removeOne = (id: string, cls: ServiceClass) =>
    setBookedCounts((prev) => {
      const next = new Map(prev);
      const key = bookedKey(id, cls);
      const current = next.get(key) ?? 0;
      if (current <= 1) next.delete(key);
      else next.set(key, current - 1);
      return next;
    });

  const getEffectivePrice = (flight: FlightDto) => {
    const override = fareOverrides.get(flight.id) ?? false;
    const cls = classSelections.get(flight.id) ?? 'economy';
    const baseFare = override
      ? flight.baggageIncluded
        ? flight.price - 2500
        : flight.price + 2500
      : flight.price;
    return baseFare + CLASS_DELTAS[cls];
  };

  const PREVIEW_COUNT = 3;

  const filteredFlights = applyFilters(flights, filters);

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    const aBooked = getBookedCount(a.id) > 0;
    const bBooked = getBookedCount(b.id) > 0;
    if (aBooked !== bBooked) return aBooked ? -1 : 1;
    return getEffectivePrice(a) - getEffectivePrice(b);
  });

  const canExpand = sortedFlights.length > PREVIEW_COUNT;
  const visibleFlights = expanded ? sortedFlights : sortedFlights.slice(0, PREVIEW_COUNT);

  return (
    <div className={styles.resultsBlock}>
      {loading ? (
        <Skeleton active />
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <div className={styles.offersSection}>
          <div className={styles.offersHeader}>
            <Typography.Title level={3} className={styles.sectionTitle}>
              Доступные предложения
            </Typography.Title>
            <button
              className={styles.viewAll}
              onClick={() => setExpanded((v) => !v)}
              disabled={!canExpand}
            >
              {expanded ? 'Свернуть' : 'Посмотреть все'}
            </button>
          </div>

          <div className={styles.cardsContainer}>
            <div className={styles.cardsListExpanded}>
              {sortedFlights.length === 0 ? (
                <p className={styles.empty}>Рейсы не найдены</p>
              ) : (
                visibleFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    passengersCount={1}
                    bookedCount={getBookedCount(flight.id)}
                    fareOverride={fareOverrides.get(flight.id) ?? false}
                    serviceClass={getClass(flight.id)}
                    onClick={() => setSelectedFlight(flight)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedFlight && (
        <FlightModal
          flight={selectedFlight}
          passengersCount={1}
          bookedCount={getBookedCount(selectedFlight.id)}
          fareOverride={fareOverrides.get(selectedFlight.id) ?? false}
          serviceClass={getClass(selectedFlight.id)}
          onFareChange={() => toggleFareOverride(selectedFlight.id)}
          onClassChange={(cls) => setClassSelection(selectedFlight.id, cls)}
          onToggleBooked={() => toggleBooked(selectedFlight.id, getClass(selectedFlight.id))}
          onAddOne={() => addOne(selectedFlight.id, getClass(selectedFlight.id))}
          onRemoveOne={() => removeOne(selectedFlight.id, getClass(selectedFlight.id))}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </div>
  );
};
