import type { PassengersState, SearchFormValues, ServiceClass } from '../model/types';
import { Alert, Button, Flex, Form } from 'antd';
import { useState } from 'react';
import { Search, Swap } from '@/shared/assets';
import { cn } from '@/shared/utils';
import {
  DEFAULT_DESTINATION_AIRPORT,
  DEFAULT_ORIGIN_AIRPORT,
  DEFAULT_PASSENGERS,
  DEFAULT_SERVICE_CLASS,
  getDefaultSearchFormValues,
} from '../model/consts';
import { AirportSelect } from './airport-select';
import { DateRangeSelect } from './date-range-select';
import { PassengerSelect } from './passenger-select';
import styles from './search-form.module.css';
import { TripTypeSelect } from './trip-type-select';

const DEFAULT_AIRPORT_OPTIONS = [DEFAULT_ORIGIN_AIRPORT, DEFAULT_DESTINATION_AIRPORT];

type SearchFormProps = {
  onSearch: (values: SearchFormValues) => void;
};

export const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [form] = Form.useForm<SearchFormValues>();

  const [tripTypeOpen, setTripTypeOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [passengersOpen, setPassengersOpen] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const passengers = Form.useWatch('passengers', { form, preserve: true }) ?? DEFAULT_PASSENGERS;

  const serviceClass =
    Form.useWatch('serviceClass', { form, preserve: true }) ?? DEFAULT_SERVICE_CLASS;

  const handleFinish = () => {
    const values = form.getFieldsValue(true) as SearchFormValues;
    onSearch(values);
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
          rules={[
            { required: true, message: '' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (value && value === getFieldValue('destinationAirport')) {
                  return Promise.reject(
                    setFormError('Лететь туда же, откуда взлетели? Это слишком просто!'),
                  );
                }
                return Promise.resolve(setFormError(null));
              },
            }),
          ]}
        >
          <AirportSelect
            label="Откуда"
            placeholder="Город вылета"
            initialOption={DEFAULT_ORIGIN_AIRPORT}
            initialOptions={DEFAULT_AIRPORT_OPTIONS}
            hasError={form.getFieldError('originAirport').length > 0}
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
          rules={[
            { required: true, message: '' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (value && value === getFieldValue('originAirport')) {
                  return Promise.reject(
                    setFormError('Лететь туда же, откуда взлетели? Это слишком просто!'),
                  );
                }
                return Promise.resolve(setFormError(null));
              },
            }),
          ]}
        >
          <AirportSelect
            label="Куда"
            placeholder="Город назначения"
            initialOption={DEFAULT_DESTINATION_AIRPORT}
            initialOptions={DEFAULT_AIRPORT_OPTIONS}
            hasError={form.getFieldError('destinationAirport').length > 0}
          />
        </Form.Item>
      </Flex>
      <Form.Item name="tripType">
        <TripTypeSelect open={tripTypeOpen} onOpenChange={setTripTypeOpen} />
      </Form.Item>
      <PassengerSelect
        open={passengersOpen}
        onOpenChange={setPassengersOpen}
        passengers={passengers}
        onPassengersChange={updatePassengers}
        serviceClass={serviceClass}
        onServiceClassChange={changeServiceClass}
      />
      <Form.Item
        name="dateRange"
        rules={[
          {
            validator: (_, value) => {
              if (!value || !value[0] || !value[1]) {
                return Promise.reject(setFormError('Похоже, вы забыли даты… А пилот уже ждет!'));
              }
              return Promise.resolve(setFormError(null));
            },
          },
        ]}
      >
        <DateRangeSelect
          open={datePickerOpen}
          onOpenChange={setDatePickerOpen}
          hasError={form.getFieldError('dateRange').length > 0}
        />
      </Form.Item>

      <Button htmlType="submit" style={{ height: '64px' }}>
        <Search className={styles.searchIcon} />
      </Button>
      {formError && <Alert type="info" showIcon title={formError} style={{ width: '100%' }} />}
    </Form>
  );
};
