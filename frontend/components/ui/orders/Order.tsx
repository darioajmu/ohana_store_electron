'use client';

import { AppContextProvider } from '../../../contexts/AppContext';
import OrdersTable from './OrdersTable';

const Order = () => {
  return (
    <AppContextProvider>
      <OrdersTable />
    </AppContextProvider>
  );
};

export default Order;
