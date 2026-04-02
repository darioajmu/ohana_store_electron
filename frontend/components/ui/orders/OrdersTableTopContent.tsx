'use client';

import OrdersTableDownloadButton from './OrdersTableDownloadButton';
import OrdersTableStatusFilter from './OrdersTableStatusFilter';
import OrdersTableFilterByName from './OrdersTableFilterByName';
import OrdersTableFilterByDates from './OrdersTableFilterByDates';
import { useAppContext } from '../../../contexts/AppContext';

const OrdersTableTopContent = () => {
  const { orders } = useAppContext();

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-3 items-start'>
        <OrdersTableFilterByName />
        <OrdersTableFilterByDates />
        <OrdersTableStatusFilter />
        <OrdersTableDownloadButton />
      </div>
      <div className='flex justify-between items-center'>
        <span className='text-default-400 text-small'>{orders.length} compras en total</span>
      </div>
    </div>
  );
};

export default OrdersTableTopContent;
