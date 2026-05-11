import type { Dayjs } from 'dayjs';
import type { MouseEvent } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { ArrowDown } from '@/shared/assets';
import { cn } from '@/shared/utils';
import styles from './search-form.module.css';

interface DateRangeSelectProps {
  value: [Dayjs, Dayjs] | null;
  open: boolean;
  hasError?: boolean;
  onOpenChange: (v: boolean) => void;
  onChange: (val: [Dayjs, Dayjs] | null) => void;
}

export const DateRangeSelect = ({
  value,
  open,
  hasError,
  onOpenChange,
  onChange,
}: DateRangeSelectProps) => {
  const [pickerValue, setPickerValue] = useState<[Dayjs, Dayjs]>([
    dayjs(),
    dayjs().add(1, 'month'),
  ]);

  const dateClickingRef = useRef(false);

  const label = value
    ? `${value[0].format('DD.MM')} — ${value[1].format('DD.MM')}`
    : 'Желаемые даты';

  const handleReset = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange(null);
  };

  return (
    <div className={styles.controlWrapper}>
      <button
        type="button"
        className={styles.controlBtnOuter}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(true)}
      >
        <span
          className={cn(styles.controlBtn, {
            [styles.controlBtnError]: hasError,
            [styles.controlBtnEmpty]: !value && !hasError,
          })}
        >
          <span className={styles.controlBtnText}>{label}</span>

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

      <DatePicker.RangePicker
        className={styles.hiddenPicker}
        open={open}
        onOpenChange={onOpenChange}
        value={value}
        placement="bottomRight"
        onChange={(values) => {
          onChange(values as [Dayjs, Dayjs] | null);
        }}
        onCalendarChange={() => {
          dateClickingRef.current = false;
        }}
        pickerValue={pickerValue}
        onPickerValueChange={(values) => {
          if (!dateClickingRef.current && values?.[0] && values?.[1]) {
            setPickerValue([values[0], values[1]]);
          }
        }}
        panelRender={(panel) => (
          <div
            className={styles.calendarPanel}
            onMouseDown={(event) => {
              if ((event.target as HTMLElement).closest('.ant-picker-cell')) {
                dateClickingRef.current = true;
              }
            }}
          >
            <div className={styles.calendarResetRow}>
              <button
                type="button"
                className={cn(styles.calendarResetBtn, {
                  [styles.calendarResetBtnDisabled]: !value,
                })}
                disabled={!value}
                onClick={handleReset}
              >
                Сбросить даты
              </button>
            </div>

            {panel}
          </div>
        )}
      />
    </div>
  );
};
