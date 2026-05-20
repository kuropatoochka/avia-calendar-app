import { Flex, Typography } from 'antd';
import styles from './price-dynamics.module.css';

export const PriceDynamicsPlaceholder = () => (
  <Flex
    component="section"
    vertical
    align="center"
    className={styles.container}
    style={{ padding: '56px' }}
  >
    <Typography.Text type="secondary">
      Заполните форму и запустите поиск, чтобы увидеть график цен
    </Typography.Text>
  </Flex>
);
