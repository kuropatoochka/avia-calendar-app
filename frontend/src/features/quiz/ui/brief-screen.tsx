import { Button } from 'antd';
import styles from './brief-screen.module.css';

interface BriefScreenProps {
  totalQuestions: number;
  onStart: () => void;
}

export const BriefScreen = ({ totalQuestions, onStart }: BriefScreenProps) => {
  const WHAT_AWAITS = [
    { icon: '⚡', text: `${totalQuestions} быстрых вопросов` },
    { icon: '☝', text: 'Только один вариант ответа' },
    { icon: '🖼', text: 'Картинки вместо сложных решений' },
    { icon: '🗺', text: 'В конце — направление по твоему настроению' },
  ];
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.plane}>✈</span>
        <h2 className={styles.title}>Перед взлётом — короткий бриф</h2>
      </div>

      <p className={styles.description}>
        Тебя ждут <strong>{totalQuestions} вопросов.</strong>
        <br />
        Без регистрации, натальных карт и «кем вы видите себя через 5 лет».
      </p>

      <p className={styles.hint}>
        Отвечай быстро и не думай слишком долго — самые хорошие поездки обычно начинаются именно
        так.
      </p>

      <ul className={styles.list}>
        {WHAT_AWAITS.map((item) => (
          <li key={item.text} className={styles.listItem}>
            <span className={styles.listIcon}>{item.icon}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <Button className={styles.button} onClick={onStart}>
          Погнали
        </Button>
        <p className={styles.footnote}>
          Да, можно пройти тест несколько раз.
          <br />
          Да, мы тоже так делаем, пока не выпадет Сочи.
        </p>
      </div>
    </div>
  );
};
