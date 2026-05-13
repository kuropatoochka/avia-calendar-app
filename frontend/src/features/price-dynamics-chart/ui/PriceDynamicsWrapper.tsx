import { Button, Spin } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PriceDynamicsDto, PriceDynamicsRequest } from '@/shared/types';
import { cn } from '@/shared/utils';
import { usePriceDynamics } from '../hooks/usePriceDynamics';
import styles from './price-dynamics.module.css';

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const getMaxPrice = (items: PriceDynamicsDto[]) => {
  return items.reduce(
    (max, item) => (item.minPrice !== null && item.minPrice > max ? item.minPrice : max),
    0,
  );
};

const formatDateLabel = (date: string) => {
  return date.split('-').slice(1).reverse().join('.');
};

const formatDateFull = (date: string) => {
  return date.split('-').reverse().join('.');
};

type PriceDynamicsSectionConfig = {
  label: string;
  params: PriceDynamicsRequest;
  originLabel: string;
  destinationLabel: string;
};

export type PriceDynamicsSelection = {
  direction: 'outbound' | 'return';
  date: string;
};

type PriceDynamicsBlockProps = {
  sections: PriceDynamicsSectionConfig[];
  onShowFlights?: (selection: PriceDynamicsSelection) => void;
};

const PriceDynamicsSection = ({
  label,
  params,
  originLabel,
  destinationLabel,
  selected,
  onSelect,
  sectionKey,
  onLoadingChange,
}: PriceDynamicsSectionConfig & {
  selected: PriceDynamicsSelection | null;
  onSelect: (selection: PriceDynamicsSelection) => void;
  sectionKey: string;
  onLoadingChange: (key: string, isLoading: boolean) => void;
}) => {
  const { priceDynamics, fetchPriceDynamics, isPriceDynamicsLoading, priceDynamicsError } =
    usePriceDynamics();

  useEffect(() => {
    fetchPriceDynamics(params);
  }, [fetchPriceDynamics, params]);

  useEffect(() => {
    onLoadingChange(sectionKey, isPriceDynamicsLoading);
  }, [isPriceDynamicsLoading, onLoadingChange, sectionKey]);

  const maxPrice = useMemo(() => getMaxPrice(priceDynamics), [priceDynamics]);
  const routeSummary = `${originLabel} - ${destinationLabel}`;
  const dateSummary = `${formatDateFull(params.dateFrom)} - ${formatDateFull(params.dateTo)}`;

  const showState = isPriceDynamicsLoading || priceDynamicsError || !priceDynamics.length;
  const stateText = isPriceDynamicsLoading
    ? 'Загружаем динамику цен...'
    : (priceDynamicsError ?? 'Нет данных по выбранному периоду.');
  const direction: PriceDynamicsSelection['direction'] =
    label === 'Обратно' ? 'return' : 'outbound';

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>{label}</span>
        <p className={styles.subtitle}>{routeSummary}</p>
        <p className={styles.meta}>{dateSummary}</p>
      </div>
      {showState ? (
        <div className={styles.stateText}>{stateText}</div>
      ) : (
        <div className={styles.chart}>
          <div className={styles.chartScroll}>
            <div className={styles.chartGrid}>
              {priceDynamics.map((item) => {
                const isUnavailable = item.minPrice === null;
                const height =
                  !isUnavailable && maxPrice > 0
                    ? Math.max(8, Math.round((item.minPrice / maxPrice) * 100))
                    : 0;
                const isSelected = selected?.date === item.date && selected.direction === direction;
                const priceLabel = isUnavailable
                  ? 'нет'
                  : priceFormatter.format(item.minPrice ?? 0);
                const ariaLabel = isUnavailable
                  ? `Дата ${formatDateLabel(item.date)} недоступна`
                  : `Выбрать дату ${formatDateLabel(item.date)}, цена ${priceLabel}`;

                return (
                  <div className={styles.barColumn} key={item.date}>
                    <div className={styles.barTrack}>
                      <button
                        type="button"
                        className={styles.barButton}
                        onClick={() => {
                          if (!isUnavailable) {
                            onSelect({ direction, date: item.date });
                          }
                        }}
                        disabled={isUnavailable}
                        aria-label={ariaLabel}
                      >
                        <div
                          className={cn(
                            styles.bar,
                            isUnavailable && styles.barUnavailable,
                            isSelected && styles.barSelected,
                          )}
                          style={{ height: `${height}%` }}
                        />
                      </button>
                    </div>
                    <div
                      className={cn(styles.priceLabel, isUnavailable && styles.priceUnavailable)}
                    >
                      {priceLabel}
                    </div>
                    <div className={styles.dateLabel}>{formatDateLabel(item.date)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PriceDynamicsBlock = ({ sections, onShowFlights }: PriceDynamicsBlockProps) => {
  const [selected, setSelected] = useState<PriceDynamicsSelection | null>(null);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const handleLoadingChange = useCallback((key: string, isLoading: boolean) => {
    setLoadingMap((prev) => {
      if (prev[key] === isLoading) {
        return prev;
      }

      return {
        ...prev,
        [key]: isLoading,
      };
    });
  }, []);

  const isAnyLoading = useMemo(() => {
    return Object.values(loadingMap).some(Boolean);
  }, [loadingMap]);

  useEffect(() => {
    setSelected(null);
    setLoadingMap({});
  }, [sections]);

  return (
    <section className={styles.card}>
      <Spin spinning={isAnyLoading}>
        {sections.map((section) => {
          const sectionKey = `${section.label}-${section.params.originAirportId}`;

          return (
            <PriceDynamicsSection
              key={sectionKey}
              {...section}
              selected={selected}
              onSelect={setSelected}
              sectionKey={sectionKey}
              onLoadingChange={handleLoadingChange}
            />
          );
        })}
        <div className={styles.actions}>
          <Button
            type="primary"
            disabled={!selected}
            onClick={() => {
              if (selected) {
                onShowFlights?.(selected);
              }
            }}
          >
            Показать рейсы на выбранную дату
          </Button>
        </div>
      </Spin>
    </section>
  );
};

export const PriceDynamicsPlaceholder = () => (
  <section className={styles.card}>
    <p className={styles.stateText}>
      Заполните форму и запустите поиск, чтобы увидеть динамику цен.
    </p>
  </section>
);
