import type { PassengersState, ServiceClass } from '../model/types';
import { Flex, Popover } from 'antd';
import { ArrowDown, Person } from '@/shared/assets';
import { cn } from '@/shared/utils';
import { getPassengerLabel } from '../model/get-passenger-label';
import { SERVICE_CLASS_LABELS } from '../model/labels';
import { PassengerCounter } from './passenger-counter';
import styles from './search-form.module.css';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passengers: PassengersState;
  onPassengersChange: (passengers: PassengersState) => void;
  serviceClass: ServiceClass;
  onServiceClassChange: (serviceClass: ServiceClass) => void;
}

export const PassengerSelect = ({
  open,
  onOpenChange,
  passengers,
  onPassengersChange,
  serviceClass,
  onServiceClassChange,
}: Props) => {
  const updatePassengers = (nextPassengers: Partial<PassengersState>) => {
    onPassengersChange({
      ...passengers,
      ...nextPassengers,
    });
  };

  const content = (
    <Flex vertical gap={12} className={styles.passengersContent}>
      <PassengerCounter
        label="Взрослые"
        value={passengers.adults}
        min={1}
        onChange={(value) => updatePassengers({ adults: value })}
      />

      <PassengerCounter
        label="Дети"
        subLabel="2–11 лет"
        value={passengers.children}
        min={0}
        onChange={(value) => updatePassengers({ children: value })}
      />

      <PassengerCounter
        label="Младенцы"
        subLabel="до 2 лет"
        value={passengers.toddler}
        min={0}
        onChange={(value) => updatePassengers({ toddler: value })}
      />

      <PassengerCounter
        label="Животные"
        helpText="животных до 10 кг можно перевозить в салоне"
        value={passengers.animals}
        min={0}
        onChange={(value) => updatePassengers({ animals: value })}
      />

      <div className={styles.passengersDivider} />

      <Flex vertical gap={8}>
        <span className={styles.serviceClassTitle}>Класс обслуживания</span>

        <Flex gap={8}>
          {(Object.keys(SERVICE_CLASS_LABELS) as ServiceClass[]).map((item) => (
            <button
              key={item}
              type="button"
              className={cn(styles.serviceClassBtn, {
                [styles.serviceClassBtnActive]: serviceClass === item,
              })}
              onClick={() => onServiceClassChange(item)}
            >
              {SERVICE_CLASS_LABELS[item]}
            </button>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomLeft"
      open={open}
      onOpenChange={onOpenChange}
      arrow={false}
      align={{ offset: [0, 4] }}
    >
      <button
        type="button"
        className={cn(styles.controlBtnOuter, styles.controlBtnOuterPassengers)}
        aria-expanded={open}
      >
        <span className={cn(styles.controlBtn, styles.controlBtnPassengers)}>
          <span className={styles.personIcon} aria-hidden="true">
            <Person />
          </span>

          <span className={styles.controlBtnText}>{getPassengerLabel(passengers)}</span>

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
