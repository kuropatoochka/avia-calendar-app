import { Quiz } from '@/features/quiz';
import styles from './search-page.module.css';

const SearchPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Не знаю куда лететь</h1>
        <p className={styles.heroSubtitle}>Мы тоже не знаем. Но сейчас выясним.</p>
      </div>
      <div className={styles.card}>
        <Quiz />
      </div>
    </div>
  );
};

export default SearchPage;
