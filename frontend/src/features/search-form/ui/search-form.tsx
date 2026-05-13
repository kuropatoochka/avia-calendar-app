import { Search, Swap } from '@/shared/assets';
import { cn } from '@/shared/utils';
import { Button, Flex, Form } from 'antd';
import { useState } from 'react';
import {
  DEFAULT_DESTINATION_AIRPORT,
  DEFAULT_ORIGIN_AIRPORT,
  DEFAULT_PASSENGERS,
  DEFAULT_SERVICE_CLASS,
  getDefaultSearchFormValues,
} from '../model/consts';
import type { PassengersState, SearchFormValues, ServiceClass } from '../model/types';
import { AirportSelect } from './airport-select';
import { DateRangeSelect } from './date-range-select';
import { PassengerSelect } from './passenger-select';
import styles from './search-form.module.css';
import { TripTypeSelect } from './trip-type-select';

const DEFAULT_AIRPORT_OPTIONS = [DEFAULT_ORIGIN_AIRPORT, DEFAULT_DESTINATION_AIRPORT];

export const SearchForm = () => {
  const [form] = Form.useForm<SearchFormValues>();

  const [tripTypeOpen, setTripTypeOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [passengersOpen, setPassengersOpen] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  const passengers = Form.useWatch('passengers', { form, preserve: true }) ?? DEFAULT_PASSENGERS;

  const serviceClass =
    Form.useWatch('serviceClass', { form, preserve: true }) ?? DEFAULT_SERVICE_CLASS;

  const handleFinish = () => {
    const values = form.getFieldsValue(true) as SearchFormValues;

    console.log('Search form submit', {
      ...values,
      dateRange: [
        values.dateRange[0].format('YYYY-MM-DD'),
        values.dateRange[1]?.format('YYYY-MM-DD') ?? null,
      ],
    });
  };

  const handleSwap = () => {
    const originAirport = form.getFieldValue('originAirport');
    const destinationAirport = form.getFieldValue('destinationAirport');

    form.setFieldsValue({
      originAirport: destinationAirport,
      destinationAirport: originAirport,
    });

    setIsSwapped((prev) => !prev);
  };

  const updatePassengers = (nextPassengers: PassengersState) => {
    form.setFieldValue('passengers', nextPassengers);
  };

  const changeServiceClass = (nextServiceClass: ServiceClass) => {
    form.setFieldValue('serviceClass', nextServiceClass);
  };

  return (
    <Form
      form={form}
      className={styles.form}
      initialValues={getDefaultSearchFormValues()}
      onFinish={handleFinish}
    >
      <Flex gap={8} align="center">
        <Form.Item
          name="originAirport"
          rules={[{ required: true, message: 'Выберите город вылета' }]}
        >
          <AirportSelect
            label="Откуда"
            placeholder="Город вылета"
            initialOption={DEFAULT_ORIGIN_AIRPORT}
            initialOptions={DEFAULT_AIRPORT_OPTIONS}
          />
        </Form.Item>

        <Button
          type="link"
          icon={
            <Swap
              className={cn(styles.swapIcon, {
                [styles.swapIconRotated]: isSwapped,
              })}
            />
          }
          onClick={handleSwap}
        />

        <Form.Item
          name="destinationAirport"
          rules={[{ required: true, message: 'Выберите город назначения' }]}
        >
          <AirportSelect
            label="Куда"
            placeholder="Город назначения"
            initialOption={DEFAULT_DESTINATION_AIRPORT}
            initialOptions={DEFAULT_AIRPORT_OPTIONS}
          />
        </Form.Item>
      </Flex>

      <Form.Item name="tripType" rules={[{ required: true, message: 'Выберите тип маршрута' }]}>
        <TripTypeSelect open={tripTypeOpen} onOpenChange={setTripTypeOpen} />
      </Form.Item>

      <Form.Item
        name="dateRange"
        help={null}
        rules={[
          {
            validator: (_, value) => {
              if (!value?.[0] || !value?.[1]) {
                return Promise.reject(new Error(''));
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <DateRangeSelect open={datePickerOpen} onOpenChange={setDatePickerOpen} />
      </Form.Item>

      <PassengerSelect
        open={passengersOpen}
        onOpenChange={setPassengersOpen}
        passengers={passengers}
        onPassengersChange={updatePassengers}
        serviceClass={serviceClass}
        onServiceClassChange={changeServiceClass}
      />

      <Button htmlType="submit" style={{ height: '64px' }}>
        <Search className={styles.searchIcon} />
      </Button>
    </Form>
  );
};
