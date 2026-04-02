'use client';

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { FilterIcon } from '../../icons';
import { useAppContext } from '../../../contexts/AppContext';

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const OrdersTableStatusFilter = () => {
  const { statusFilter, setStatusFilter, statusOptions } = useAppContext();

  return (
    <Dropdown>
      <DropdownTrigger className='hidden sm:flex'>
        <Button color='primary' endContent={<FilterIcon className='text-small' />} size='lg'>
          Estado
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label='Columnas'
        closeOnSelect={false}
        selectedKeys={statusFilter}
        selectionMode='multiple'
        onSelectionChange={setStatusFilter}
      >
        {statusOptions.map((status: any) => (
          <DropdownItem key={status.uid} className='capitalize'>
            {capitalize(status.name)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default OrdersTableStatusFilter;
