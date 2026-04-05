'use client';

import { Select, SelectItem } from '@nextui-org/react';
import { useAppContext } from '../../../contexts/AppContext';

const OrdersTableStatusFilter = () => {
  const { statusFilter, setStatusFilter, statusOptions } = useAppContext();
  const selectedStatus = typeof statusFilter === 'string' ? statusFilter : 'all';

  return (
    <Select
      className='max-w-xs'
      classNames={{ trigger: 'h-14 min-h-14' }}
      label='Filtrar estado'
      selectedKeys={[selectedStatus]}
      onChange={(event) => setStatusFilter(event.target.value)}
    >
      <SelectItem key='all'>Todos</SelectItem>
      {statusOptions.map((status: any) => (
        <SelectItem key={status.uid}>{status.name}</SelectItem>
      ))}
    </Select>
  );
};

export default OrdersTableStatusFilter;
