import type { DateRangeValue } from '../model/types';
import type { Dayjs } from 'dayjs';
import { DatePicker, Flex, Form, Typography } from 'antd';
import dayjs from 'dayjs';
import { cn } from '@/shared/utils';
import styles from './search-form.module.css';

const { RangePicker } = DatePicker;

interface Props {
  value?: DateRangeValue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange?: (value: DateRangeValue) => void;
}

export const DateRangeSelect = ({ value, open, onOpenChange, onChange }: Props) => {
  const { status } = Form.Item.useStatus();

  const disablePastDates = (date: Dayjs) => {
    return date.isBefore(dayjs().startOf('day'), 'day');
  };

  return (
    <Flex
      className={cn(styles.field, {
        [styles.fieldError]: status === 'error',
      })}
      vertical
      justify="space-around"
    >
      <Flex align="center" justify="space-between">
        <Typography.Paragraph className={styles.label}>Начало</Typography.Paragraph>
        <Typography.Paragraph className={styles.label}>Окончание</Typography.Paragraph>
      </Flex>

      <RangePicker
        value={value}
        open={open}
        onOpenChange={onOpenChange}
        disabledDate={disablePastDates}
        variant="borderless"
        format="DD.MM.YYYY"
        placeholder={['', 'Выберите дату']}
        allowClear={false}
        allowEmpty={[false, true]}
        suffixIcon={null}
        onCalendarChange={(dates) => {
          const startDate = dates?.[0] ?? value?.[0] ?? dayjs();
          const endDate = dates?.[1] ?? null;

          onChange?.([startDate, endDate]);
        }}
        onChange={(dates) => {
          if (!dates?.[0]) {
            return;
          }

          onChange?.([dates[0], dates[1] ?? null]);
        }}
      />
    </Flex>
  );
};
