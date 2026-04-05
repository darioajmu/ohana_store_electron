import React, { FC, ReactNode, createContext, useContext, useState, useMemo } from 'react';
import { ProductEntity } from '../domain/entities/product/product.entity';
import { SortDescriptor } from '@nextui-org/react';

interface AppContextProps {
  ticketElements: any;
  setTicketElements: any;
  totalValue: any;
  setTotalValue: any;
  memberValue: any;
  setMemberValue: any;
  products: any;
  setProducts: any;
  payNow: any;
  setPayNow: any;
  payWithValue: any;
  setPayWithValue: any;
  stockableValue: any;
  setStockableValue: any;
  onStockableCheckboxChange: any;
  getTotalValue: any;
  calculateTotal: any;
  payWithTikisValue: any;
  setPayWithTikisValue: any;
  nameFilterValue: any;
  setNameFilterValue: any;
  newNameFilterValue: any;
  setNewNameFilterValue: any;
  startDate: any;
  setStartDate: any;
  endDate: any;
  setEndDate: any;
  statusOptions: any;
  statusFilter: any;
  setStatusFilter: any;
  orders: any;
  setOrders: any;
  page: any;
  setPage: any;
  setRowsPerPage: any;
  pages: any;
  filteredItems: any;
  sortDescriptor: any;
  setSortDescriptor: any;
  items: any;
  calculateRest: any;
  onPaidChange: any;
}

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider: FC<AppContextProviderProps> = ({ children }) => {
  const [ticketElements, setTicketElements] = useState(Array<any>);
  const [totalValue, setTotalValue] = useState(0);
  const [memberValue, setMemberValue] = useState(false);
  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [payNow, setPayNow] = useState(false);
  const [payWithValue, setPayWithValue] = useState(0);
  const [stockableValue, setStockableValue] = useState<any>(() => false);
  const [payWithTikisValue, setPayWithTikisValue] = useState<any>(() => false);
  const [nameFilterValue, setNameFilterValue] = useState('');
  const [newNameFilterValue, setNewNameFilterValue] = useState('');
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [statusFilter, setStatusFilter] = useState('false');
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const hasNameSearchFilter = Boolean(nameFilterValue);
  const hasNewNameSearchFilter = Boolean(newNameFilterValue);
  const hasDateSearchFilter = startDate && endDate;
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'date',
    direction: 'descending',
  });

  const statusOptions = [
    { name: 'Pagado', uid: 'true' },
    { name: 'Pendiente', uid: 'false' },
  ];

  const filteredItems = useMemo(() => {
    let filteredOrders = [...orders];

    if (hasNameSearchFilter) {
      filteredOrders = filteredOrders.filter((order) => {
        if (!order.debtor_name) return false;

        return order.debtor_name.toLowerCase().includes(nameFilterValue.toLowerCase());
      });
    }

    if (hasNewNameSearchFilter) {
      filteredOrders = filteredOrders.filter((order) => {
        if (!order.user_name) return false;

        return order.user_name.toLowerCase().includes(newNameFilterValue.toLowerCase());
      });
    }

    if (hasDateSearchFilter) {
      filteredOrders = filteredOrders.filter((order) => {
        const valid =
          new Date(order.date).setHours(0, 0, 0, 0) >= new Date(startDate).setHours(0, 0, 0, 0) &&
          new Date(order.date).setHours(0, 0, 0, 0) <= new Date(endDate).setHours(0, 0, 0, 0);

        return valid;
      });
    }

    if (statusFilter !== 'all') {
      filteredOrders = filteredOrders.filter((order) => String(order.paid) === statusFilter);
    }

    return filteredOrders;
  }, [
    orders,
    hasNameSearchFilter,
    hasNewNameSearchFilter,
    hasDateSearchFilter,
    statusFilter,
    statusOptions.length,
    nameFilterValue,
    newNameFilterValue,
    startDate,
    endDate,
  ]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const sortedItems = useMemo(() => {
    let first: any, second: any;
    return [...filteredItems].sort((a: any, b: any) => {
      if (sortDescriptor.column === 'date' && a.date === b.date && a.paid !== b.paid) {
        return a.paid ? 1 : -1;
      }

      if (sortDescriptor.column == 'total') {
        first = Number(a[sortDescriptor.column]);
        second = Number(b[sortDescriptor.column]);
      } else {
        first = a[sortDescriptor.column as keyof any] as string;
        second = b[sortDescriptor.column as keyof any] as string;
      }
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return sortedItems.slice(start, end);
  }, [page, sortedItems, rowsPerPage]);

  const onStockableCheckboxChange = (value: any): void => {
    setStockableValue(value.target.checked);
  };

  const getTotalValue = (elements: any[], membership: boolean): number => {
    return elements.reduce((temporaryTotal: number, ticketElement: any) => {
      return temporaryTotal + Number(ticketElement.price) * ticketElement.quantity;
    }, 0);
  };

  const calculateTotal = (membership: boolean): void => {
    setTotalValue(getTotalValue(ticketElements, membership));
  };

  const calculateRest = (value: any): number => {
    return value - totalValue;
  };

  const onPaidChange = (value: any): void => {
    setPayWithValue(value?.target?.valueAsNumber);
  };

  return (
    <AppContext.Provider
      value={{
        ticketElements,
        setTicketElements,
        totalValue,
        setTotalValue,
        memberValue,
        setMemberValue,
        products,
        setProducts,
        payNow,
        setPayNow,
        payWithValue,
        setPayWithValue,
        stockableValue,
        setStockableValue,
        onStockableCheckboxChange,
        getTotalValue,
        calculateTotal,
        payWithTikisValue,
        setPayWithTikisValue,
        nameFilterValue,
        setNameFilterValue,
        newNameFilterValue,
        setNewNameFilterValue,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        statusFilter,
        setStatusFilter,
        orders,
        setOrders,
        page,
        setPage,
        setRowsPerPage,
        pages,
        statusOptions,
        filteredItems,
        sortDescriptor,
        setSortDescriptor,
        items,
        calculateRest,
        onPaidChange,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe ser utilizado dentro de un AppContextProvider');
  }
  return context;
};
