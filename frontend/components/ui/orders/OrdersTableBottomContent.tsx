'use client';

import { Pagination } from '@nextui-org/react';
import { ChangeEvent } from 'react';
import { useAppContext } from '../../../contexts/AppContext';

const OrdersTableBottomContent = () => {
  const { page, setPage, pages, setRowsPerPage } = useAppContext();

  const onRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  return (
    <div>
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
