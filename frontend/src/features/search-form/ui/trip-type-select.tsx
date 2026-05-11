import type { TripType } from '../model/types';
import { Flex, Popover } from 'antd';
import { ArrowDown } from '@/shared/assets';
import { cn } from '@/shared/utils';
import { TRIP_TYPE_LABELS } from '../model/labels';
import styles from './search-form.module.css';

interface TripTypeSelectProps {
  value: TripType;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChange: (type: TripType) => void;
}

export const TripTypeSelect = ({ value, open, onOpenChange, onChange }: TripTypeSelectProps) => {
  const content = (
    <Flex vertical gap={2} className={styles.tripTypeContent}>
      {(['oneWay', 'roundTrip'] as TripType[]).map((type) => (
        <button
          key={type}
          type="button"
          className={cn(styles.tripTypeOption, {
            [styles.tripTypeOptionActive]: value === type,
          })}
          onClick={() => {
            onChange(type);
            onOpenChange(false);
          }}
        >
          {TRIP_TYPE_LABELS[type]}
        </button>
      ))}
    </Flex>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={onOpenChange}
      placement="bottomLeft"
      arrow={false}
      align={{ offset: [0, 4] }}
      motion={{ motionName: '' }}
    >
      <button
        type="button"
        className={styles.controlBtnOuter}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className={styles.controlBtn}>
          <span className={styles.controlBtnText}>{TRIP_TYPE_LABELS[value]}</span>

          <span
            className={cn(styles.arrowIcon, {
              [styles.arrowIconOpen]: open,
            })}
            aria-hidden="true"
          >
            <ArrowDown />
          </span>
        </span>
      </button>
    </Popover>
  );
};
