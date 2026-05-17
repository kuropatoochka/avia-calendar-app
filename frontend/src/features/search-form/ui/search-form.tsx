import type { SearchFormError, SearchFormErrorField, SearchFormValues } from '../model/types';
import { Alert, Button, Flex, Form, Input } from 'antd';
import { useState } from 'react';
import { Search, Swap } from '@/shared/assets';
import type { ServiceClass } from '@/shared/types';
import { cn } from '@/shared/utils';
import {
  DEFAULT_AIRPORT_OPTIONS,
  DEFAULT_SERVICE_CLASS,
  getDefaultSearchFormValues,
} from '../model/consts';
import { useAirportSelectOptions } from '../model/use-airport-select-options';
import { validateSearchFormValues } from '../model/validation';
import { AirportSelect } from './airport-select';
import { DateRangeSelect } from './date-range-select';
import { PassengerSelect } from './passenger-select';
import styles from './search-form.module.css';
import { TripTypeSelect } from './trip-type-select';

type Props = {
  onSearch: (values: SearchFormValues) => void;
};

export const SearchForm = ({ onSearch }: Props) => {
  const [form] = Form.useForm<SearchFormValues>();

  const [tripTypeOpen, setTripTypeOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [passengersOpen, setPassengersOpen] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  const [formError, setFormError] = useState<SearchFormError | null>(null);

  const {
    defaultAirportOptions,
    airportOptions,
    isAirportOptionsLoading,
    onAirportOptionsSearch,
    onAirportOptionsOpenChange,
  } = useAirportSelectOptions(DEFAULT_AIRPORT_OPTIONS);

  const serviceClass =
    Form.useWatch('serviceClass', { form, preserve: true }) ?? DEFAULT_SERVICE_CLASS;

  const handleChangeServiceClass = (nextServiceClass: ServiceClass) => {
    form.setFieldValue('serviceClass', nextServiceClass);
  };

  const handleValuesChange = () => {
    if (formError) {
      setFormError(null);
    }
  };

  const hasFieldError = (field: SearchFormErrorField) => {
    return formError?.fields.includes(field) ?? false;
  };

  const handleFinish = (values: SearchFormValues) => {
    const error = validateSearchFormValues(values, defaultAirportOptions);

    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    onSearch(values);
  };

  const handleSwap = () => {
    const originAirportId = form.getFieldValue('originAirportId');
    const destinationAirportId = form.getFieldValue('destinationAirportId');

    form.setFieldsValue({
      originAirportId: destinationAirportId,
      destinationAirportId: originAirportId,
    });

    setFormError(null);
    setIsSwapped((prev) => !prev);
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
        <Form.Item name="originAirportId" className={styles.airportItem}>
          <AirportSelect
            label="Откуда"
            placeholder="Город вылета"
            options={airportOptions}
            isLoading={isAirportOptionsLoading}
            onSearch={onAirportOptionsSearch}
            onOpenChange={onAirportOptionsOpenChange}
            hasError={hasFieldError('originAirportId')}
          />
        </Form.Item>

        <Button
          type="link"
          icon={<Swap className={cn(styles.swapIcon, { [styles.swapIconRotated]: isSwapped })} />}
          onClick={handleSwap}
        />

        <Form.Item name="destinationAirportId" className={styles.airportItem}>
          <AirportSelect
            label="Куда"
            placeholder="Город назначения"
            options={airportOptions}
            isLoading={isAirportOptionsLoading}
            onSearch={onAirportOptionsSearch}
            onOpenChange={onAirportOptionsOpenChange}
            hasError={hasFieldError('destinationAirportId')}
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
          onServiceClassChange={handleChangeServiceClass}
        />
      </Form.Item>

      <Form.Item name="serviceClass" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="dateRange" className={styles.dateItem}>
        <DateRangeSelect
          open={datePickerOpen}
          onOpenChange={setDatePickerOpen}
          hasError={hasFieldError('dateRange')}
        />
      </Form.Item>

      <Button htmlType="submit" className={cn(styles.field, styles.searchBtn)}>
        <Search className={styles.searchIcon} />
      </Button>

      {formError && (
        <Alert type="info" showIcon title={formError.message} className={styles.formAlert} />
      )}
    </Form>
  );
};
