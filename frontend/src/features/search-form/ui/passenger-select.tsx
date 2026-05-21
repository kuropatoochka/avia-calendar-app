import type { PassengersState, ServiceClass } from '../model/types';
import { Button, Divider, Flex, Popover, Space, Typography } from 'antd';
import { ArrowDown, Person } from '@/shared/assets';
import { cn } from '@/shared/utils';
import { DEFAULT_PASSENGERS } from '../model/consts';
import { getPassengerLabel } from '../model/get-passenger-label';
import { SERVICE_CLASS_LABELS } from '../model/labels';
import { PassengerCounter } from './passenger-counter';
import styles from './search-form.module.css';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: PassengersState;
  onChange?: (passengers: PassengersState) => void;
  serviceClass: ServiceClass;
  onServiceClassChange: (serviceClass: ServiceClass) => void;
}

export const PassengerSelect = ({
  open,
  onOpenChange,
  value,
  onChange,
  serviceClass,
  onServiceClassChange,
}: Props) => {
  const passengers = value ?? DEFAULT_PASSENGERS;

  const updatePassengers = (nextPassengers: Partial<PassengersState>) => {
    onChange?.({
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
        onChange={(nextValue) => updatePassengers({ adults: nextValue })}
      />

      <PassengerCounter
        label="Дети"
        subLabel="2 – 11 лет"
        value={passengers.children}
        min={0}
        onChange={(nextValue) => updatePassengers({ children: nextValue })}
      />

      <PassengerCounter
        label="Младенцы"
        subLabel="до 2 лет"
        value={passengers.toddler}
        min={0}
        onChange={(nextValue) => updatePassengers({ toddler: nextValue })}
      />

      <PassengerCounter
        label="Животные в салоне"
        subLabel="до 10 кг"
        helpText="животных до 10 кг можно перевозить в салоне"
        value={passengers.animals}
        min={0}
        onChange={(nextValue) => updatePassengers({ animals: nextValue })}
      />

      <Divider style={{ margin: 0 }} />

      <Flex vertical gap={8}>
        <Typography.Text type="secondary">Класс обслуживания</Typography.Text>

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
    >
      <Button htmlType="button" className={styles.field}>
        <Flex gap={24} align="center">
          <Person className={styles.personIcon} />

          <Space vertical size={0} align="start">
            <Typography.Text className={styles.passengerText}>
              {getPassengerLabel(passengers)}
            </Typography.Text>

            <Typography.Text className={styles.passengerText}>
              {SERVICE_CLASS_LABELS[serviceClass]}
            </Typography.Text>
          </Space>

          <ArrowDown
            className={cn(styles.arrow, {
              [styles.arrowOpen]: open,
            })}
          />
        </Flex>
      </Button>
    </Popover>
  );
};
