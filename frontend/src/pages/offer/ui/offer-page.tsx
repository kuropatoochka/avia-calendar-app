import { Space, Typography } from 'antd';
import { FlightFilters } from '@/features/flight-filters';
import { SearchForm } from '@/features/search-form';
import styles from './offer-page.module.css';

const OfferPage = () => {
  return (
    <>
      <Space orientation="vertical" size={8}>
        <Typography.Title>Куда летим?</Typography.Title>
        <Typography.Paragraph type="secondary">
          Да хоть куда, лишь бы подешевле...
        </Typography.Paragraph>
      </Space>
      <SearchForm />
      <div className={styles.columns}>
        <div className={styles.results} />
        <aside className={styles.filterWrapper}>
          <FlightFilters />
        </aside>
      </div>
    </>
  );
};

export default OfferPage;
