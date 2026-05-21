import { Flex, Space, Typography } from 'antd';
import styles from './search-page.module.css';

const SearchPage = () => {
  return (
    <div className={styles.page}>
      <Flex vertical gap={32}>
        <Space direction="vertical" size={8}>
          <Typography.Title>Не знаю куда лететь</Typography.Title>
          <Typography.Paragraph type="secondary">
            Мы тоже не знаем. Но сейчас выясним.
          </Typography.Paragraph>
        </Space>
      </Flex>
    </div>
  );
};

export default SearchPage;
