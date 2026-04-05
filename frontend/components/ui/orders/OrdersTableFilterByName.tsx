import { Input } from '@nextui-org/react';
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
      className='max-w-xs'
      isClearable
      classNames={{ inputWrapper: 'h-14 min-h-14' }}
      label='Buscar por nombre'
      value={nameFilterValue}
      onValueChange={onNameSearchChange}
      onClear={() => onNameSearchChange()}
    />
  );
};

export default OrdersTableFilterByName;
