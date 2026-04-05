import { DatePickerInput } from '@mantine/dates';
import { useAppContext } from '../../../contexts/AppContext';
import { datePickerInputStyles } from '../../../shared/styles/datePickerInputStyles';

const OrdersTableFilterByDates = () => {
  const { startDate, setStartDate, endDate, setEndDate } = useAppContext();

  const handleChange = (range: [Date | null, Date | null]) => {
    const [rangeStartDate, rangeEndDate] = range;
    setStartDate(rangeStartDate);
    setEndDate(rangeEndDate);
  };

  return (
    <DatePickerInput
      className='w-full max-w-xs sm:min-w-[22rem]'
      clearable
      dropdownType='popover'
      firstDayOfWeek={1}
      locale='es'
      placeholder='Filtrar por fechas'
      popoverProps={{ zIndex: 1000 }}
      styles={datePickerInputStyles}
      type='range'
      value={[startDate ?? null, endDate ?? null]}
      valueFormat='DD/MM/YYYY'
      onChange={handleChange}
    />
  );
};

export default OrdersTableFilterByDates;
