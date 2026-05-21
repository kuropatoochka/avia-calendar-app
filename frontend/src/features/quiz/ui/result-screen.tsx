import type { DestinationKey } from '../model/types';
import { Button } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/shared/consts';
import { pickRandom } from '../model/get-result';
import { DESTINATIONS } from '../model/quiz-data';
import { AnimatedEmoji } from './animated-emoji';
import styles from './result-screen.module.css';

interface ResultScreenProps {
  result: DestinationKey;
  onRestart: () => void;
}

export const ResultScreen = ({ result, onRestart }: ResultScreenProps) => {
  const navigate = useNavigate();
  const destination = DESTINATIONS[result];
  const description = useMemo(() => pickRandom(destination.descriptions), [destination]);

  const handleSearchTickets = () => {
    void navigate(PATHS.offer);
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
          <Button className={styles.ghostButton} onClick={onRestart}>
            Я всё ещё сомневаюсь
          </Button>
        </div>

        <p className={styles.footnote}>Это был научно обоснованный алгоритм. Почти.</p>
      </div>
    </div>
  );
};
