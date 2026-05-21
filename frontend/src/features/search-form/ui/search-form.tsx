import type { SearchFormValues, ServiceClass } from '../model/types';
import type { SearchFormError, SearchFormErrorField } from '../model/validation';
import { Alert, Button, Flex, Form } from 'antd';
import { useState } from 'react';
import { Search, Swap } from '@/shared/assets';
import { cn } from '@/shared/utils';
import {
  DEFAULT_DESTINATION_AIRPORT,
  DEFAULT_ORIGIN_AIRPORT,
  DEFAULT_SERVICE_CLASS,
  getDefaultSearchFormValues,
} from '../model/consts';
import { validateSearchFormValues } from '../model/validation';
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
  const [formError, setFormError] = useState<SearchFormError | null>(null);

  const serviceClass =
    Form.useWatch('serviceClass', { form, preserve: true }) ?? DEFAULT_SERVICE_CLASS;

  const hasFieldError = (field: SearchFormErrorField) => {
    return formError?.fields.includes(field) ?? false;
  };

  const handleFinish = (values: SearchFormValues) => {
    const error = validateSearchFormValues(values);

    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    onSearch(values);
  };

  const handleValuesChange = () => {
    if (formError) {
      setFormError(null);
    }
  };

  const handleSwap = () => {
    const originAirport = form.getFieldValue('originAirport');
    const destinationAirport = form.getFieldValue('destinationAirport');

    form.setFieldsValue({
      originAirport: destinationAirport,
      destinationAirport: originAirport,
    });

    setFormError(null);
    setIsSwapped((prev) => !prev);
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
      onValuesChange={handleValuesChange}
    >
      <Flex gap={8} align="center" className={styles.routeGroup}>
        <Form.Item name="originAirport" className={styles.airportItem}>
          <AirportSelect
            label="Откуда"
            placeholder="Город вылета"
            initialOption={DEFAULT_ORIGIN_AIRPORT}
            initialOptions={DEFAULT_AIRPORT_OPTIONS}
            hasError={hasFieldError('originAirport')}
          />
        </Form.Item>

        <Button
          type="link"
          className={styles.swapBtn}
          icon={
            <Swap
              className={cn(styles.swapIcon, {
                [styles.swapIconRotated]: isSwapped,
              })}
            />
          }
          onClick={handleSwap}
        />

        <Form.Item name="destinationAirport" className={styles.airportItem}>
          <AirportSelect
            label="Куда"
            placeholder="Город назначения"
            initialOption={DEFAULT_DESTINATION_AIRPORT}
            initialOptions={DEFAULT_AIRPORT_OPTIONS}
            hasError={hasFieldError('destinationAirport')}
          />
        </Form.Item>
      </Flex>

      <Form.Item name="tripType" className={styles.tripTypeItem}>
        <TripTypeSelect open={tripTypeOpen} onOpenChange={setTripTypeOpen} />
      </Form.Item>

      <Form.Item name="passengers" className={styles.passengerItem}>
        <PassengerSelect
          open={passengersOpen}
          onOpenChange={setPassengersOpen}
          serviceClass={serviceClass}
          onServiceClassChange={changeServiceClass}
        />
      </Form.Item>

      <Form.Item name="dateRange" className={styles.dateItem}>
        <DateRangeSelect
          open={datePickerOpen}
          onOpenChange={setDatePickerOpen}
          hasError={hasFieldError('dateRange')}
        />
      </Form.Item>

      <Button htmlType="submit" className={styles.searchBtn} style={{ height: '64px' }}>
        <Search className={styles.searchIcon} />
      </Button>

      {formError && (
        <Alert type="info" showIcon title={formError.message} className={styles.formAlert} />
      )}
    </Form>
  );
};
