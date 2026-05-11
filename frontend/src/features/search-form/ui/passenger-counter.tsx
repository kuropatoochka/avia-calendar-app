import { Tooltip } from 'antd';
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
  <div className={styles.passengerRow}>
    <div className={styles.passengerLabelGroup}>
      <span className={styles.passengerLabel}>
        {label}
        {helpText && (
          <Tooltip title={helpText} placement="top">
            <span className={styles.helpIcon}>?</span>
          </Tooltip>
        )}
      </span>
      {subLabel && <span className={styles.passengerSubLabel}>{subLabel}</span>}
    </div>
    <div className={styles.passengerCounter}>
      <button
        type="button"
        className={styles.counterBtn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        −
      </button>
      <span className={styles.counterValue}>{value}</span>
      <button type="button" className={styles.counterBtn} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  </div>
);
