import type { Dayjs } from 'dayjs';
import { DatePicker } from 'antd';
import classNames from 'clsx';
import dayjs from 'dayjs';
import { useState, useRef } from 'react';
import { ArrowDown } from '@/shared/assets';
import styles from './styles.module.css';

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
  const selectingRef = useRef(false);

  const label = value
    ? `${value[0].format('DD.MM')} — ${value[1].format('DD.MM')}`
    : 'Желаемые даты';

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div
      className={styles.controlBtnOuter}
      role="button"
      tabIndex={0}
      onClick={() => onOpenChange(true)}
    >
      <div
        className={classNames(styles.controlBtn, {
          [styles.controlBtnError]: hasError,
          [styles.controlBtnEmpty]: !value && !hasError,
        })}
      >
        <span className={styles.controlBtnText}>{label}</span>
        <ArrowDown className={classNames(styles.arrowIcon, { [styles.arrowIconOpen]: open })} />
      </div>
      <DatePicker.RangePicker
        className={styles.hiddenPicker}
        open={open}
        onOpenChange={onOpenChange}
        value={value}
        placement="bottomRight"
        onChange={(vals) => {
          selectingRef.current = false;
          onChange(vals as [Dayjs, Dayjs] | null);
        }}
        onCalendarChange={(vals) => {
          selectingRef.current = !!(vals?.[0] && !vals?.[1]);
        }}
        pickerValue={pickerValue}
        onPickerValueChange={(vals) => {
          if (!selectingRef.current && vals?.[0] && vals?.[1]) {
            setPickerValue([vals[0], vals[1]]);
          }
        }}
        panelRender={(panel) => (
          <div className={styles.calendarPanel}>
            <div className={styles.calendarResetRow}>
              <button
                type="button"
                className={classNames(styles.calendarResetBtn, {
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
