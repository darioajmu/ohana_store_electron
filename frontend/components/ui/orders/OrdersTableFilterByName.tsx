import { Input } from '@nextui-org/react';
import { SearchIcon } from '../../icons';
import { useAppContext } from '../../../contexts/AppContext';

const OrdersTableFilterByName = () => {
  const { nameFilterValue, setNameFilterValue, setPage } = useAppContext();

  const onNameSearchChange = (value?: string) => {
    if (value) {
      setNameFilterValue(value);
      setPage(1);
    } else {
      setNameFilterValue('');
    }
  };

  return (
    <Input
      isClearable
      classNames={{
        base: 'sm:max-w-[20%]',
      }}
      placeholder='Filtrar por nombre...'
      startContent={<SearchIcon />}
      value={nameFilterValue}
      size='sm'
      variant='underlined'
      onClear={() => onNameSearchChange()}
      onValueChange={onNameSearchChange}
    />
  );
};

export default OrdersTableFilterByName;
