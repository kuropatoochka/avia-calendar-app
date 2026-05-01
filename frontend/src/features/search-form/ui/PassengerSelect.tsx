import { Flex, Popover } from 'antd';
import classNames from 'clsx';
import { ArrowDown, Person } from '@/shared/assets';
import { SERVICE_CLASS_LABELS } from '../consts/labels';
import type { PassengersState, ServiceClass } from '../types/searchForm';
import { getPassengerLabel } from '../utils/getPassengerLabel';
import { PassengerCounter } from './PassengerCounter';
import styles from './styles.module.css';

interface PassengerSelectProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  passengers: PassengersState;
  setPassengers: React.Dispatch<React.SetStateAction<PassengersState>>;
  serviceClasses: ServiceClass[];
  toggleServiceClass: (cls: ServiceClass) => void;
}

export const PassengerSelect = ({
  open,
  onOpenChange,
  passengers,
  setPassengers,
  serviceClasses,
  toggleServiceClass,
}: PassengerSelectProps) => {
  const content = (
    <Flex vertical gap={12} style={{ width: 280, padding: '4px 0' }}>
      <PassengerCounter
        label="Взрослые"
        value={passengers.adults}
        min={1}
        onChange={(v) => setPassengers((p) => ({ ...p, adults: v }))}
      />
      <PassengerCounter
        label="Дети"
        subLabel="2–11 лет"
        value={passengers.children}
        min={0}
        onChange={(v) => setPassengers((p) => ({ ...p, children: v }))}
      />
      <PassengerCounter
        label="Младенцы"
        subLabel="до 2 лет"
        value={passengers.toddler}
        min={0}
        onChange={(v) => setPassengers((p) => ({ ...p, toddler: v }))}
      />
      <PassengerCounter
        label="Животные"
        helpText="животных до 10 кг можно перевозить в салоне"
        value={passengers.animals}
        min={0}
        onChange={(v) => setPassengers((p) => ({ ...p, animals: v }))}
      />
      <div className={styles.passengersDivider} />
      <div className={styles.serviceClassSection}>
        <span className={styles.serviceClassTitle}>Класс обслуживания</span>
        <Flex gap={8}>
          {(Object.keys(SERVICE_CLASS_LABELS) as ServiceClass[]).map((cls) => (
            <button
              key={cls}
              type="button"
              className={classNames(styles.serviceClassBtn, {
                [styles.serviceClassBtnActive]: serviceClasses.includes(cls),
              })}
              onClick={() => toggleServiceClass(cls)}
            >
              {SERVICE_CLASS_LABELS[cls]}
            </button>
          ))}
        </Flex>
      </div>
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
      motion={{ motionName: '' }}
    >
      <div
        className={classNames(styles.controlBtnOuter, styles.controlBtnOuterPassengers)}
        role="button"
        tabIndex={0}
      >
        <div className={classNames(styles.controlBtn, styles.controlBtnPassengers)}>
          <Person className={styles.personIcon} />
          <span className={styles.controlBtnText}>{getPassengerLabel(passengers)}</span>
          <ArrowDown className={classNames(styles.arrowIcon, { [styles.arrowIconOpen]: open })} />
        </div>
      </div>
    </Popover>
  );
};
