import type { TripType } from '../model/types';
import { Select } from 'antd';
import { ArrowDown } from '@/shared/assets';
import { cn } from '@/shared/utils';
import { TRIP_TYPE_LABELS } from '../model/labels';
import styles from './search-form.module.css';

interface Props {
  value?: TripType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange?: (type: TripType) => void;
}

const TRIP_TYPE_OPTIONS: { value: TripType; label: string }[] = [
  { value: 'oneWay', label: TRIP_TYPE_LABELS.oneWay },
  { value: 'roundTrip', label: TRIP_TYPE_LABELS.roundTrip },
];

export const TripTypeSelect = ({ value = 'oneWay', open, onOpenChange, onChange }: Props) => {
  return (
    <Select<TripType>
      value={value}
      options={TRIP_TYPE_OPTIONS}
      open={open}
      onOpenChange={onOpenChange}
      onChange={onChange}
      variant="borderless"
      popupMatchSelectWidth={200}
      className={styles.field}
      suffixIcon={
        <ArrowDown
          className={cn(styles.arrow, {
            [styles.arrowOpen]: open,
          })}
        />
      }
    />
  );
};
