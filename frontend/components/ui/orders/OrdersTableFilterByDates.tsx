import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAppContext } from '../../../contexts/AppContext';

const OrdersTableFilterByDates = () => {
  const { startDate, setStartDate, endDate, setEndDate } = useAppContext();

  const handleChange = (range: any) => {
    const [rangeStartDate, rangeEndDate] = range;
    setStartDate(rangeStartDate);
    setEndDate(rangeEndDate);
  };

  return (
    <DatePicker
      selected={startDate}
      onChange={handleChange}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      isClearable
      dateFormat={'dd/MM/YYYY'}
      className={'h-12 px-3 py-1 shadow-sm'}
      showIcon
    />
  );
};

export default OrdersTableFilterByDates;
