import { Button } from 'antd';
import { useMemo } from 'react';
import { pickRandom } from '../model/get-result';
import {
  LANDING_BUTTONS,
  LANDING_FOOTNOTES,
  LANDING_SUBTITLES,
  LANDING_TITLES,
} from '../model/quiz-data';
import styles from './landing-screen.module.css';

interface LandingScreenProps {
  onStart: () => void;
  onBrowse: () => void;
}

export const LandingScreen = ({ onStart, onBrowse }: LandingScreenProps) => {
  const title = useMemo(() => pickRandom(LANDING_TITLES), []);
  const subtitle = useMemo(() => pickRandom(LANDING_SUBTITLES), []);
  const buttonText = useMemo(() => pickRandom(LANDING_BUTTONS), []);
  const footnote = useMemo(() => pickRandom(LANDING_FOOTNOTES), []);

  return (
    <div className={styles.wrapper}>
      <span className={styles.flyingPlane} aria-hidden="true">
        ✈
      </span>
      <div className={styles.content}>
        <div className={styles.badge}>пройди опрос: куда лететь?</div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <Button className={styles.button} onClick={onStart}>
          {buttonText}
        </Button>
        <p className={styles.footnote}>{footnote}</p>
      </div>
      <button type="button" className={styles.browseLink} onClick={onBrowse}>
        Посмотреть все направления и цены →
      </button>
    </div>
  );
};
