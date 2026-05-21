import type { BaggageOption } from '../model/types';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Typography } from 'antd';
import { priceFormatter } from '@/shared/utils';
import styles from './flight-booking-modal.module.css';

type Props = {
  selectedOption: BaggageOption;
  alternativeOption: BaggageOption;
  onChange: (option: BaggageOption) => void;
};

export const BaggageDetail = ({ selectedOption, alternativeOption, onChange }: Props) => {
  const switchLabel = selectedOption.enabled ? 'Поменять на ручную кладь?' : 'Поменять на багаж?';

  return (
    <Flex vertical gap={8}>
      <Typography.Text strong>Условия тарифа</Typography.Text>
      <Flex gap={8} align="center">
        <CheckOutlined style={{ color: 'var(--color-accent)' }} />
        <Flex vertical>
          <Typography.Text>Ручная кладь — 1 шт</Typography.Text>
          <Typography.Text type="secondary" className={styles.modalLabel}>
            до 10 кг · 55 × 40 × 20 см
          </Typography.Text>
        </Flex>
      </Flex>

      <Flex gap={8} align="center">
        {selectedOption.enabled ? (
          <>
            <CheckOutlined style={{ color: 'var(--color-accent)' }} />
            <Flex vertical>
              <Typography.Text>Багаж включён</Typography.Text>
              <Typography.Text type="secondary" className={styles.modalLabel}>
                до {selectedOption.weight} кг · 158 лин. см
              </Typography.Text>
            </Flex>
          </>
        ) : (
          <>
            <CloseOutlined />
            <Typography.Text>Без багажа</Typography.Text>
          </>
        )}
      </Flex>

      <Flex gap={8} align="center">
        <CloseOutlined />
        <Typography.Text>Без возврата</Typography.Text>
      </Flex>

      <Flex gap={8} align="center">
        <CheckOutlined style={{ color: 'var(--color-accent)' }} />
        <Typography.Text>Обмен платный</Typography.Text>
      </Flex>

      <Divider className={styles.divider} />

      <Typography.Text type="secondary" className={styles.modalLabel}>
        Общее количество чемоданов и сумок на всех пассажиров
      </Typography.Text>

      <Typography.Text strong className={styles.modalLabel}>
        {switchLabel}
      </Typography.Text>

      <Button
        block
        color="primary"
        variant="filled"
        onClick={() => onChange(alternativeOption)}
        className={styles.switchButton}
      >
        <Typography.Text className={styles.switchText}>Изменить тариф</Typography.Text>
        <Typography.Text className={styles.switchText}>
          {priceFormatter.format(alternativeOption.price)}
        </Typography.Text>
      </Button>
    </Flex>
  );
};
