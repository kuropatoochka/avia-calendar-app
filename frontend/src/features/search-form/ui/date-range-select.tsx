import type { Dayjs } from 'dayjs';
import { DatePicker, Flex } from 'antd';
import dayjs from 'dayjs';
import { ArrowDown } from '@/shared/assets';
import { cn } from '@/shared/utils';
import styles from './search-form.module.css';

const { RangePicker } = DatePicker;

interface Props {
  value?: [Dayjs, Dayjs] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange?: (value: [Dayjs, Dayjs] | null) => void;
}

export const DateRangeSelect = ({ value, open, onOpenChange, onChange }: Props) => {
  const disablePastDates = (date: Dayjs) => {
    return date.isBefore(dayjs().startOf('day'), 'day');
  };

  return (
    <Flex className={styles.field} vertical justify="space-around">
      <RangePicker
        value={value}
        open={open}
        onOpenChange={onOpenChange}
        disabledDate={disablePastDates}
        variant="borderless"
        format="DD.MM.YYYY"
        placeholder={['Туда', 'Обратно']}
        suffixIcon={
          <ArrowDown
            className={cn(styles.arrow, {
              [styles.arrowOpen]: open,
            })}
          />
        }
        onChange={(dates) => {
          if (!dates?.[0] || !dates?.[1]) {
            onChange?.(null);
            return;
          }

          onChange?.([dates[0], dates[1]]);
        }}
      />
    </Flex>
  );
};
