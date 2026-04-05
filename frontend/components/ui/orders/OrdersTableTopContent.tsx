'use client';

import OrdersTableDownloadButton from './OrdersTableDownloadButton';
import OrdersTableStatusFilter from './OrdersTableStatusFilter';
import OrdersTableFilterByName from './OrdersTableFilterByName';
import OrdersTableFilterByNewName from './OrdersTableFilterByNewName';
import OrdersTableFilterByDates from './OrdersTableFilterByDates';
import OrdersTablePayDialog from './OrdersTablePayDialog';
import { useAppContext } from '../../../contexts/AppContext';

interface OrdersTableTopContentProps {
  onPaidSuccess?: () => void;
  selectedOrders: any[];
}

const OrdersTableTopContent = (props: OrdersTableTopContentProps) => {
  const { orders } = useAppContext();

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap gap-4 items-end'>
        <OrdersTableFilterByName />
        <OrdersTableFilterByNewName />
        <OrdersTableFilterByDates />
        <OrdersTableStatusFilter />
        <OrdersTableDownloadButton />
      </div>
      {props.selectedOrders.length ? (
        <div className='flex justify-start'>
          <OrdersTablePayDialog buttonLabel='Pagar seleccionadas' items={props.selectedOrders} onPaidSuccess={props.onPaidSuccess} />
        </div>
      ) : null}
      <div className='flex justify-between items-center'>
        <span className='text-default-400 text-small'>{orders.length} compras en total</span>
      </div>
    </div>
  );
};

export default OrdersTableTopContent;
