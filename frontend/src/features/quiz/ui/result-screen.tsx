import type { DestinationKey } from '../model/types';
import { Button } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/shared/consts';
import {
  DEST_AIRPORT_MOCK,
  DEST_AIRPORT_REAL,
  findCheapestAirportPair,
  MOSCOW_AIRPORT_IDS,
  MOSCOW_MOCK_AIRPORT_ID,
} from '../model/airport-ids';
import { pickRandom } from '../model/get-result';
import { DESTINATIONS } from '../model/quiz-data';
import { AnimatedEmoji } from './animated-emoji';
import styles from './result-screen.module.css';

const USE_REAL_API = import.meta.env.VITE_DATA_SOURCE !== 'mock';

interface ResultScreenProps {
  result: DestinationKey;
  onRestart: () => void;
  onDoubt: () => void;
}

export const ResultScreen = ({ result, onRestart, onDoubt }: ResultScreenProps) => {
  const navigate = useNavigate();
  const destination = DESTINATIONS[result];
  const description = useMemo(() => pickRandom(destination.descriptions), [destination]);

  // Диапазон дат «сегодня + 1 месяц» — вычисляется один раз при монтировании
  const { fromDate, toDate } = useRef(
    (() => {
      const today = new Date();
      return {
        fromDate: today.toISOString().slice(0, 10),
        toDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
          .toISOString()
          .slice(0, 10),
      };
    })(),
  ).current;

  // Mock: пару инициализируем сразу через lazy initializer, не через эффект
  const [cheapestPair, setCheapestPair] = useState<{ fromId: number; toId: number } | null>(() => {
    if (USE_REAL_API) return null;
    const destIds = DEST_AIRPORT_MOCK[result];
    if (destIds && destIds.length > 0) {
      return { fromId: MOSCOW_MOCK_AIRPORT_ID, toId: destIds[0] };
    }
    return null;
  });

  useEffect(() => {
    if (!USE_REAL_API) return;
    const destIds = DEST_AIRPORT_REAL[result] ?? [];
    if (destIds.length > 0) {
      void findCheapestAirportPair([...MOSCOW_AIRPORT_IDS], destIds, fromDate, toDate).then(
        (pair) => {
          if (pair) setCheapestPair(pair);
        },
      );
    }
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchTickets = () => {
    // Пока данные ещё грузятся — используем SVO (id=1) как фоллбэк
    const fromId =
      cheapestPair?.fromId ?? (USE_REAL_API ? MOSCOW_AIRPORT_IDS[0] : MOSCOW_MOCK_AIRPORT_ID);
    const toId =
      cheapestPair?.toId ??
      (USE_REAL_API
        ? (DEST_AIRPORT_REAL[result]?.[0] ?? 0)
        : (DEST_AIRPORT_MOCK[result]?.[0] ?? 0));

    if (!toId || fromId === toId) {
      // Нет назначения или совпадает с отправлением (например, результат — Москва)
      void navigate(PATHS.offer);
      return;
    }

    const params = new URLSearchParams({
      from: String(fromId),
      to: String(toId),
      dateFrom: fromDate,
      dateTo: toDate,
    });
    void navigate(`${PATHS.offer}?${params.toString()}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.verdict}>Мы всё решили за тебя</div>

        <div className={styles.destination}>
          <AnimatedEmoji emoji={destination.emoji} className={styles.destinationEmoji} />
          <div className={styles.destinationText}>
            <span className={styles.destinationLabel}>Судя по ответам, тебе пора в:</span>
            <h2 className={styles.destinationName}>{destination.name}</h2>
            <p className={styles.destinationTagline}>{destination.tagline}</p>
          </div>
        </div>

        <div className={styles.descriptionCard}>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.actions}>
          <Button className={styles.primaryButton} onClick={handleSearchTickets}>
            Смотреть билеты
          </Button>
          <Button className={styles.secondaryButton} onClick={onRestart}>
            Пройти ещё раз
          </Button>
          <Button className={styles.ghostButton} onClick={onDoubt}>
            Я всё ещё сомневаюсь
          </Button>
        </div>

        <p className={styles.footnote}>Это был научно обоснованный алгоритм. Почти.</p>
      </div>
    </div>
  );
};
