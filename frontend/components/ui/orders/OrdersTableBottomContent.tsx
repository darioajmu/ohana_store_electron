'use client';

import OrdersTablePayDialog from './OrdersTablePayDialog';
import { Pagination } from '@nextui-org/react';
import { ChangeEvent } from 'react';
import { useAppContext } from '../../../contexts/AppContext';

interface OrdersTableBottomContentProps {
  onPaidSuccess?: () => void;
  selectedOrders: any[];
}

const OrdersTableBottomContent = (props: OrdersTableBottomContentProps) => {
  const { page, setPage, pages, setRowsPerPage } = useAppContext();

  const onRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  return (
    <div>
      {props.selectedOrders.length ? (
        <div className='px-2 pb-2 flex justify-start'>
          <OrdersTablePayDialog buttonLabel='Pagar seleccionadas' items={props.selectedOrders} onPaidSuccess={props.onPaidSuccess} />
        </div>
      ) : null}
      <div className='py-2 px-2 justify-center flex items-center'>
        <Pagination isCompact showControls showShadow color='primary' page={page} total={pages} onChange={setPage} />
      </div>
      <div className='justify-center flex items-end'>
        <label className='text-default-400 text-small'>
          Filas por página:
          <select className='bg-transparent outline-none text-default-400 text-small' onChange={onRowsPerPageChange}>
            <option value='10'>10</option>
            <option value='15'>15</option>
            <option value='20'>20</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default OrdersTableBottomContent;
