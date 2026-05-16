import { MinusOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Space, Tooltip, Typography } from 'antd';
import styles from './search-form.module.css';

interface PassengerCounterProps {
  label: string;
  subLabel?: string;
  helpText?: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}

export const PassengerCounter = ({
  label,
  subLabel,
  helpText,
  value,
  min,
  onChange,
}: PassengerCounterProps) => (
  <Flex align="center" justify="space-between">
    <Space vertical size={1}>
      <Space>
        <Typography.Text>{label}</Typography.Text>
        {helpText && (
          <Tooltip title={helpText} placement="top">
            <QuestionCircleOutlined style={{ color: 'var(--color-text-secondary)' }} />
          </Tooltip>
        )}
      </Space>
      {subLabel && <span className={styles.passengerSubLabel}>{subLabel}</span>}
    </Space>
    <Flex gap={12} align="center">
      <Button
        color="blue"
        variant="filled"
        shape="circle"
        size="small"
        icon={<MinusOutlined />}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      />
      <Typography.Text>{value}</Typography.Text>
      <Button
        color="blue"
        variant="filled"
        shape="circle"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => onChange(value + 1)}
      />
    </Flex>
  </Flex>
);
