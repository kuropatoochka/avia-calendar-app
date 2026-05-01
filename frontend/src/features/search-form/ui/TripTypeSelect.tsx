import { Popover } from 'antd';
import classNames from 'clsx';
import { ArrowDown } from '@/shared/assets';
import { TRIP_TYPE_LABELS } from '../consts/labels';
import type { TripType } from '../types/searchForm';
import styles from './styles.module.css';

interface TripTypeSelectProps {
  value: TripType;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChange: (type: TripType) => void;
}

export const TripTypeSelect = ({ value, open, onOpenChange, onChange }: TripTypeSelectProps) => {
  const content = (
    <div className={styles.tripTypeContent}>
      {(['oneWay', 'roundTrip'] as TripType[]).map((type) => (
        <button
          key={type}
          type="button"
          className={classNames(styles.tripTypeOption, {
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
    </div>
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
      <div className={styles.controlBtnOuter} role="button" tabIndex={0}>
        <div className={styles.controlBtn}>
          <span className={styles.controlBtnText}>{TRIP_TYPE_LABELS[value]}</span>
          <ArrowDown className={classNames(styles.arrowIcon, { [styles.arrowIconOpen]: open })} />
        </div>
      </div>
    </Popover>
  );
};
